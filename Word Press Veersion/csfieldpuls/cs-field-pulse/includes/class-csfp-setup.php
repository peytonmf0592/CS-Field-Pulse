<?php
/**
 * Setup helper class
 */
class CSFP_Setup {
    
    /**
     * Run complete setup
     */
    public static function run_setup() {
        // Deactivate and reactivate plugin to ensure clean install
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-activator.php';
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-deactivator.php';
        
        // Run activation
        CSFP_Activator::activate();
        
        // Create demo data
        self::create_demo_data();
        
        return true;
    }
    
    /**
     * Create comprehensive demo data
     */
    public static function create_demo_data() {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        // Demo inspectors
        $inspectors = array(
            // Northeast Market
            array('name' => 'John Smith', 'role' => 'Inspector', 'city' => 'New York', 'market' => 'Northeast', 'cat_local' => 'CAT', 'sentiment' => 'Promoter', 'rfm' => 'Mike Johnson'),
            array('name' => 'Sarah Johnson', 'role' => 'Inspector', 'city' => 'Boston', 'market' => 'Northeast', 'cat_local' => 'Local', 'sentiment' => 'Passive', 'rfm' => 'Mike Johnson'),
            array('name' => 'Michael Chen', 'role' => 'Inspector', 'city' => 'Philadelphia', 'market' => 'Northeast', 'cat_local' => 'CAT', 'sentiment' => 'Promoter', 'is_mentor' => 1, 'rfm' => 'Mike Johnson'),
            
            // Southeast Market
            array('name' => 'Lisa Williams', 'role' => 'Inspector', 'city' => 'Atlanta', 'market' => 'Southeast', 'cat_local' => 'Local', 'sentiment' => 'Detractor', 'rfm' => 'David Brown'),
            array('name' => 'James Davis', 'role' => 'Inspector', 'city' => 'Miami', 'market' => 'Southeast', 'cat_local' => 'CAT', 'sentiment' => 'Promoter', 'rfm' => 'David Brown'),
            array('name' => 'Maria Rodriguez', 'role' => 'Inspector', 'city' => 'Orlando', 'market' => 'Southeast', 'cat_local' => 'Local', 'sentiment' => 'Passive', 'rfm' => 'David Brown'),
            
            // Midwest Market
            array('name' => 'Robert Miller', 'role' => 'Inspector', 'city' => 'Chicago', 'market' => 'Midwest', 'cat_local' => 'CAT', 'sentiment' => 'Promoter', 'is_mentor' => 1, 'rfm' => 'Tom Wilson'),
            array('name' => 'Jennifer Taylor', 'role' => 'Inspector', 'city' => 'Detroit', 'market' => 'Midwest', 'cat_local' => 'Local', 'sentiment' => 'Passive', 'rfm' => 'Tom Wilson'),
            array('name' => 'William Anderson', 'role' => 'Inspector', 'city' => 'Cleveland', 'market' => 'Midwest', 'cat_local' => 'CAT', 'sentiment' => 'Promoter', 'rfm' => 'Tom Wilson'),
            
            // West Market
            array('name' => 'David Martinez', 'role' => 'Inspector', 'city' => 'Los Angeles', 'market' => 'West', 'cat_local' => 'CAT', 'sentiment' => 'Passive', 'rfm' => 'Chris Lee'),
            array('name' => 'Emily Brown', 'role' => 'Inspector', 'city' => 'San Francisco', 'market' => 'West', 'cat_local' => 'Local', 'sentiment' => 'Promoter', 'rfm' => 'Chris Lee'),
            array('name' => 'Christopher Lee', 'role' => 'Inspector', 'city' => 'Seattle', 'market' => 'West', 'cat_local' => 'CAT', 'sentiment' => 'Detractor', 'rfm' => 'Chris Lee'),
            
            // Southwest Market
            array('name' => 'Patricia Garcia', 'role' => 'Inspector', 'city' => 'Phoenix', 'market' => 'Southwest', 'cat_local' => 'Local', 'sentiment' => 'Promoter', 'rfm' => 'Steve Clark'),
            array('name' => 'Thomas Wilson', 'role' => 'Inspector', 'city' => 'Dallas', 'market' => 'Southwest', 'cat_local' => 'CAT', 'sentiment' => 'Passive', 'is_mentor' => 1, 'rfm' => 'Steve Clark'),
            array('name' => 'Nancy White', 'role' => 'Inspector', 'city' => 'Houston', 'market' => 'Southwest', 'cat_local' => 'Local', 'sentiment' => 'Promoter', 'rfm' => 'Steve Clark')
        );
        
        // Demo adjusters
        $adjusters = array(
            // State Farm
            array('name' => 'Robert Johnson', 'role' => 'Adjuster', 'city' => 'Miami', 'market' => 'Southeast', 'carrier' => 'State Farm', 'sentiment' => 'Promoter'),
            array('name' => 'Jessica Thompson', 'role' => 'Adjuster', 'city' => 'Atlanta', 'market' => 'Southeast', 'carrier' => 'State Farm', 'sentiment' => 'Passive'),
            array('name' => 'Mark Davis', 'role' => 'Adjuster', 'city' => 'Chicago', 'market' => 'Midwest', 'carrier' => 'State Farm', 'sentiment' => 'Promoter'),
            
            // Allstate
            array('name' => 'Emily Wilson', 'role' => 'Adjuster', 'city' => 'Seattle', 'market' => 'West', 'carrier' => 'Allstate', 'sentiment' => 'Passive'),
            array('name' => 'Daniel Martinez', 'role' => 'Adjuster', 'city' => 'Los Angeles', 'market' => 'West', 'carrier' => 'Allstate', 'sentiment' => 'Detractor'),
            array('name' => 'Linda Anderson', 'role' => 'Adjuster', 'city' => 'Phoenix', 'market' => 'Southwest', 'carrier' => 'Allstate', 'sentiment' => 'Promoter'),
            
            // Progressive
            array('name' => 'James Garcia', 'role' => 'Adjuster', 'city' => 'Denver', 'market' => 'Mountain', 'carrier' => 'Progressive', 'sentiment' => 'Detractor'),
            array('name' => 'Barbara Rodriguez', 'role' => 'Adjuster', 'city' => 'Dallas', 'market' => 'Southwest', 'carrier' => 'Progressive', 'sentiment' => 'Promoter'),
            array('name' => 'Charles Brown', 'role' => 'Adjuster', 'city' => 'New York', 'market' => 'Northeast', 'carrier' => 'Progressive', 'sentiment' => 'Passive'),
            
            // GEICO
            array('name' => 'Maria Hernandez', 'role' => 'Adjuster', 'city' => 'Atlanta', 'market' => 'Southeast', 'carrier' => 'GEICO', 'sentiment' => 'Promoter'),
            array('name' => 'Kevin Lee', 'role' => 'Adjuster', 'city' => 'Boston', 'market' => 'Northeast', 'carrier' => 'GEICO', 'sentiment' => 'Passive'),
            
            // Liberty Mutual
            array('name' => 'William Taylor', 'role' => 'Adjuster', 'city' => 'Boston', 'market' => 'Northeast', 'carrier' => 'Liberty Mutual', 'sentiment' => 'Passive'),
            array('name' => 'Susan Clark', 'role' => 'Adjuster', 'city' => 'Philadelphia', 'market' => 'Northeast', 'carrier' => 'Liberty Mutual', 'sentiment' => 'Promoter')
        );
        
        // Insert all demo data
        foreach ($inspectors as $inspector) {
            $wpdb->insert($table, $inspector);
        }
        
        foreach ($adjusters as $adjuster) {
            $wpdb->insert($table, $adjuster);
        }
        
        // Create some sample engagements
        $users = get_users(array('role' => 'administrator'));
        if (!empty($users)) {
            $user_id = $users[0]->ID;
            
            // Get some inspectors/adjusters IDs
            $inspector_ids = $wpdb->get_col("SELECT id FROM $table WHERE role = 'Inspector' LIMIT 5");
            $adjuster_ids = $wpdb->get_col("SELECT id FROM $table WHERE role = 'Adjuster' LIMIT 5");
            
            $engagements_table = $wpdb->prefix . 'csfp_engagements';
            $engagement_notes = array(
                'Great interaction today. Very cooperative and professional.',
                'Discussed new procedures. Some concerns about timeline.',
                'Follow-up meeting scheduled for next week.',
                'Positive feedback on recent changes.',
                'Need to address equipment concerns.'
            );
            
            // Create engagements for inspectors
            foreach ($inspector_ids as $i => $inspector_id) {
                $wpdb->insert($engagements_table, array(
                    'inspector_id' => $inspector_id,
                    'user_id' => $user_id,
                    'sentiment' => array('Promoter', 'Passive', 'Detractor')[rand(0, 2)],
                    'notes' => $engagement_notes[$i % count($engagement_notes)],
                    'engagement_date' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days'))
                ));
            }
            
            // Create engagements for adjusters
            foreach ($adjuster_ids as $i => $adjuster_id) {
                $wpdb->insert($engagements_table, array(
                    'inspector_id' => $adjuster_id,
                    'user_id' => $user_id,
                    'sentiment' => array('Promoter', 'Passive', 'Detractor')[rand(0, 2)],
                    'notes' => $engagement_notes[$i % count($engagement_notes)],
                    'engagement_date' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days'))
                ));
            }
        }
        
        return true;
    }
}