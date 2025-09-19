<?php
/**
 * Inspector API class.
 *
 * Handles inspector CRUD operations.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Inspector_API {

    /**
     * Constructor to add AJAX handlers.
     */
    public function __construct() {
        // Register AJAX handlers
        add_action('wp_ajax_cs_field_pulse_get_inspectors', array('CS_Field_Pulse_Inspector_API', 'get_inspectors'));
        add_action('wp_ajax_cs_field_pulse_get_inspector', array('CS_Field_Pulse_Inspector_API', 'get_inspector'));
        add_action('wp_ajax_cs_field_pulse_create_inspector', array('CS_Field_Pulse_Inspector_API', 'create_inspector'));
        add_action('wp_ajax_cs_field_pulse_update_inspector', array('CS_Field_Pulse_Inspector_API', 'update_inspector'));
        add_action('wp_ajax_cs_field_pulse_delete_inspector', array('CS_Field_Pulse_Inspector_API', 'delete_inspector'));
        add_action('wp_ajax_cs_field_pulse_get_inspector_performance_trend', array('CS_Field_Pulse_Inspector_API', 'get_inspector_performance_trend'));
        add_action('wp_ajax_cs_field_pulse_get_inspector_visits', array('CS_Field_Pulse_Inspector_API', 'get_inspector_visits'));
        add_action('wp_ajax_cs_field_pulse_get_or_create_inspector', array('CS_Field_Pulse_Inspector_API', 'get_or_create_inspector'));
    }

    /**
     * Get inspectors.
     */
    public static function get_inspectors() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $inspector = new CS_Field_Pulse_Inspector();
        
        $args = array();
        
        if (isset($_POST['orderby'])) {
            $args['orderby'] = sanitize_text_field($_POST['orderby']);
        }
        
        if (isset($_POST['order'])) {
            $args['order'] = sanitize_text_field($_POST['order']);
        }
        
        if (isset($_POST['limit'])) {
            $args['limit'] = intval($_POST['limit']);
        }
        
        if (isset($_POST['offset'])) {
            $args['offset'] = intval($_POST['offset']);
        }
        
        if (isset($_POST['search']) && !empty($_POST['search'])) {
            $inspectors = $inspector->search(sanitize_text_field($_POST['search']), $args);
        } else {
            $inspectors = $inspector->get_all($args);
        }
        
        wp_send_json_success($inspectors);
    }

    /**
     * Get a single inspector.
     */
    public static function get_inspector() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        
        if (!$inspector_id) {
            wp_send_json_error(__('Invalid inspector ID', 'cs-field-pulse'));
        }
        
        $inspector_manager = new CS_Field_Pulse_Inspector_Manager();
        $inspector = $inspector_manager->get_inspector_with_visit_data($inspector_id);
        
        if (!$inspector) {
            wp_send_json_error(__('Inspector not found', 'cs-field-pulse'));
        }
        
        wp_send_json_success($inspector);
    }

    /**
     * Create a new inspector.
     */
    public static function create_inspector() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('You do not have permission to do this', 'cs-field-pulse'));
        }
        
        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? sanitize_text_field($_POST['phone']) : '';
        $location = isset($_POST['location']) ? sanitize_text_field($_POST['location']) : '';
        $classification = isset($_POST['classification']) ? sanitize_text_field($_POST['classification']) : 'passive';
        $notes = isset($_POST['notes']) ? wp_kses_post($_POST['notes']) : '';
        
        if (empty($name)) {
            wp_send_json_error(__('Name is required', 'cs-field-pulse'));
        }
        
        $inspector = new CS_Field_Pulse_Inspector();
        
        $data = array(
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'location' => $location,
            'classification' => $classification,
            'notes' => $notes
        );
        
        $inspector_id = $inspector->create($data);
        
        if (!$inspector_id) {
            wp_send_json_error(__('Failed to create inspector', 'cs-field-pulse'));
        }
        
        wp_send_json_success(array(
            'id' => $inspector_id,
            'message' => __('Inspector created successfully', 'cs-field-pulse')
        ));
    }

    /**
     * Update an inspector.
     */
    public static function update_inspector() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('You do not have permission to do this', 'cs-field-pulse'));
        }
        
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        
        if (!$inspector_id) {
            wp_send_json_error(__('Invalid inspector ID', 'cs-field-pulse'));
        }
        
        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? sanitize_text_field($_POST['phone']) : '';
        $location = isset($_POST['location']) ? sanitize_text_field($_POST['location']) : '';
        $classification = isset($_POST['classification']) ? sanitize_text_field($_POST['classification']) : 'passive';
        $notes = isset($_POST['notes']) ? wp_kses_post($_POST['notes']) : '';
        
        if (empty($name)) {
            wp_send_json_error(__('Name is required', 'cs-field-pulse'));
        }
        
        $inspector = new CS_Field_Pulse_Inspector();
        
        $data = array(
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'location' => $location,
            'classification' => $classification,
            'notes' => $notes
        );
        
        $result = $inspector->update($inspector_id, $data);
        
        if ($result === false) {
            wp_send_json_error(__('Failed to update inspector', 'cs-field-pulse'));
        }
        
        wp_send_json_success(array(
            'message' => __('Inspector updated successfully', 'cs-field-pulse')
        ));
    }

    /**
     * Delete an inspector.
     */
    public static function delete_inspector() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('You do not have permission to do this', 'cs-field-pulse'));
        }
        
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        
        if (!$inspector_id) {
            wp_send_json_error(__('Invalid inspector ID', 'cs-field-pulse'));
        }
        
        $inspector = new CS_Field_Pulse_Inspector();
        $result = $inspector->delete($inspector_id);
        
        if ($result === false) {
            wp_send_json_error(__('Failed to delete inspector', 'cs-field-pulse'));
        }
        
        wp_send_json_success(array(
            'message' => __('Inspector deleted successfully', 'cs-field-pulse')
        ));
    }

    /**
     * Get inspector performance trend.
     */
    public static function get_inspector_performance_trend() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        $months = isset($_POST['months']) ? intval($_POST['months']) : 6;
        
        if (!$inspector_id) {
            wp_send_json_error(__('Invalid inspector ID', 'cs-field-pulse'));
        }
        
        $dashboard = new CS_Field_Pulse_Dashboard();
        $trend_data = $dashboard->get_inspector_performance_trend($inspector_id, $months);
        
        wp_send_json_success($trend_data);
    }

    /**
     * Get inspector visits.
     */
    public static function get_inspector_visits() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        
        if (!$inspector_id) {
            wp_send_json_error(__('Invalid inspector ID', 'cs-field-pulse'));
        }
        
        $visit = new CS_Field_Pulse_Visit();
        $visits = $visit->get_by_inspector($inspector_id);
        
        wp_send_json_success($visits);
    }

    /**
     * Get or create inspector by name.
     */
    public static function get_or_create_inspector() {
        // Check nonce for security
        check_ajax_referer('cs_field_pulse_visits_nonce', 'nonce');
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied', 'cs-field-pulse')));
            return;
        }
        
        // Check if name is provided
        if (!isset($_POST['name']) || empty($_POST['name'])) {
            wp_send_json_error(array('message' => __('Inspector name is required', 'cs-field-pulse')));
            return;
        }
        
        $name = sanitize_text_field($_POST['name']);
        
        global $wpdb;
        $prefix = $wpdb->prefix;
        
        try {
            // First check if an inspector with this name already exists
            $existing_inspector = $wpdb->get_row($wpdb->prepare(
                "SELECT id FROM {$prefix}cs_inspectors WHERE name = %s",
                $name
            ));
            
            if ($existing_inspector) {
                // Return the existing inspector ID
                wp_send_json_success(array(
                    'inspector_id' => $existing_inspector->id,
                    'message' => __('Found existing inspector', 'cs-field-pulse')
                ));
                return;
            }
            
            // If no existing inspector, create a new one
            $inspector = new CS_Field_Pulse_Inspector();
            
            $data = array(
                'name' => $name,
                'classification' => 'passive' // Default classification
            );
            
            $inspector_id = $inspector->create($data);
            
            if (!$inspector_id) {
                wp_send_json_error(array('message' => __('Failed to create inspector', 'cs-field-pulse')));
                return;
            }
            
            wp_send_json_success(array(
                'inspector_id' => $inspector_id,
                'message' => __('Created new inspector', 'cs-field-pulse')
            ));
            
        } catch (Exception $e) {
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
}

// Initialize the API
new CS_Field_Pulse_Inspector_API();
