<?php
/**
 * Page Finder - Helps locate CS Field Pulse pages
 */
class CSFP_Page_Finder {
    
    /**
     * Find page ID by shortcode
     */
    public static function find_page_by_shortcode($shortcode) {
        global $wpdb;
        
        $page_id = $wpdb->get_var($wpdb->prepare(
            "SELECT ID FROM {$wpdb->posts} 
            WHERE post_content LIKE %s 
            AND post_status = 'publish' 
            AND post_type = 'page'
            LIMIT 1",
            '%[' . $shortcode . '%'
        ));
        
        return $page_id;
    }
    
    /**
     * Get or find dashboard page ID
     */
    public static function get_dashboard_page_id() {
        $page_id = get_option('csfp_dashboard_page_id');
        
        if (!$page_id) {
            $page_id = self::find_page_by_shortcode('csfp_dashboard');
            if ($page_id) {
                update_option('csfp_dashboard_page_id', $page_id);
            }
        }
        
        return $page_id;
    }
    
    /**
     * Get or find inspectors page ID
     */
    public static function get_inspectors_page_id() {
        $page_id = get_option('csfp_inspectors_page_id');
        
        if (!$page_id) {
            $page_id = self::find_page_by_shortcode('csfp_inspectors');
            if ($page_id) {
                update_option('csfp_inspectors_page_id', $page_id);
            }
        }
        
        return $page_id;
    }
    
    /**
     * Get or find adjusters page ID
     */
    public static function get_adjusters_page_id() {
        $page_id = get_option('csfp_adjusters_page_id');
        
        if (!$page_id) {
            $page_id = self::find_page_by_shortcode('csfp_adjusters');
            if ($page_id) {
                update_option('csfp_adjusters_page_id', $page_id);
            }
        }
        
        return $page_id;
    }
    
    /**
     * Get or find visits page ID
     */
    public static function get_visits_page_id() {
        $page_id = get_option('csfp_visits_page_id');
        
        if (!$page_id) {
            $page_id = self::find_page_by_shortcode('csfp_visits');
            if ($page_id) {
                update_option('csfp_visits_page_id', $page_id);
            }
        }
        
        return $page_id;
    }
    
    /**
     * Get or find profile page ID
     */
    public static function get_profile_page_id() {
        $page_id = get_option('csfp_profile_page_id');
        
        if (!$page_id) {
            $page_id = self::find_page_by_shortcode('csfp_profile');
            if ($page_id) {
                update_option('csfp_profile_page_id', $page_id);
            }
        }
        
        return $page_id;
    }
}