<?php
/**
 * Database operations handler
 */
class CSFP_Database {
    
    /**
     * Get all inspectors
     */
    public static function get_inspectors($filters = array()) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $where = array("role = 'Inspector'");
        $values = array();
        
        if (!empty($filters['city'])) {
            $where[] = 'city = %s';
            $values[] = $filters['city'];
        }
        
        if (!empty($filters['sentiment'])) {
            $where[] = 'sentiment = %s';
            $values[] = $filters['sentiment'];
        }
        
        if (!empty($filters['cat_local'])) {
            $where[] = 'cat_local = %s';
            $values[] = $filters['cat_local'];
        }
        
        $where_clause = implode(' AND ', $where);
        
        $query = "SELECT * FROM $table WHERE $where_clause ORDER BY name ASC";
        
        // Add pagination
        if (isset($filters['limit']) && $filters['limit'] > 0) {
            $limit = intval($filters['limit']);
            $offset = isset($filters['offset']) ? intval($filters['offset']) : 0;
            $query .= " LIMIT $offset, $limit";
        }
        
        if (!empty($values)) {
            $query = $wpdb->prepare($query, $values);
        }
        
        return $wpdb->get_results($query);
    }
    
    /**
     * Get all adjusters
     */
    public static function get_adjusters($filters = array()) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $where = array("role = 'Adjuster'");
        $values = array();
        
        if (!empty($filters['city'])) {
            $where[] = 'city = %s';
            $values[] = $filters['city'];
        }
        
        if (!empty($filters['sentiment'])) {
            $where[] = 'sentiment = %s';
            $values[] = $filters['sentiment'];
        }
        
        if (!empty($filters['carrier'])) {
            $where[] = 'carrier = %s';
            $values[] = $filters['carrier'];
        }
        
        $where_clause = implode(' AND ', $where);
        
        $query = "SELECT * FROM $table WHERE $where_clause ORDER BY name ASC";
        
        // Add pagination
        if (isset($filters['limit']) && $filters['limit'] > 0) {
            $limit = intval($filters['limit']);
            $offset = isset($filters['offset']) ? intval($filters['offset']) : 0;
            $query .= " LIMIT $offset, $limit";
        }
        
        if (!empty($values)) {
            $query = $wpdb->prepare($query, $values);
        }
        
        return $wpdb->get_results($query);
    }
    
    /**
     * Count inspectors
     */
    public static function count_inspectors($filters = array()) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $where = array("role = 'Inspector'");
        $values = array();
        
        if (!empty($filters['city'])) {
            $where[] = 'city = %s';
            $values[] = $filters['city'];
        }
        
        if (!empty($filters['sentiment'])) {
            $where[] = 'sentiment = %s';
            $values[] = $filters['sentiment'];
        }
        
        if (!empty($filters['cat_local'])) {
            $where[] = 'cat_local = %s';
            $values[] = $filters['cat_local'];
        }
        
        $where_clause = implode(' AND ', $where);
        $query = "SELECT COUNT(*) FROM $table WHERE $where_clause";
        
        if (!empty($values)) {
            $query = $wpdb->prepare($query, $values);
        }
        
        return $wpdb->get_var($query);
    }
    
    /**
     * Count adjusters
     */
    public static function count_adjusters($filters = array()) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $where = array("role = 'Adjuster'");
        $values = array();
        
        if (!empty($filters['city'])) {
            $where[] = 'city = %s';
            $values[] = $filters['city'];
        }
        
        if (!empty($filters['sentiment'])) {
            $where[] = 'sentiment = %s';
            $values[] = $filters['sentiment'];
        }
        
        if (!empty($filters['carrier'])) {
            $where[] = 'carrier = %s';
            $values[] = $filters['carrier'];
        }
        
        $where_clause = implode(' AND ', $where);
        $query = "SELECT COUNT(*) FROM $table WHERE $where_clause";
        
        if (!empty($values)) {
            $query = $wpdb->prepare($query, $values);
        }
        
        return $wpdb->get_var($query);
    }
    
    /**
     * Get single inspector/adjuster
     */
    public static function get_inspector($id) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $id
        ));
    }
    
    /**
     * Get engagements for an inspector
     */
    public static function get_engagements($inspector_id) {
        global $wpdb;
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $table_users = $wpdb->users;
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT e.*, u.display_name as user_name 
            FROM $table_engagements e
            LEFT JOIN $table_users u ON e.user_id = u.ID
            WHERE e.inspector_id = %d
            ORDER BY e.engagement_date DESC",
            $inspector_id
        ));
    }
    
    /**
     * Get sentiment changes for an inspector
     */
    public static function get_sentiment_changes($inspector_id) {
        global $wpdb;
        $table_changes = $wpdb->prefix . 'csfp_sentiment_changes';
        $table_users = $wpdb->users;
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT sc.*, u.display_name as user_name 
            FROM $table_changes sc
            LEFT JOIN $table_users u ON sc.user_id = u.ID
            WHERE sc.inspector_id = %d
            ORDER BY sc.changed_at DESC",
            $inspector_id
        ));
    }
    
    /**
     * Get sentiment statistics
     */
    public static function get_sentiment_stats($role = null, $market = null) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $where = array();
        $values = array();
        
        if ($role) {
            $where[] = 'role = %s';
            $values[] = $role;
        }
        
        if ($market) {
            $where[] = 'market = %s';
            $values[] = $market;
        }
        
        $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $query = "SELECT 
            sentiment,
            COUNT(*) as count
            FROM $table
            $where_clause
            GROUP BY sentiment";
        
        if (!empty($values)) {
            $query = $wpdb->prepare($query, $values);
        }
        
        $results = $wpdb->get_results($query);
        
        $stats = array(
            'Promoter' => 0,
            'Passive' => 0,
            'Detractor' => 0
        );
        
        foreach ($results as $row) {
            $stats[$row->sentiment] = intval($row->count);
        }
        
        return $stats;
    }
    
    /**
     * Add engagement
     */
    public static function add_engagement($inspector_id, $user_id, $sentiment, $notes) {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_engagements';
        
        return $wpdb->insert($table, array(
            'inspector_id' => $inspector_id,
            'user_id' => $user_id,
            'sentiment' => $sentiment,
            'notes' => $notes
        ));
    }
    
    /**
     * Update sentiment
     */
    public static function update_sentiment($inspector_id, $new_sentiment, $user_id, $reason = '') {
        global $wpdb;
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        $table_changes = $wpdb->prefix . 'csfp_sentiment_changes';
        
        // Get current sentiment
        $current = $wpdb->get_row($wpdb->prepare(
            "SELECT sentiment FROM $table_inspectors WHERE id = %d",
            $inspector_id
        ));
        
        if (!$current) {
            return false;
        }
        
        // Log the change
        $wpdb->insert($table_changes, array(
            'inspector_id' => $inspector_id,
            'user_id' => $user_id,
            'old_sentiment' => $current->sentiment,
            'new_sentiment' => $new_sentiment,
            'reason' => $reason
        ));
        
        // Update sentiment
        return $wpdb->update(
            $table_inspectors,
            array('sentiment' => $new_sentiment),
            array('id' => $inspector_id)
        );
    }
    
    /**
     * Get all cities
     */
    public static function get_all_cities() {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        return $wpdb->get_col("SELECT DISTINCT city FROM $table WHERE city IS NOT NULL ORDER BY city");
    }
    
    /**
     * Get all markets
     */
    public static function get_all_markets() {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        return $wpdb->get_col("SELECT DISTINCT market FROM $table WHERE market IS NOT NULL ORDER BY market");
    }
    
    /**
     * Get all carriers
     */
    public static function get_all_carriers() {
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        return $wpdb->get_col("SELECT DISTINCT carrier FROM $table WHERE carrier IS NOT NULL ORDER BY carrier");
    }
}