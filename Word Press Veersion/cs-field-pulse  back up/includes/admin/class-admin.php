<?php
/**
 * Admin class.
 *
 * Handles admin area functionality.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Admin {

    /**
     * The plugin version.
     *
     * @var string
     */
    private $version;

    /**
     * Constructor.
     *
     * @param string $version The plugin version.
     */
    public function __construct($version) {
        $this->version = $version;
    }

    /**
     * Register the stylesheets for the admin area.
     */
    public function enqueue_styles() {
        // Define URL if not already defined
        if (!defined('CS_FIELD_PULSE_URL')) {
            define('CS_FIELD_PULSE_URL', plugin_dir_url(dirname(dirname(__FILE__))));
        }
        
        wp_enqueue_style(
            'cs-field-pulse-admin',
            CS_FIELD_PULSE_URL . 'assets/css/admin-style.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts() {
        // Define URL if not already defined
        if (!defined('CS_FIELD_PULSE_URL')) {
            define('CS_FIELD_PULSE_URL', plugin_dir_url(dirname(dirname(__FILE__))));
        }
        
        wp_enqueue_script(
            'cs-field-pulse-admin',
            CS_FIELD_PULSE_URL . 'assets/js/admin.js',
            array('jquery'),
            $this->version,
            false
        );

        $current_screen = get_current_screen();
        
        // Load specific scripts based on the admin page
        if (strpos($current_screen->id, 'cs-field-pulse_page_inspector') !== false) {
            wp_enqueue_script(
                'cs-field-pulse-inspector-manager',
                CS_FIELD_PULSE_URL . 'assets/js/inspector-manager.js',
                array('jquery'),
                $this->version,
                false
            );
        } elseif (strpos($current_screen->id, 'cs-field-pulse_page_visit') !== false) {
            wp_enqueue_script(
                'cs-field-pulse-visit-manager',
                CS_FIELD_PULSE_URL . 'assets/js/visit-manager.js',
                array('jquery'),
                $this->version,
                false
            );
        } elseif (strpos($current_screen->id, 'toplevel_page_cs-field-pulse') !== false) {
            wp_enqueue_script(
                'cs-field-pulse-dashboard',
                CS_FIELD_PULSE_URL . 'assets/js/dashboard.js',
                array('jquery'),
                $this->version,
                false
            );
        }

        // Add localized script data
        wp_localize_script('cs-field-pulse-admin', 'cs_field_pulse', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('cs_field_pulse_nonce')
        ));
    }

    /**
     * Register the admin menu pages.
     */
    public function register_menu_pages() {
        // Main menu
        add_menu_page(
            __('CS Field Pulse', 'cs-field-pulse'),
            __('CS Field Pulse', 'cs-field-pulse'),
            'manage_options',
            'cs-field-pulse',
            array($this, 'display_dashboard_page'),
            'dashicons-chart-line',
            30
        );

        // Dashboard submenu (duplicate of main menu)
        add_submenu_page(
            'cs-field-pulse',
            __('Dashboard', 'cs-field-pulse'),
            __('Dashboard', 'cs-field-pulse'),
            'manage_options',
            'cs-field-pulse',
            array($this, 'display_dashboard_page')
        );

        // Inspectors submenu
        add_submenu_page(
            'cs-field-pulse',
            __('Inspectors', 'cs-field-pulse'),
            __('Inspectors', 'cs-field-pulse'),
            'manage_options',
            'cs-field-pulse-inspectors',
            array($this, 'display_inspectors_page')
        );

        // Visits submenu
        add_submenu_page(
            'cs-field-pulse',
            __('Visits', 'cs-field-pulse'),
            __('Visits', 'cs-field-pulse'),
            'manage_options',
            'cs-field-pulse-visits',
            array($this, 'display_visits_page')
        );

        // Settings submenu
        add_submenu_page(
            'cs-field-pulse',
            __('Settings', 'cs-field-pulse'),
            __('Settings', 'cs-field-pulse'),
            'manage_options',
            'cs-field-pulse-settings',
            array($this, 'display_settings_page')
        );
    }

    /**
     * Display the dashboard page.
     */
    public function display_dashboard_page() {
        if (!defined('CS_FIELD_PULSE_DIR')) {
            define('CS_FIELD_PULSE_DIR', plugin_dir_path(dirname(dirname(__FILE__))));
        }
        
        $dashboard = new CS_Field_Pulse_Dashboard();
        include CS_FIELD_PULSE_DIR . 'templates/admin/dashboard.php';
    }

    /**
     * Display the inspectors page.
     */
    public function display_inspectors_page() {
        if (!defined('CS_FIELD_PULSE_DIR')) {
            define('CS_FIELD_PULSE_DIR', plugin_dir_path(dirname(dirname(__FILE__))));
        }
        
        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : 'list';
        $inspector_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        $inspector_manager = new CS_Field_Pulse_Inspector_Manager();
        
        if ($action === 'edit' || $action === 'add') {
            include CS_FIELD_PULSE_DIR . 'templates/admin/inspector-edit.php';
        } else {
            include CS_FIELD_PULSE_DIR . 'templates/admin/inspector-list.php';
        }
    }

    /**
     * Display the visits page.
     */
    public function display_visits_page() {
        if (!defined('CS_FIELD_PULSE_DIR')) {
            define('CS_FIELD_PULSE_DIR', plugin_dir_path(dirname(dirname(__FILE__))));
        }
        
        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : 'list';
        $visit_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        $visit_manager = new CS_Field_Pulse_Visit_Manager();
        
        if ($action === 'edit' || $action === 'add') {
            include CS_FIELD_PULSE_DIR . 'templates/admin/visit-edit.php';
        } else {
            include CS_FIELD_PULSE_DIR . 'templates/admin/visit-list.php';
        }
    }

    /**
     * Display the settings page.
     */
    public function display_settings_page() {
        if (!defined('CS_FIELD_PULSE_DIR')) {
            define('CS_FIELD_PULSE_DIR', plugin_dir_path(dirname(dirname(__FILE__))));
        }
        
        $settings = new CS_Field_Pulse_Settings();
        include CS_FIELD_PULSE_DIR . 'templates/admin/settings.php';
    }

    /**
     * Register AJAX handlers.
     */
    public function register_ajax_handlers() {
        // Inspector API AJAX handlers
        add_action('wp_ajax_cs_field_pulse_get_inspectors', array('CS_Field_Pulse_Inspector_API', 'get_inspectors'));
        add_action('wp_ajax_cs_field_pulse_get_inspector', array('CS_Field_Pulse_Inspector_API', 'get_inspector'));
        add_action('wp_ajax_cs_field_pulse_create_inspector', array('CS_Field_Pulse_Inspector_API', 'create_inspector'));
        add_action('wp_ajax_cs_field_pulse_update_inspector', array('CS_Field_Pulse_Inspector_API', 'update_inspector'));
        add_action('wp_ajax_cs_field_pulse_delete_inspector', array('CS_Field_Pulse_Inspector_API', 'delete_inspector'));

        // Visit API AJAX handlers
        add_action('wp_ajax_cs_field_pulse_get_visits', array('CS_Field_Pulse_Visit_API', 'get_visits'));
        add_action('wp_ajax_cs_field_pulse_get_visit', array('CS_Field_Pulse_Visit_API', 'get_visit'));
        add_action('wp_ajax_cs_field_pulse_create_visit', array('CS_Field_Pulse_Visit_API', 'create_visit'));
        add_action('wp_ajax_cs_field_pulse_update_visit', array('CS_Field_Pulse_Visit_API', 'update_visit'));
        add_action('wp_ajax_cs_field_pulse_delete_visit', array('CS_Field_Pulse_Visit_API', 'delete_visit'));

        // Report API AJAX handlers
        add_action('wp_ajax_cs_field_pulse_get_dashboard_data', array('CS_Field_Pulse_Report_API', 'get_dashboard_data'));
        add_action('wp_ajax_cs_field_pulse_get_inspector_performance', array('CS_Field_Pulse_Report_API', 'get_inspector_performance'));
        add_action('wp_ajax_cs_field_pulse_get_visit_statistics', array('CS_Field_Pulse_Report_API', 'get_visit_statistics'));
    }
}