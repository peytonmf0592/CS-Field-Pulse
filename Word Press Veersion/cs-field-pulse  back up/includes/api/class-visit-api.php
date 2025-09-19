<?php
/**
 * Visit API
 *
 * @package CS_Field_Pulse
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Visit API Class
 */
class CS_Field_Pulse_Visit_API {
    
    /**
     * Initialize the class
     */
    public function __construct() {
        add_action('wp_ajax_cs_field_pulse_get_visits', array($this, 'get_visits'));
        add_action('wp_ajax_cs_field_pulse_get_visit', array($this, 'get_visit'));
        add_action('wp_ajax_cs_field_pulse_save_visit', array($this, 'save_visit'));
        add_action('wp_ajax_cs_field_pulse_delete_visit', array($this, 'delete_visit'));
    }
    
    /**
     * Get all visits
     */
    public function get_visits() {
        // Check nonce for security
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
            return;
        }
        
        global $wpdb;
        $prefix = $wpdb->prefix;
        
        try {
            $visits = $wpdb->get_results("
                SELECT v.*, i.name as inspector_name 
                FROM {$prefix}cs_visits v
                JOIN {$prefix}cs_inspectors i ON v.inspector_id = i.id
                ORDER BY v.visit_date DESC
            ");
            
            wp_send_json_success(array('visits' => $visits));
        } catch (Exception $e) {
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
    
    /**
     * Get a single visit
     */
    public function get_visit() {
        // Check nonce for security
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
            return;
        }
        
        // Check if visit ID is provided
        if (!isset($_POST['id']) || empty($_POST['id'])) {
            wp_send_json_error(array('message' => 'Visit ID is required'));
            return;
        }
        
        $visit_id = intval($_POST['id']);
        
        global $wpdb;
        $prefix = $wpdb->prefix;
        
        try {
            // Get visit data
            $visit = $wpdb->get_row($wpdb->prepare(
                "SELECT v.*, i.name as inspector_name 
                FROM {$prefix}cs_visits v
                JOIN {$prefix}cs_inspectors i ON v.inspector_id = i.id
                WHERE v.id = %d",
                $visit_id
            ));
            
            if (!$visit) {
                wp_send_json_error(array('message' => 'Visit not found'));
                return;
            }
            
            // Get evaluation data for this visit
            $evaluations = $wpdb->get_results($wpdb->prepare(
                "SELECT e.*, c.display_name, c.description
                FROM {$prefix}cs_evaluations e
                JOIN {$prefix}cs_evaluation_criteria c ON e.criteria_key = c.criteria_key
                WHERE e.visit_id = %d",
                $visit_id
            ));
            
            wp_send_json_success(array(
                'visit' => $visit,
                'evaluations' => $evaluations
            ));
            
        } catch (Exception $e) {
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
    
    /**
     * Save visit (create new or update existing)
     */
    public function save_visit() {
        // Check nonce for security
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
            return;
        }
        
        // Check if visit data is provided
        if (!isset($_POST['visit']) || empty($_POST['visit'])) {
            wp_send_json_error(array('message' => 'Visit data is required'));
            return;
        }
        
        $visit = json_decode(stripslashes($_POST['visit']), true);
        $evaluations = isset($_POST['evaluations']) ? json_decode(stripslashes($_POST['evaluations']), true) : array();
        
        if (!$visit) {
            wp_send_json_error(array('message' => 'Invalid visit data'));
            return;
        }
        
        global $wpdb;
        $prefix = $wpdb->prefix;
        $now = current_time('mysql');
        $current_user_id = get_current_user_id();
        
        // Validate required fields
        if (empty($visit['inspector_id'])) {
            wp_send_json_error(array('message' => 'Inspector is required'));
            return;
        }
        
        if (empty($visit['visit_date'])) {
            wp_send_json_error(array('message' => 'Visit date is required'));
            return;
        }
        
        if (empty($visit['location_type'])) {
            wp_send_json_error(array('message' => 'Location type is required'));
            return;
        }
        
        if (empty($visit['classification'])) {
            wp_send_json_error(array('message' => 'Classification is required'));
            return;
        }
        
        // Prepare visit data
        $visit_data = array(
            'inspector_id' => intval($visit['inspector_id']),
            'visit_date' => sanitize_text_field($visit['visit_date']),
            'location_type' => sanitize_text_field($visit['location_type']),
            'classification' => sanitize_text_field($visit['classification']),
            'notes' => sanitize_textarea_field(isset($visit['notes']) ? $visit['notes'] : ''),
            'updated_at' => $now
        );
        
        try {
            // Start transaction
            $wpdb->query('START TRANSACTION');
            
            // Check if this is an update or new visit
            if (isset($visit['id']) && intval($visit['id']) > 0) {
                // Update existing visit
                $visit_id = intval($visit['id']);
                
                $wpdb->update(
                    $prefix . 'cs_visits',
                    $visit_data,
                    array('id' => $visit_id)
                );
                
                $message = 'Visit updated successfully';
            } else {
                // Add created_at and created_by for new visits
                $visit_data['created_at'] = $now;
                $visit_data['created_by'] = $current_user_id;
                
                // Insert new visit
                $wpdb->insert(
                    $prefix . 'cs_visits',
                    $visit_data
                );
                
                $visit_id = $wpdb->insert_id;
                $message = 'Visit created successfully';
            }
            
            // Process evaluations
            if (!empty($evaluations) && is_array($evaluations)) {
                foreach ($evaluations as $evaluation) {
                    // Check if evaluation already exists
                    $existing = $wpdb->get_var($wpdb->prepare(
                        "SELECT id FROM {$prefix}cs_evaluations 
                        WHERE visit_id = %d AND criteria_key = %s",
                        $visit_id,
                        $evaluation['criteria_key']
                    ));
                    
                    $evaluation_data = array(
                        'visit_id' => $visit_id,
                        'criteria_key' => sanitize_text_field($evaluation['criteria_key']),
                        'score' => intval($evaluation['score']),
                        'notes' => sanitize_textarea_field(isset($evaluation['notes']) ? $evaluation['notes'] : '')
                    );
                    
                    if ($existing) {
                        // Update existing evaluation
                        $wpdb->update(
                            $prefix . 'cs_evaluations',
                            $evaluation_data,
                            array('id' => $existing)
                        );
                    } else {
                        // Insert new evaluation
                        $wpdb->insert(
                            $prefix . 'cs_evaluations',
                            $evaluation_data
                        );
                    }
                }
            }
            
            // Update inspector classification based on the latest visit
            $this->update_inspector_classification($visit_data['inspector_id']);
            
            // Commit transaction
            $wpdb->query('COMMIT');
            
            // Get the updated visit with inspector name
            $updated_visit = $wpdb->get_row($wpdb->prepare(
                "SELECT v.*, i.name as inspector_name 
                FROM {$prefix}cs_visits v
                JOIN {$prefix}cs_inspectors i ON v.inspector_id = i.id
                WHERE v.id = %d",
                $visit_id
            ));
            
            wp_send_json_success(array(
                'message' => $message,
                'visit' => $updated_visit
            ));
            
        } catch (Exception $e) {
            // Rollback transaction on error
            $wpdb->query('ROLLBACK');
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
    
    /**
     * Delete visit
     */
    public function delete_visit() {
        // Check nonce for security
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
            return;
        }
        
        // Check if visit ID is provided
        if (!isset($_POST['id']) || empty($_POST['id'])) {
            wp_send_json_error(array('message' => 'Visit ID is required'));
            return;
        }
        
        $visit_id = intval($_POST['id']);
        
        global $wpdb;
        $prefix = $wpdb->prefix;
        
        try {
            // Get inspector ID before deleting
            $inspector_id = $wpdb->get_var($wpdb->prepare(
                "SELECT inspector_id FROM {$prefix}cs_visits WHERE id = %d",
                $visit_id
            ));
            
            // Start transaction
            $wpdb->query('START TRANSACTION');
            
            // Delete evaluations first
            $wpdb->delete(
                $prefix . 'cs_evaluations',
                array('visit_id' => $visit_id)
            );
            
            // Delete the visit
            $wpdb->delete(
                $prefix . 'cs_visits',
                array('id' => $visit_id)
            );
            
            // Update inspector classification if inspector exists
            if ($inspector_id) {
                $this->update_inspector_classification($inspector_id);
            }
            
            // Commit transaction
            $wpdb->query('COMMIT');
            
            wp_send_json_success(array('message' => 'Visit deleted successfully'));
            
        } catch (Exception $e) {
            // Rollback transaction on error
            $wpdb->query('ROLLBACK');
            wp_send_json_error(array('message' => $e->getMessage()));
        }
    }
    
    /**
     * Update inspector classification based on recent visits
     */
    private function update_inspector_classification($inspector_id) {
        global $wpdb;
        $prefix = $wpdb->prefix;
        
        // Get the most recent visit classification
        $latest_classification = $wpdb->get_var($wpdb->prepare(
            "SELECT classification FROM {$prefix}cs_visits 
            WHERE inspector_id = %d 
            ORDER BY visit_date DESC 
            LIMIT 1",
            $inspector_id
        ));
        
        if ($latest_classification) {
            // Update inspector classification
            $wpdb->update(
                $prefix . 'cs_inspectors',
                array(
                    'classification' => $latest_classification,
                    'updated_at' => current_time('mysql')
                ),
                array('id' => $inspector_id)
            );
        }
    }
}