<?php
/**
 * Visit Model.
 *
 * Handles visit data and operations.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Visit {

    /**
     * The visit data.
     *
     * @var array
     */
    private $data;

    /**
     * Constructor.
     *
     * @param int|object $visit Visit ID or object.
     */
    public function __construct($visit = 0) {
        if (is_numeric($visit) && $visit > 0) {
            $this->data = $this->get_by_id($visit);
        } elseif (is_object($visit)) {
            $this->data = $visit;
        } else {
            $this->data = new stdClass();
        }
    }

    /**
     * Get visit by ID.
     *
     * @param int $id The visit ID.
     * @return object The visit data.
     */
    public function get_by_id($id) {
        return CS_Field_Pulse_DB_Manager::get_row('visits', array('id' => $id));
    }

    /**
     * Get all visits.
     *
     * @param array $args Query arguments.
     * @return array The visits.
     */
    public function get_all($args = array()) {
        $defaults = array(
            'where' => array(),
            'orderby' => 'visit_date',
            'order' => 'DESC',
            'limit' => 0,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        return CS_Field_Pulse_DB_Manager::get_results(
            'visits',
            $args['where'],
            $args['orderby'],
            $args['order'],
            $args['limit'],
            $args['offset']
        );
    }

    /**
     * Create a new visit.
     *
     * @param array $data The visit data.
     * @return int|false The visit ID or false on failure.
     */
    public function create($data) {
        $data['created_by'] = get_current_user_id();
        return CS_Field_Pulse_DB_Manager::insert('visits', $data);
    }

    /**
     * Update visit data.
     *
     * @param int $id The visit ID.
     * @param array $data The data to update.
     * @return int|false The number of rows updated or false on failure.
     */
    public function update($id, $data) {
        return CS_Field_Pulse_DB_Manager::update('visits', $data, array('id' => $id));
    }

    /**
     * Delete a visit.
     *
     * @param int $id The visit ID.
     * @return int|false The number of rows deleted or false on failure.
     */
    public function delete($id) {
        // First delete related evaluations
        CS_Field_Pulse_DB_Manager::delete('evaluations', array('visit_id' => $id));
        
        // Then delete the visit
        return CS_Field_Pulse_DB_Manager::delete('visits', array('id' => $id));
    }

    /**
     * Get visits for an inspector.
     *
     * @param int $inspector_id The inspector ID.
     * @param array $args Additional query arguments.
     * @return array The visits.
     */
    public function get_by_inspector($inspector_id, $args = array()) {
        $defaults = array(
            'orderby' => 'visit_date',
            'order' => 'DESC',
            'limit' => 0,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        return CS_Field_Pulse_DB_Manager::get_results(
            'visits',
            array('inspector_id' => $inspector_id),
            $args['orderby'],
            $args['order'],
            $args['limit'],
            $args['offset']
        );
    }

    /**
     * Get visits with inspector data.
     *
     * @param array $args Query arguments.
     * @return array The visits with inspector data.
     */
    public function get_with_inspector_data($args = array()) {
        global $wpdb;
        
        $defaults = array(
            'where' => array(),
            'orderby' => 'v.visit_date',
            'order' => 'DESC',
            'limit' => 0,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        $inspectors_table = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        
        $where_clause = '';
        if (!empty($args['where'])) {
            $where_conditions = array();
            foreach ($args['where'] as $key => $value) {
                $where_conditions[] = $wpdb->prepare("v.{$key} = %s", $value);
            }
            $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        }
        
        $limit_clause = '';
        if ($args['limit'] > 0) {
            $limit_clause = "LIMIT {$args['offset']}, {$args['limit']}";
        }
        
        $query = "
            SELECT v.*, i.name as inspector_name, i.classification as inspector_classification 
            FROM {$visits_table} v
            JOIN {$inspectors_table} i ON v.inspector_id = i.id
            {$where_clause}
            ORDER BY {$args['orderby']} {$args['order']}
            {$limit_clause}
        ";
        
        return $wpdb->get_results($query);
    }

    /**
     * Get recent visits.
     *
     * @param int $limit The number of visits to retrieve.
     * @return array The recent visits.
     */
    public function get_recent($limit = 5) {
        return $this->get_with_inspector_data(array(
            'limit' => $limit
        ));
    }

    /**
     * Save visit evaluations.
     *
     * @param int $visit_id The visit ID.
     * @param array $evaluations The evaluations data.
     * @return bool Success or failure.
     */
    public function save_evaluations($visit_id, $evaluations) {
        global $wpdb;
        
        if (!is_array($evaluations) || empty($evaluations)) {
            return false;
        }
        
        $table_name = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        
        // Begin transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Delete existing evaluations for this visit
            CS_Field_Pulse_DB_Manager::delete('evaluations', array('visit_id' => $visit_id));
            
            // Insert new evaluations
            foreach ($evaluations as $criteria_key => $evaluation) {
                $data = array(
                    'visit_id' => $visit_id,
                    'criteria_key' => $criteria_key,
                    'score' => $evaluation['score'],
                    'notes' => isset($evaluation['notes']) ? $evaluation['notes'] : ''
                );
                
                $result = CS_Field_Pulse_DB_Manager::insert('evaluations', $data);
                
                if ($result === false) {
                    throw new Exception('Failed to insert evaluation');
                }
            }
            
            // Commit transaction
            $wpdb->query('COMMIT');
            
            // Update inspector classification based on new evaluations
            $visit = $this->get_by_id($visit_id);
            if ($visit) {
                $inspector = new CS_Field_Pulse_Inspector($visit->inspector_id);
                $inspector->update_classification_from_evaluations($visit->inspector_id);
            }
            
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $wpdb->query('ROLLBACK');
            return false;
        }
    }

    /**
     * Get evaluations for a visit.
     *
     * @param int $visit_id The visit ID.
     * @return array The evaluations.
     */
    public function get_evaluations($visit_id) {
        global $wpdb;
        
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        $criteria_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluation_criteria');
        
        $query = $wpdb->prepare(
            "SELECT e.*, c.display_name, c.description
            FROM {$evaluations_table} e
            JOIN {$criteria_table} c ON e.criteria_key = c.criteria_key
            WHERE e.visit_id = %d",
            $visit_id
        );
        
        return $wpdb->get_results($query);
    }

    /**
     * Get visit statistics by period.
     *
     * @param string $period The period to group by (day, week, month, year).
     * @param int $limit The number of periods to include.
     * @return array The visit statistics.
     */
    public function get_statistics_by_period($period = 'month', $limit = 12) {
        global $wpdb;
        
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        
        $period_format = '%Y-%m-%d';
        $interval = 'DAY';
        
        switch ($period) {
            case 'week':
                $period_format = '%Y-%u';
                $interval = 'WEEK';
                break;
            case 'month':
                $period_format = '%Y-%m';
                $interval = 'MONTH';
                break;
            case 'year':
                $period_format = '%Y';
                $interval = 'YEAR';
                break;
        }
        
        $query = $wpdb->prepare(
            "SELECT 
                DATE_FORMAT(visit_date, %s) as period,
                COUNT(*) as total_visits,
                SUM(CASE WHEN classification = 'promoter' THEN 1 ELSE 0 END) as promoters,
                SUM(CASE WHEN classification = 'passive' THEN 1 ELSE 0 END) as passives,
                SUM(CASE WHEN classification = 'detractor' THEN 1 ELSE 0 END) as detractors
            FROM {$visits_table}
            WHERE visit_date >= DATE_SUB(CURRENT_DATE(), INTERVAL %d {$interval})
            GROUP BY period
            ORDER BY period DESC
            LIMIT %d",
            $period_format,
            $limit,
            $limit
        );
        
        return $wpdb->get_results($query);
    }

    /**
     * Get visit properties.
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
     * Set visit properties.
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