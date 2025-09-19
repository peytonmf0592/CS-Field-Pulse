<?php
/**
 * Evaluation Model.
 *
 * Handles evaluation criteria data and operations.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Evaluation {

    /**
     * The evaluation data.
     *
     * @var array
     */
    private $data;

    /**
     * Constructor.
     *
     * @param int|object $evaluation Evaluation ID or object.
     */
    public function __construct($evaluation = 0) {
        if (is_numeric($evaluation) && $evaluation > 0) {
            $this->data = $this->get_by_id($evaluation);
        } elseif (is_object($evaluation)) {
            $this->data = $evaluation;
        } else {
            $this->data = new stdClass();
        }
    }

    /**
     * Get evaluation by ID.
     *
     * @param int $id The evaluation ID.
     * @return object The evaluation data.
     */
    public function get_by_id($id) {
        return CS_Field_Pulse_DB_Manager::get_row('evaluations', array('id' => $id));
    }

    /**
     * Get all evaluation criteria.
     *
     * @param bool $active_only Whether to get only active criteria.
     * @return array The evaluation criteria.
     */
    public function get_all_criteria($active_only = true) {
        $where = array();
        
        if ($active_only) {
            $where['active'] = 1;
        }
        
        return CS_Field_Pulse_DB_Manager::get_results(
            'evaluation_criteria',
            $where,
            'display_name',
            'ASC'
        );
    }

    /**
     * Create a new evaluation criteria.
     *
     * @param array $data The criteria data.
     * @return int|false The criteria ID or false on failure.
     */
    public function create_criteria($data) {
        return CS_Field_Pulse_DB_Manager::insert('evaluation_criteria', $data);
    }

    /**
     * Update evaluation criteria.
     *
     * @param int $id The criteria ID.
     * @param array $data The data to update.
     * @return int|false The number of rows updated or false on failure.
     */
    public function update_criteria($id, $data) {
        return CS_Field_Pulse_DB_Manager::update('evaluation_criteria', $data, array('id' => $id));
    }

    /**
     * Delete evaluation criteria.
     *
     * @param int $id The criteria ID.
     * @return int|false The number of rows deleted or false on failure.
     */
    public function delete_criteria($id) {
        return CS_Field_Pulse_DB_Manager::delete('evaluation_criteria', array('id' => $id));
    }

    /**
     * Get evaluation criteria by key.
     *
     * @param string $key The criteria key.
     * @return object The criteria data.
     */
    public function get_criteria_by_key($key) {
        return CS_Field_Pulse_DB_Manager::get_row('evaluation_criteria', array('criteria_key' => $key));
    }

    /**
     * Toggle evaluation criteria active status.
     *
     * @param int $id The criteria ID.
     * @param bool $active The active status to set.
     * @return int|false The number of rows updated or false on failure.
     */
    public function toggle_criteria_active($id, $active) {
        return CS_Field_Pulse_DB_Manager::update('evaluation_criteria', array('active' => $active ? 1 : 0), array('id' => $id));
    }

    /**
     * Get aggregate evaluation scores by criteria.
     *
     * @param array $args Query arguments.
     * @return array The aggregate scores.
     */
    public function get_aggregate_scores_by_criteria($args = array()) {
        global $wpdb;
        
        $defaults = array(
            'inspector_id' => 0,
            'period' => 'all', // all, month, year
            'limit' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        $criteria_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluation_criteria');
        
        $where_clauses = array();
        $where_values = array();
        
        if ($args['inspector_id'] > 0) {
            $where_clauses[] = 'v.inspector_id = %d';
            $where_values[] = $args['inspector_id'];
        }
        
        if ($args['period'] === 'month') {
            $where_clauses[] = 'v.visit_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)';
        } elseif ($args['period'] === 'year') {
            $where_clauses[] = 'v.visit_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)';
        }
        
        $where_sql = '';
        if (!empty($where_clauses)) {
            $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
        }
        
        $limit_sql = '';
        if ($args['limit'] > 0) {
            $limit_sql = "LIMIT {$args['limit']}";
        }
        
        $query = $wpdb->prepare(
            "SELECT 
                e.criteria_key,
                c.display_name,
                AVG(e.score) as average_score,
                COUNT(e.id) as count
            FROM {$evaluations_table} e
            JOIN {$visits_table} v ON e.visit_id = v.id
            JOIN {$criteria_table} c ON e.criteria_key = c.criteria_key
            {$where_sql}
            GROUP BY e.criteria_key, c.display_name
            ORDER BY average_score DESC
            {$limit_sql}",
            $where_values
        );
        
        return $wpdb->get_results($query);
    }

    /**
     * Get evaluation scores over time.
     *
     * @param string $criteria_key The criteria key to track.
     * @param string $period The period to group by (day, week, month).
     * @param int $limit The number of periods to include.
     * @return array The scores over time.
     */
    public function get_scores_over_time($criteria_key = null, $period = 'month', $limit = 12) {
        global $wpdb;
        
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
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
        }
        
        $criteria_clause = '';
        $where_values = array($period_format, $limit);
        
        if ($criteria_key) {
            $criteria_clause = 'AND e.criteria_key = %s';
            $where_values = array($period_format, $criteria_key, $limit);
        }
        
        $query = $wpdb->prepare(
            "SELECT 
                DATE_FORMAT(v.visit_date, %s) as period,
                " . ($criteria_key ? '' : 'e.criteria_key,') . "
                AVG(e.score) as average_score,
                COUNT(e.id) as count
            FROM {$evaluations_table} e
            JOIN {$visits_table} v ON e.visit_id = v.id
            WHERE v.visit_date >= DATE_SUB(CURRENT_DATE(), INTERVAL {$limit} {$interval})
            {$criteria_clause}
            GROUP BY period" . ($criteria_key ? '' : ', e.criteria_key') . "
            ORDER BY period DESC, " . ($criteria_key ? '' : 'e.criteria_key,') . " average_score DESC",
            $where_values
        );
        
        return $wpdb->get_results($query);
    }

    /**
     * Get evaluation properties.
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
     * Set evaluation properties.
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