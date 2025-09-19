<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package CS_Field_Pulse
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Access the database via SQL.
global $wpdb;

// Drop tables if they exist.
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}_cs_inspectors");
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}_cs_visits");
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}_cs_evaluations");
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}_cs_evaluation_criteria");

// Remove plugin options from options table.
delete_option('cs_field_pulse_version');
delete_option('cs_field_pulse_settings');