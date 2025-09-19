<?php
/**
 * Visit Manager
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Visit_Manager {

    /**
     * Visit model.
     *
     * @var CS_Field_Pulse_Visit
     */
    private $visit;

    /**
     * Inspector model.
     *
     * @var CS_Field_Pulse_Inspector
     */
    private $inspector;

    /**
     * Constructor.
     */
    public function __construct() {
        $this->visit = new CS_Field_Pulse_Visit();
        $this->inspector = new CS_Field_Pulse_Inspector();
        
        // Add actions for admin menu and AJAX handlers
        add_action('admin_menu', array($this, 'register_submenu'), 20);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Register the visit management submenu.
     */
    public function register_submenu() {
        add_submenu_page(
            'cs-field-pulse',
            __('Visits', 'cs-field-pulse'),
            __('Visits', 'cs-field-pulse'),
            'manage_options',
            'cs-field-pulse-visits',
            array($this, 'render_page')
        );
    }

    /**
     * Enqueue scripts and styles.
     */
    public function enqueue_scripts($hook) {
        if ($hook !== 'cs-field-pulse_page_cs-field-pulse-visits') {
            return;
        }

        wp_enqueue_script(
            'cs-field-pulse-visit-manager',
            plugin_dir_url(dirname(dirname(__FILE__))) . 'assets/js/visit-manager.js',
            array('jquery'),
            defined('CS_FIELD_PULSE_VERSION') ? CS_FIELD_PULSE_VERSION : '1.0.0',
            true
        );

        wp_localize_script(
            'cs-field-pulse-visit-manager',
            'cs_field_pulse_visits',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('cs_field_pulse_visits_nonce')
            )
        );

        wp_enqueue_style(
            'cs-field-pulse-admin',
            plugin_dir_url(dirname(dirname(__FILE__))) . 'assets/css/admin-style.css',
            array(),
            defined('CS_FIELD_PULSE_VERSION') ? CS_FIELD_PULSE_VERSION : '1.0.0'
        );
    }

    /**
     * Render the visits page based on the current action.
     */
    public function render_page() {
        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : 'list';

        switch ($action) {
            case 'add':
                $this->render_add_page();
                break;
            case 'edit':
                $this->render_edit_page();
                break;
            default:
                $this->render_list_page();
                break;
        }
    }

    /**
     * Get all visits for the visits list.
     *
     * @return array Array of visit objects with inspector data.
     */
    public function get_visits() {
        return $this->visit->get_with_inspector_data();
    }
    
    /**
     * Render the visit list page.
     */
    private function render_list_page() {
        include plugin_dir_path(dirname(dirname(__FILE__))) . 'templates/admin/visit-list.php';
    }

    /**
     * Render the add visit page.
     */
    private function render_add_page() {
        // Get all inspectors for dropdown
        $inspectors = $this->inspector->get_all();
        include plugin_dir_path(dirname(dirname(__FILE__))) . 'templates/admin/visit-edit.php';
    }

    /**
     * Render the edit visit page.
     */
    private function render_edit_page() {
        $visit_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if (!$visit_id) {
            wp_redirect(admin_url('admin.php?page=cs-field-pulse-visits'));
            exit;
        }
        
        $visit = $this->visit->get($visit_id);
        
        if (!$visit) {
            wp_redirect(admin_url('admin.php?page=cs-field-pulse-visits'));
            exit;
        }
        
        // Get all inspectors for dropdown
        $inspectors = $this->inspector->get_all();
        
        include plugin_dir_path(dirname(dirname(__FILE__))) . 'templates/admin/visit-edit.php';
    }
}