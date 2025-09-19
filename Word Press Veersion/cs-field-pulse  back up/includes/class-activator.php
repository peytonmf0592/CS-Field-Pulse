<?php
/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation,
 * including creating the required database tables.
 *
 * @since      1.0.0
 * @package    CS_Field_Pulse
 */

class CS_Field_Pulse_Activator {

    /**
     * Run activation tasks like creating database tables.
     *
     * @since    1.0.0
     */
    public static function activate() {
        self::create_tables();
        self::set_version();
    }
    
    /**
     * Store the plugin version in the options table.
     */
    public static function set_version() {
        update_option('cs_field_pulse_version', CS_FIELD_PULSE_VERSION);
    }

    /**
     * Create the necessary database tables for the plugin.
     * These tables store inspector data, visit records, evaluations, and criteria.
     */
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix;

        // Inspectors Table - Stores inspector profiles with classification
        $inspectors_table = $prefix . "cs_inspectors";
        $sql_inspectors = "CREATE TABLE IF NOT EXISTS $inspectors_table (
            id INT(11) NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(30),
            location VARCHAR(255),
            classification VARCHAR(50) NOT NULL DEFAULT 'passive',
            notes TEXT,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id)
        ) $charset_collate;";

        // Visits Table - Records field engagements with inspectors
        $visits_table = $prefix . "cs_visits";
        $sql_visits = "CREATE TABLE IF NOT EXISTS $visits_table (
            id INT(11) NOT NULL AUTO_INCREMENT,
            inspector_id INT(11) NOT NULL,
            visit_date DATE NOT NULL,
            location_type VARCHAR(50) NOT NULL,
            notes TEXT,
            classification VARCHAR(50) NOT NULL,
            created_by INT(11) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY inspector_id (inspector_id)
        ) $charset_collate;";

        // Evaluations Table - Stores evaluation scores for each criteria per visit
        $evaluations_table = $prefix . "cs_evaluations";
        $sql_evaluations = "CREATE TABLE IF NOT EXISTS $evaluations_table (
            id INT(11) NOT NULL AUTO_INCREMENT,
            visit_id INT(11) NOT NULL,
            criteria_key VARCHAR(100) NOT NULL,
            score INT(3) NOT NULL,
            notes TEXT,
            PRIMARY KEY (id),
            KEY visit_id (visit_id),
            UNIQUE KEY visit_criteria (visit_id, criteria_key)
        ) $charset_collate;";

        // Evaluation Criteria Table - Configurable evaluation metrics
        $criteria_table = $prefix . "cs_evaluation_criteria";
        $sql_criteria = "CREATE TABLE IF NOT EXISTS $criteria_table (
            id INT(11) NOT NULL AUTO_INCREMENT,
            criteria_key VARCHAR(100) NOT NULL,
            display_name VARCHAR(255) NOT NULL,
            description TEXT,
            active BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY criteria_key (criteria_key)
        ) $charset_collate;";

        // Execute SQL using dbDelta for safe table creation/updates
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_inspectors);
        dbDelta($sql_visits);
        dbDelta($sql_evaluations);
        dbDelta($sql_criteria);

        // Seed default evaluation criteria
        self::seed_default_criteria();
    }

    /**
     * Seed default evaluation criteria based on the roadmap document.
     * These are the initial evaluation metrics for inspectors.
     */
    private static function seed_default_criteria() {
        global $wpdb;
        $prefix = $wpdb->prefix;
        $criteria_table = $prefix . "cs_evaluation_criteria";
        $now = current_time('mysql');

        // Default criteria as specified in the roadmap
        $default_criteria = array(
            array('friendliness', 'Friendliness', 'How friendly and approachable the inspector is with contractors and customers'),
            array('branding', 'Branding compliance', 'Adherence to company branding guidelines and representation'),
            array('efficiency', 'Efficiency', 'How efficiently the inspector completes their tasks and manages time'),
            array('attitude', 'Attitude with contractors', 'Professional demeanor and communication with contractors'),
            array('availability', 'Availability', 'Accessibility and responsiveness to scheduling requests'),
            array('drive_time', 'Drive time issues', 'Management of travel time between appointments'),
            array('financial', 'Financial performance', 'Revenue generation and cost management metrics'),
            array('appearance', 'Appearance quality', 'Professional appearance, attire, and vehicle presentation'),
            array('punctuality', 'Punctuality', 'Timeliness for appointments and adherence to schedule'),
            array('adherence', 'Scheduled claim adherence', 'Following established procedures for claim processing')
        );

        // Insert criteria if they don't exist
        foreach ($default_criteria as $criteria) {
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM $criteria_table WHERE criteria_key = %s",
                $criteria[0]
            ));

            if (!$exists) {
                $wpdb->insert(
                    $criteria_table,
                    array(
                        'criteria_key' => $criteria[0],
                        'display_name' => $criteria[1],
                        'description' => $criteria[2],
                        'active' => 1,
                        'created_at' => $now,
                        'updated_at' => $now
                    )
                );
            }
        }
    }
}