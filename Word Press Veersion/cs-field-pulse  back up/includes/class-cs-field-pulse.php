<?php
/**
 * The main plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse {
    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @var      object    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * The current version of the plugin.
     *
     * @var string $version The current version of the plugin.
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     */
    public function __construct() {
        $this->version = CS_FIELD_PULSE_VERSION;
        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
    }

    /**
     * Load the required dependencies for this plugin.
     */
    private function load_dependencies() {
        // Database manager
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-db-manager.php';

        // Models
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/models/class-inspector.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/models/class-visit.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/models/class-evaluation.php';

        // Admin
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/admin/class-admin.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/admin/class-settings.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/admin/class-inspector-manager.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/admin/class-visit-manager.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/admin/class-dashboard.php';

        // API
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/api/class-inspector-api.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/api/class-visit-api.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/api/class-report-api.php';
    }

    /**
     * Define the locale for this plugin for internationalization.
     */
    private function set_locale() {
        add_action('plugins_loaded', function() {
            load_plugin_textdomain(
                'cs-field-pulse',
                false,
                dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
            );
        });
    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     */
    private function define_admin_hooks() {
        $admin = new CS_Field_Pulse_Admin($this->get_version());
        
        // Register admin hooks
        add_action('admin_enqueue_scripts', array($admin, 'enqueue_styles'));
        add_action('admin_enqueue_scripts', array($admin, 'enqueue_scripts'));
        add_action('admin_menu', array($admin, 'register_menu_pages'));
    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     */
    public function run() {
        // Initialize the plugin
        
        // Register AJAX handlers
        if (class_exists('CS_Field_Pulse_Admin')) {
            $admin = new CS_Field_Pulse_Admin($this->get_version());
            $admin->register_ajax_handlers();
        }
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     *
     * @return string The name of the plugin.
     */
    public function get_plugin_name() {
        return 'cs-field-pulse';
    }

    /**
     * Retrieve the version number of the plugin.
     *
     * @return string The version number of the plugin.
     */
    public function get_version() {
        return $this->version;
    }
}