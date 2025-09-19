<?php
/**
 * Market Tour functionality
 */
class CSFP_Market_Tour {
    
    /**
     * Start a new market tour
     */
    public static function start_tour($data) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_market_tours';
        
        // Check if user already has an active tour
        $active = self::get_active_tour($data['user_id']);
        if ($active) {
            return array('error' => 'You already have an active tour. Please end it before starting a new one.');
        }
        
        // Insert new tour
        $markets_json = json_encode($data['markets']);
        
        $result = $wpdb->insert($table, array(
            'user_id' => $data['user_id'],
            'markets' => $markets_json,
            'rfm' => sanitize_text_field($data['rfm']),
            'traveler' => sanitize_text_field($data['traveler']),
            'start_time' => current_time('mysql'),
            'notes' => sanitize_text_field($data['notes'] ?? '')
        ));
        
        if ($result) {
            return $wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Get active tour for user
     */
    public static function get_active_tour($user_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_market_tours';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE user_id = %d AND end_time IS NULL ORDER BY start_time DESC LIMIT 1",
            $user_id
        ));
    }
    
    /**
     * End a tour
     */
    public static function end_tour($tour_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_market_tours';
        
        // Update tour end time
        $result = $wpdb->update(
            $table,
            array(
                'end_time' => current_time('mysql')
            ),
            array('id' => $tour_id)
        );
        
        return $result;
    }
    
    /**
     * Get tour by ID
     */
    public static function get_tour($tour_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_market_tours';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $tour_id
        ));
    }
    
    /**
     * Get all tours
     */
    public static function get_all_tours($limit = 50) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_market_tours';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table ORDER BY start_time DESC LIMIT %d",
            $limit
        ));
    }
    
    /**
     * Attach visit to tour
     */
    public static function attach_visit_to_tour($visit_id, $tour_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_visits';
        
        return $wpdb->update(
            $table,
            array('tour_id' => $tour_id),
            array('id' => $visit_id)
        );
    }
    
    /**
     * Detach visit from tour
     */
    public static function detach_visit_from_tour($visit_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_visits';
        
        return $wpdb->update(
            $table,
            array('tour_id' => null),
            array('id' => $visit_id)
        );
    }
    
    /**
     * Get tour statistics
     */
    public static function get_tour_stats($tour_id) {
        global $wpdb;
        $table_visits = $wpdb->prefix . 'csfp_visits';
        
        // Get all visits for this tour
        $visits = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_visits WHERE tour_id = %d",
            $tour_id
        ));
        
        // Initialize stats
        $stats = array(
            'inspector_visits' => 0,
            'adjuster_visits' => 0,
            'total_visits' => count($visits),
            'follow_ups_needed' => 0,
            'sentiment_breakdown' => array(
                'Promoter' => 0,
                'Passive' => 0,
                'Detractor' => 0
            ),
            'issues' => array(),
            'branding_compliance' => array(),
            'punctual' => array('Yes' => 0, 'No' => 0),
            'scope_sheet_quality' => array(),
            'regional_shoutouts' => array()
        );
        
        // Process each visit
        foreach ($visits as $visit) {
            $field_data = json_decode($visit->field_data, true);
            
            // Count by type
            if ($visit->type === 'inspector') {
                $stats['inspector_visits']++;
            } else {
                $stats['adjuster_visits']++;
            }
            
            // Count follow-ups
            if ($visit->follow_up_needed) {
                $stats['follow_ups_needed']++;
            }
            
            // Sentiment breakdown
            if (!empty($field_data['sentiment'])) {
                $sentiment = $field_data['sentiment'];
                if (isset($stats['sentiment_breakdown'][$sentiment])) {
                    $stats['sentiment_breakdown'][$sentiment]++;
                }
            }
            
            // Collect issues
            if (!empty($field_data['issues'])) {
                $issue = $field_data['issues'];
                if (!isset($stats['issues'][$issue])) {
                    $stats['issues'][$issue] = 0;
                }
                $stats['issues'][$issue]++;
            }
            
            // Branding compliance
            if (!empty($field_data['branding_compliance'])) {
                $compliance = $field_data['branding_compliance'];
                if (!isset($stats['branding_compliance'][$compliance])) {
                    $stats['branding_compliance'][$compliance] = 0;
                }
                $stats['branding_compliance'][$compliance]++;
            }
            
            // Punctuality
            if (!empty($field_data['punctual'])) {
                $punctual = $field_data['punctual'];
                if (isset($stats['punctual'][$punctual])) {
                    $stats['punctual'][$punctual]++;
                }
            }
            
            // Scope sheet quality
            if (!empty($field_data['scope_sheet_quality'])) {
                $quality = $field_data['scope_sheet_quality'];
                if (!isset($stats['scope_sheet_quality'][$quality])) {
                    $stats['scope_sheet_quality'][$quality] = 0;
                }
                $stats['scope_sheet_quality'][$quality]++;
            }
            
            // Regional shoutouts
            if (!empty($field_data['regional_shoutout'])) {
                $shoutout = $field_data['regional_shoutout'];
                if (!isset($stats['regional_shoutouts'][$shoutout])) {
                    $stats['regional_shoutouts'][$shoutout] = 0;
                }
                $stats['regional_shoutouts'][$shoutout]++;
            }
        }
        
        // Sort issues by count (top 10)
        arsort($stats['issues']);
        $stats['issues'] = array_slice($stats['issues'], 0, 10, true);
        
        return $stats;
    }
    
    /**
     * Get tour visits
     */
    public static function get_tour_visits($tour_id) {
        global $wpdb;
        $table_visits = $wpdb->prefix . 'csfp_visits';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_visits 
            WHERE tour_id = %d 
            ORDER BY date DESC, created_at DESC",
            $tour_id
        ));
    }
}