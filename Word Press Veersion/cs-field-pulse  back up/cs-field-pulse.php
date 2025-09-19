<?php
/**
 * CS Field Pulse
 *
 * @package   CS_Field_Pulse
 * @author    Your Name
 * @license   GPL-2.0+
 *
 * @wordpress-plugin
 * Plugin Name:       CS Field Pulse
 * Plugin URI:        https://example.com/cs-field-pulse
 * Description:       A plugin for Contractor Success teams to evaluate inspectors, track field engagements, and monitor performance transformation.
 * Version:           1.0.0
 * Author:            Your Name
 * Author URI:        https://example.com
 * Text Domain:       cs-field-pulse
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('CS_FIELD_PULSE_VERSION', '1.0.0');
define('CS_FIELD_PULSE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CS_FIELD_PULSE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CS_FIELD_PULSE_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Define ajaxurl for frontend if needed
function cs_field_pulse_add_ajax_url() {
    echo '<script type="text/javascript">
        var ajaxurl = "' . admin_url('admin-ajax.php') . '";
    </script>';
}
add_action('admin_head', 'cs_field_pulse_add_ajax_url');

// Database check functionality
function cs_field_pulse_check_tables() {
    global $wpdb;
    $prefix = $wpdb->prefix;
    
    $tables_to_check = array(
        $prefix . 'cs_inspectors',
        $prefix . 'cs_visits',
        $prefix . 'cs_evaluations',
        $prefix . 'cs_evaluation_criteria'
    );
    
    $results = array();
    
    foreach ($tables_to_check as $table) {
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table;
        $results[$table] = $table_exists ? 'Exists' : 'Missing';
    }
    
    return $results;
}

// Add admin notice to show table status
function cs_field_pulse_admin_notice() {
    $screen = get_current_screen();
    
    // Only show on our plugin pages
    if (!$screen || strpos($screen->id, 'cs-field-pulse') === false) {
        return;
    }
    
    $results = cs_field_pulse_check_tables();
    
    echo '<div class="notice notice-info is-dismissible">';
    echo '<p><strong>CS Field Pulse Database Check:</strong></p>';
    echo '<ul>';
    
    $all_exist = true;
    foreach ($results as $table => $status) {
        $color = ($status === 'Exists') ? 'green' : 'red';
        if ($status !== 'Exists') {
            $all_exist = false;
        }
        echo '<li>' . esc_html($table) . ': <span style="color:' . $color . '"><strong>' . esc_html($status) . '</strong></span></li>';
    }
    
    echo '</ul>';
    
    if (!$all_exist) {
        echo '<p><strong>Some database tables are missing. Click the button below to create them:</strong></p>';
        echo '<form method="post" action="">';
        echo '<input type="hidden" name="cs_field_pulse_create_tables" value="1">';
        echo '<button type="submit" class="button button-primary">Create Missing Tables</button>';
        echo '</form>';
    }
    
    echo '</div>';
}
add_action('admin_notices', 'cs_field_pulse_admin_notice');

// Handle table creation request
function cs_field_pulse_handle_create_tables() {
    if (isset($_POST['cs_field_pulse_create_tables'])) {
        require_once CS_FIELD_PULSE_PLUGIN_DIR . 'includes/class-activator.php';
        CS_Field_Pulse_Activator::create_tables();
        
        // Redirect to prevent form resubmission
        wp_redirect(add_query_arg('tables_created', '1', $_SERVER['HTTP_REFERER']));
        exit;
    }
    
    if (isset($_GET['tables_created'])) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-success is-dismissible">';
            echo '<p><strong>Database tables have been created successfully!</strong></p>';
            echo '</div>';
        });
    }
}
add_action('admin_init', 'cs_field_pulse_handle_create_tables');

/**
 * The code that runs during plugin activation.
 */
function activate_cs_field_pulse() {
    require_once CS_FIELD_PULSE_PLUGIN_DIR . 'includes/class-activator.php';
    CS_Field_Pulse_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_cs_field_pulse() {
    require_once CS_FIELD_PULSE_PLUGIN_DIR . 'includes/class-deactivator.php';
    CS_Field_Pulse_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_cs_field_pulse');
register_deactivation_hook(__FILE__, 'deactivate_cs_field_pulse');

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require CS_FIELD_PULSE_PLUGIN_DIR . 'includes/class-cs-field-pulse.php';

/**
 * Begins execution of the plugin.
 *
 * @since    1.0.0
 */
function run_cs_field_pulse() {
    $plugin = new CS_Field_Pulse();
    $plugin->run();
}

run_cs_field_pulse();