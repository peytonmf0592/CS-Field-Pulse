<?php
/**
 * Plugin Name: CS Field Pulse
 * Plugin URI: https://seeknow.com/cs-field-pulse
 * Description: A contractor success web app for tracking field interactions with inspectors and adjusters
 * Version: 1.0.0
 * Author: SeekNow
 * Author URI: https://seeknow.com
 * License: GPL v2 or later
 * Text Domain: cs-field-pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CSFP_VERSION', '1.0.1');
define('CSFP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CSFP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CSFP_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Include required files
require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-activator.php';
require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-deactivator.php';
require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-core.php';

// Activation and deactivation hooks
register_activation_hook(__FILE__, array('CSFP_Activator', 'activate'));
register_deactivation_hook(__FILE__, array('CSFP_Deactivator', 'deactivate'));

/**
 * Initialize the plugin
 */
function run_cs_field_pulse() {
    $plugin = new CSFP_Core();
    $plugin->run();
}
add_action('plugins_loaded', 'run_cs_field_pulse');