<?php
/**
 * Fired during plugin activation
 */
class CSFP_Activator {
    
    /**
     * Activate the plugin
     */
    public static function activate() {
        // Create database tables
        self::create_database_tables();
        
        // Create default admin users
        self::create_default_users();
        
        // Create plugin pages
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-page-setup.php';
        CSFP_Page_Setup::create_pages();
        
        // Add default options
        add_option('csfp_google_maps_api_key', '');
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Create required database tables
     */
    private static function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Inspectors/Adjusters table
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        $sql_inspectors = "CREATE TABLE $table_inspectors (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            role varchar(50) NOT NULL,
            city varchar(100),
            market varchar(100),
            rfm varchar(50),
            cat_local varchar(20),
            is_mentor boolean DEFAULT false,
            carrier varchar(100),
            sentiment varchar(20) DEFAULT 'Passive',
            personal_notes text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY sentiment (sentiment),
            KEY role (role)
        ) $charset_collate;";
        
        // Engagements table
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $sql_engagements = "CREATE TABLE $table_engagements (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            inspector_id mediumint(9) NOT NULL,
            user_id bigint(20) NOT NULL,
            sentiment varchar(20) NOT NULL,
            notes text,
            engagement_date datetime DEFAULT CURRENT_TIMESTAMP,
            follow_up_needed boolean DEFAULT false,
            tour_id mediumint(9) DEFAULT NULL,
            common_issues text,
            competitor_intel text,
            market_dynamics text,
            PRIMARY KEY (id),
            KEY inspector_id (inspector_id),
            KEY user_id (user_id),
            KEY tour_id (tour_id)
        ) $charset_collate;";
        
        // Sentiment changes table
        $table_sentiment_changes = $wpdb->prefix . 'csfp_sentiment_changes';
        $sql_sentiment_changes = "CREATE TABLE $table_sentiment_changes (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            inspector_id mediumint(9) NOT NULL,
            user_id bigint(20) NOT NULL,
            old_sentiment varchar(20),
            new_sentiment varchar(20),
            reason text,
            changed_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY inspector_id (inspector_id)
        ) $charset_collate;";
        
        // Media table
        $table_media = $wpdb->prefix . 'csfp_media';
        $sql_media = "CREATE TABLE $table_media (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            inspector_id mediumint(9) NOT NULL,
            user_id bigint(20) NOT NULL,
            media_type varchar(20) NOT NULL,
            media_url varchar(500) NOT NULL,
            caption text,
            uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY inspector_id (inspector_id)
        ) $charset_collate;";
        
        // Market tours table
        $table_market_tours = $wpdb->prefix . 'csfp_market_tours';
        $sql_market_tours = "CREATE TABLE $table_market_tours (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            market_name varchar(255) NOT NULL,
            region varchar(100),
            city varchar(100),
            rfm_name varchar(255),
            start_date datetime NOT NULL,
            end_date datetime,
            status varchar(20) DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            completed_at datetime,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY status (status)
        ) $charset_collate;";
        
        // Tour engagements table
        $table_tour_engagements = $wpdb->prefix . 'csfp_tour_engagements';
        $sql_tour_engagements = "CREATE TABLE $table_tour_engagements (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            tour_id mediumint(9) NOT NULL,
            engagement_id mediumint(9) NOT NULL,
            engagement_type varchar(20) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY tour_id (tour_id),
            KEY engagement_id (engagement_id)
        ) $charset_collate;";
        
        // Tour summaries table
        $table_tour_summaries = $wpdb->prefix . 'csfp_tour_summaries';
        $sql_tour_summaries = "CREATE TABLE $table_tour_summaries (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            tour_id mediumint(9) NOT NULL,
            summary_type varchar(50) NOT NULL,
            summary_content longtext,
            key_insights longtext,
            action_items longtext,
            generated_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY tour_id (tour_id)
        ) $charset_collate;";
        
        // Visits table for V3 quick visit forms
        $table_visits = $wpdb->prefix . 'csfp_visits';
        $sql_visits = "CREATE TABLE $table_visits (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            type varchar(20) NOT NULL,
            cs varchar(50) NOT NULL,
            date date NOT NULL,
            field_data longtext NOT NULL,
            user_id bigint(20) NOT NULL,
            follow_up_needed boolean DEFAULT false,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY type (type),
            KEY date (date),
            KEY cs (cs),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        // Adjusters table for carrier/adjuster management
        $table_adjusters = $wpdb->prefix . 'csfp_adjusters';
        $sql_adjusters = "CREATE TABLE $table_adjusters (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            carrier varchar(100) NOT NULL,
            name varchar(255) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY carrier (carrier),
            KEY name (name),
            UNIQUE KEY carrier_adjuster (carrier, name)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_inspectors);
        dbDelta($sql_engagements);
        dbDelta($sql_sentiment_changes);
        dbDelta($sql_media);
        dbDelta($sql_market_tours);
        dbDelta($sql_tour_engagements);
        dbDelta($sql_tour_summaries);
        dbDelta($sql_visits);
        dbDelta($sql_adjusters);
        
        // Add transcription column if it doesn't exist
        self::upgrade_database_schema();
    }
    
    /**
     * Upgrade database schema
     */
    public static function upgrade_database_schema() {
        global $wpdb;
        
        // Check if market tours table exists, if not create all tables
        $table_market_tours = $wpdb->prefix . 'csfp_market_tours';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_market_tours'") != $table_market_tours) {
            self::create_database_tables();
            return;
        }
        
        // Check if visits table exists and create if not
        $table_visits = $wpdb->prefix . 'csfp_visits';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_visits'") != $table_visits) {
            $charset_collate = $wpdb->get_charset_collate();
            $sql_visits = "CREATE TABLE $table_visits (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                type varchar(20) NOT NULL,
                cs varchar(50) NOT NULL,
                date date NOT NULL,
                field_data longtext NOT NULL,
                user_id bigint(20) NOT NULL,
                follow_up_needed boolean DEFAULT false,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY type (type),
                KEY date (date),
                KEY cs (cs),
                KEY user_id (user_id)
            ) $charset_collate;";
            
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql_visits);
        }
        
        // Add transcription column if it doesn't exist
        $table_name = $wpdb->prefix . 'csfp_engagements';
        $column_exists = $wpdb->get_results("SHOW COLUMNS FROM `$table_name` LIKE 'transcription'");
        
        if (empty($column_exists)) {
            $wpdb->query("ALTER TABLE `$table_name` ADD `transcription` TEXT NULL AFTER `notes`");
        }
        
        // Add created_at column to media table if it doesn't exist
        $table_media = $wpdb->prefix . 'csfp_media';
        $column_exists_media = $wpdb->get_results("SHOW COLUMNS FROM `$table_media` LIKE 'created_at'");
        
        if (empty($column_exists_media)) {
            $wpdb->query("ALTER TABLE `$table_media` ADD `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `caption`");
        }
        
        // Create market_tours table if it doesn't exist
        $table_market_tours = $wpdb->prefix . 'csfp_market_tours';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_market_tours'") != $table_market_tours) {
            $charset_collate = $wpdb->get_charset_collate();
            $sql_tours = "CREATE TABLE $table_market_tours (
                id mediumint(9) NOT NULL AUTO_INCREMENT,
                rfm varchar(100) NOT NULL,
                markets text NOT NULL,
                traveler varchar(100) NOT NULL,
                user_id bigint(20) NOT NULL,
                start_time datetime NOT NULL,
                end_time datetime NULL,
                notes text NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY user_id (user_id),
                KEY start_time (start_time),
                KEY end_time (end_time),
                KEY rfm (rfm)
            ) $charset_collate;";
            
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql_tours);
        }
        
        // Update existing market_tours table if needed
        $market_tours_columns = $wpdb->get_results("SHOW COLUMNS FROM `$table_market_tours`");
        $has_markets = false;
        $has_market = false;
        foreach ($market_tours_columns as $col) {
            if ($col->Field === 'markets') $has_markets = true;
            if ($col->Field === 'market') $has_market = true;
        }
        
        // Migrate from single market to multiple markets if needed
        if ($has_market && !$has_markets) {
            // Add new markets column
            $wpdb->query("ALTER TABLE `$table_market_tours` ADD `markets` TEXT NOT NULL AFTER `rfm`");
            // Copy existing market data to markets as JSON array
            $wpdb->query("UPDATE `$table_market_tours` SET `markets` = CONCAT('[\"', `market`, '\"]') WHERE `market` IS NOT NULL");
            // Drop old market column
            $wpdb->query("ALTER TABLE `$table_market_tours` DROP COLUMN `market`");
        }
        
        // Add tour_id column to visits table if it doesn't exist
        $table_visits = $wpdb->prefix . 'csfp_visits';
        $tour_column_exists = $wpdb->get_results("SHOW COLUMNS FROM `$table_visits` LIKE 'tour_id'");
        
        if (empty($tour_column_exists)) {
            $wpdb->query("ALTER TABLE `$table_visits` ADD `tour_id` mediumint(9) NULL AFTER `follow_up_needed`");
            $wpdb->query("ALTER TABLE `$table_visits` ADD INDEX idx_tour_id (tour_id)");
        }
    }
    
    /**
     * Create default admin users if they don't exist
     */
    private static function create_default_users() {
        $default_users = array(
            array(
                'user_login' => 'kgray',
                'user_pass' => wp_generate_password(),
                'user_email' => 'kgray@seeknow.com',
                'display_name' => 'Kyle Gray',
                'role' => 'administrator',
                'meta' => array(
                    'csfp_role' => 'Contractor Success Manager',
                    'csfp_location' => 'Cincinnati, OH'
                )
            ),
            array(
                'user_login' => 'glazio',
                'user_pass' => wp_generate_password(),
                'user_email' => 'glazio@seeknow.com',
                'display_name' => 'Gino Lazio',
                'role' => 'administrator',
                'meta' => array(
                    'csfp_role' => 'Contractor Success Liaison',
                    'csfp_location' => 'Phoenix, AZ'
                )
            ),
            array(
                'user_login' => 'pfowlkes',
                'user_pass' => wp_generate_password(),
                'user_email' => 'pfowlkes@seeknow.com',
                'display_name' => 'Peyton Fowlkes',
                'role' => 'administrator',
                'meta' => array(
                    'csfp_role' => 'Contractor Success Liaison',
                    'csfp_location' => 'Richmond, VA'
                )
            )
        );
        
        foreach ($default_users as $user_data) {
            if (!username_exists($user_data['user_login'])) {
                $user_id = wp_create_user(
                    $user_data['user_login'],
                    $user_data['user_pass'],
                    $user_data['user_email']
                );
                
                if (!is_wp_error($user_id)) {
                    wp_update_user(array(
                        'ID' => $user_id,
                        'display_name' => $user_data['display_name'],
                        'role' => $user_data['role']
                    ));
                    
                    foreach ($user_data['meta'] as $key => $value) {
                        update_user_meta($user_id, $key, $value);
                    }
                }
            }
        }
    }
}