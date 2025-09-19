<?php
/**
 * Inspector Model.
 *
 * Handles inspector data and operations.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Inspector {

    /**
     * The inspector data.
     *
     * @var array
     */
    private $data;

    /**
     * Constructor.
     *
     * @param int|object $inspector Inspector ID or object.
     */
    public function __construct($inspector = 0) {
        if (is_numeric($inspector) && $inspector > 0) {
            $this->data = $this->get_by_id($inspector);
        } elseif (is_object($inspector)) {
            $this->data = $inspector;
        } else {
            $this->data = new stdClass();
        }
    }

    /**
     * Get inspector by ID.
     *
     * @param int $id The inspector ID.
     * @return object The inspector data.
     */
    public function get_by_id($id) {
        return CS_Field_Pulse_DB_Manager::get_row('inspectors', array('id' => $id));
    }

    /**
     * Get all inspectors.
     *
     * @param array $args Query arguments.
     * @return array The inspectors.
     */
    public function get_all($args = array()) {
        $defaults = array(
            'where' => array(),
            'orderby' => 'name',
            'order' => 'ASC',
            'limit' => 0,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        return CS_Field_Pulse_DB_Manager::get_results(
            'inspectors',
            $args['where'],
            $args['orderby'],
            $args['order'],
            $args['limit'],
            $args['offset']
        );
    }

    /**
     * Create a new inspector.
     *
     * @param array $data The inspector data.
     * @return int|false The inspector ID or false on failure.
     */
    public function create($data) {
        return CS_Field_Pulse_DB_Manager::insert('inspectors', $data);
    }

    /**
     * Update inspector data.
     *
     * @param int $id The inspector ID.
     * @param array $data The data to update.
     * @return int|false The number of rows updated or false on failure.
     */
    public function update($id, $data) {
        return CS_Field_Pulse_DB_Manager::update('inspectors', $data, array('id' => $id));
    }

    /**
     * Delete an inspector.
     *
     * @param int $id The inspector ID.
     * @return int|false The number of rows deleted or false on failure.
     */
    public function delete($id) {
        return CS_Field_Pulse_DB_Manager::delete('inspectors', array('id' => $id));
    }

    /**
     * Search inspectors.
     *
     * @param string $search The search term.
     * @param array $args Additional query arguments.
     * @return array The search results.
     */
    public function search($search, $args = array()) {
        global $wpdb;
        
        $table_name = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        
        $defaults = array(
            'orderby' => 'name',
            'order' => 'ASC',
            'limit' => 0,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $limit_clause = '';
        if ($args['limit'] > 0) {
            $limit_clause = "LIMIT {$args['offset']}, {$args['limit']}";
        }
        
        $query = $wpdb->prepare(
            "SELECT * FROM {$table_name} 
            WHERE name LIKE %s OR email LIKE %s OR location LIKE %s 
            ORDER BY {$args['orderby']} {$args['order']} 
            {$limit_clause}",
            "%{$search}%",
            "%{$search}%",
            "%{$search}%"
        );
        
        return $wpdb->get_results($query);
    }

    /**
     * Get inspector classification distribution.
     *
     * @return array The classification counts.
     */
    public function get_classification_distribution() {
        global $wpdb;
        
        $table_name = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        
        $query = "
            SELECT classification, COUNT(*) as count 
            FROM {$table_name} 
            GROUP BY classification
        ";
        
        $results = $wpdb->get_results($query);
        
        $distribution = array(
            'promoter' => 0,
            'passive' => 0,
            'detractor' => 0
        );
        
        foreach ($results as $result) {
            $distribution[$result->classification] = (int) $result->count;
        }
        
        return $distribution;
    }

    /**
     * Get inspector with recent visit data.
     *
     * @param int $limit The number of inspectors to retrieve.
     * @return array The inspectors with visit data.
     */
    public function get_with_recent_visits($limit = 5) {
        global $wpdb;
        
        $inspectors_table = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        
        $query = "
            SELECT i.*, v.visit_date, v.classification as last_visit_classification 
            FROM {$inspectors_table} i
            LEFT JOIN (
                SELECT inspector_id, visit_date, classification, 
                       ROW_NUMBER() OVER (PARTITION BY inspector_id ORDER BY visit_date DESC) as rn
                FROM {$visits_table}
            ) v ON i.id = v.inspector_id AND v.rn = 1
            ORDER BY v.visit_date DESC
            LIMIT {$limit}
        ";
        
        return $wpdb->get_results($query);
    }

    /**
     * Get the inspector's performance trend.
     *
     * @param int $inspector_id The inspector ID.
     * @param int $months The number of months to include.
     * @return array The performance trend data.
     */
    public function get_performance_trend($inspector_id, $months = 6) {
        global $wpdb;
        
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        
        $query = $wpdb->prepare(
            "SELECT 
                DATE_FORMAT(v.visit_date, '%%Y-%%m') as month,
                v.classification,
                AVG(e.score) as average_score
            FROM {$visits_table} v
            LEFT JOIN {$evaluations_table} e ON v.id = e.visit_id
            WHERE v.inspector_id = %d
            AND v.visit_date >= DATE_SUB(CURRENT_DATE(), INTERVAL %d MONTH)
            GROUP BY month, v.classification
            ORDER BY month ASC",
            $inspector_id,
            $months
        );
        
        return $wpdb->get_results($query);
    }

    /**
     * Update inspector classification based on recent evaluations.
     *
     * @param int $inspector_id The inspector ID.
     * @return bool Success or failure.
     */
    public function update_classification_from_evaluations($inspector_id) {
        global $wpdb;
        
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        
        // Get average score from last 3 visits
        $query = $wpdb->prepare(
            "SELECT AVG(e.score) as average_score
            FROM {$visits_table} v
            JOIN {$evaluations_table} e ON v.id = e.visit_id
            WHERE v.inspector_id = %d
            ORDER BY v.visit_date DESC
            LIMIT 3",
            $inspector_id
        );
        
        $average_score = $wpdb->get_var($query);
        
        if ($average_score === null) {
            return false;
        }
        
        // Determine classification based on average score
        $classification = 'passive';
        if ($average_score >= 8) {
            $classification = 'promoter';
        } elseif ($average_score <= 5) {
            $classification = 'detractor';
        }
        
        // Update inspector classification
        return $this->update($inspector_id, array('classification' => $classification));
    }

    /**
     * Get inspector properties.
     *
     * @param string $prop The property to get.
     * @return mixed The property value.
     */
    public function __get($prop) {
        if (isset($this->data->$prop)) {
            return $this->data->$prop;
        }
        
        return null;
    }

    /**
     * Set inspector properties.
     *
     * @param string $prop The property to set.
     * @param mixed $value The value to set.
     */
    public function __set($prop, $value) {
        $this->data->$prop = $value;
    }

    /**
     * Check if a property exists.
     *
     * @param string $prop The property to check.
     * @return bool Whether the property exists.
     */
    public function __isset($prop) {
        return isset($this->data->$prop);
    }
}