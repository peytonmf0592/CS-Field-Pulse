<?php
/**
 * Inspector Manager class.
 *
 * Handles inspector management in the admin area.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Inspector_Manager {

    /**
     * Inspector model.
     *
     * @var CS_Field_Pulse_Inspector
     */
    private $inspector;

    /**
     * Visit model.
     *
     * @var CS_Field_Pulse_Visit
     */
    private $visit;

    /**
     * Constructor.
     */
    public function __construct() {
        $this->inspector = new CS_Field_Pulse_Inspector();
        $this->visit = new CS_Field_Pulse_Visit();
        
        add_action('admin_init', array($this, 'process_form_submission'));
    }

    /**
     * Process form submission.
     */
    public function process_form_submission() {
        if (!isset($_POST['cs_field_pulse_inspector_nonce'])) {
            return;
        }

        if (!wp_verify_nonce($_POST['cs_field_pulse_inspector_nonce'], 'cs_field_pulse_inspector')) {
            wp_die(__('Security check failed', 'cs-field-pulse'));
        }

        $action = isset($_POST['action']) ? sanitize_text_field($_POST['action']) : '';

        if ($action === 'create' || $action === 'update') {
            $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
            
            $data = array(
                'name' => sanitize_text_field($_POST['name']),
                'email' => sanitize_email($_POST['email']),
                'phone' => sanitize_text_field($_POST['phone']),
                'location' => sanitize_text_field($_POST['location']),
                'classification' => sanitize_text_field($_POST['classification']),
                'notes' => wp_kses_post($_POST['notes'])
            );

            if ($action === 'create') {
                $inspector_id = $this->inspector->create($data);
                
                if ($inspector_id) {
                    wp_redirect(add_query_arg(
                        array(
                            'page' => 'cs-field-pulse-inspectors',
                            'message' => 'created'
                        ),
                        admin_url('admin.php')
                    ));
                    exit;
                }
            } elseif ($action === 'update') {
                $result = $this->inspector->update($inspector_id, $data);
                
                if ($result !== false) {
                    wp_redirect(add_query_arg(
                        array(
                            'page' => 'cs-field-pulse-inspectors',
                            'message' => 'updated'
                        ),
                        admin_url('admin.php')
                    ));
                    exit;
                }
            }
        } elseif ($action === 'delete' && isset($_POST['inspector_id'])) {
            $inspector_id = intval($_POST['inspector_id']);
            $this->inspector->delete($inspector_id);
            
            wp_redirect(add_query_arg(
                array(
                    'page' => 'cs-field-pulse-inspectors',
                    'message' => 'deleted'
                ),
                admin_url('admin.php')
            ));
            exit;
        }
    }

    /**
     * Get inspectors.
     *
     * @param array $args Query arguments.
     * @return array The inspectors.
     */
    public function get_inspectors($args = array()) {
        return $this->inspector->get_all($args);
    }

    /**
     * Get inspector data by ID.
     *
     * @param int $id The inspector ID.
     * @return object|false The inspector data or false if not found.
     */
    public function get_inspector($id) {
        return $this->inspector->get_by_id($id);
    }

    /**
     * Get inspector visits.
     *
     * @param int $inspector_id The inspector ID.
     * @param array $args Additional query arguments.
     * @return array The visits.
     */
    public function get_inspector_visits($inspector_id, $args = array()) {
        return $this->visit->get_by_inspector($inspector_id, $args);
    }

    /**
     * Get inspector with visit data.
     *
     * @param int $id The inspector ID.
     * @return object The inspector with visit data.
     */
    public function get_inspector_with_visit_data($id) {
        global $wpdb;
        
        $inspector = $this->inspector->get_by_id($id);
        
        if (!$inspector) {
            return false;
        }
        
        // Get visit statistics
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        
        $query = $wpdb->prepare(
            "SELECT 
                COUNT(*) as total_visits,
                SUM(CASE WHEN classification = 'promoter' THEN 1 ELSE 0 END) as promoter_visits,
                SUM(CASE WHEN classification = 'passive' THEN 1 ELSE 0 END) as passive_visits,
                SUM(CASE WHEN classification = 'detractor' THEN 1 ELSE 0 END) as detractor_visits,
                MAX(visit_date) as last_visit_date
            FROM {$visits_table}
            WHERE inspector_id = %d",
            $id
        );
        
        $visit_stats = $wpdb->get_row($query);
        
        // Combine data
        $inspector_data = (array) $inspector;
        $inspector_data['visit_stats'] = $visit_stats;
        
        return (object) $inspector_data;
    }

    /**
     * Search inspectors.
     *
     * @param string $search The search term.
     * @param array $args Additional query arguments.
     * @return array The search results.
     */
    public function search_inspectors($search, $args = array()) {
        return $this->inspector->search($search, $args);
    }

    /**
     * Get classification counts.
     *
     * @return array The classification counts.
     */
    public function get_classification_counts() {
        return $this->inspector->get_classification_distribution();
    }
}