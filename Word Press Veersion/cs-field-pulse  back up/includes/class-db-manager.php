<?php
/**
 * Database Manager class.
 *
 * Handles database operations for the plugin.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_DB_Manager {

    /**
     * Get the table name with proper prefix.
     *
     * @param string $table The base table name without prefix.
     * @return string The full table name with prefix.
     */
    public static function get_table_name($table) {
        global $wpdb;
        return $wpdb->prefix . 'cs_' . $table;
    }

    /**
     * Insert a record into the database.
     *
     * @param string $table The table name without prefix.
     * @param array $data The data to insert.
     * @return int|false The inserted ID or false on failure.
     */
    public static function insert($table, $data) {
        global $wpdb;
        $table_name = self::get_table_name($table);
        
        // Add created_at and updated_at if they exist in the table
        if (in_array($table, array('inspectors', 'visits', 'evaluation_criteria'))) {
            $data['created_at'] = current_time('mysql');
            $data['updated_at'] = current_time('mysql');
        }
        
        $result = $wpdb->insert($table_name, $data);
        
        if ($result === false) {
            return false;
        }
        
        return $wpdb->insert_id;
    }

    /**
     * Update a record in the database.
     *
     * @param string $table The table name without prefix.
     * @param array $data The data to update.
     * @param array $where The where conditions for the update.
     * @return int|false The number of rows updated or false on failure.
     */
    public static function update($table, $data, $where) {
        global $wpdb;
        $table_name = self::get_table_name($table);
        
        // Add updated_at if it exists in the table
        if (in_array($table, array('inspectors', 'visits', 'evaluation_criteria'))) {
            $data['updated_at'] = current_time('mysql');
        }
        
        return $wpdb->update($table_name, $data, $where);
    }

    /**
     * Delete a record from the database.
     *
     * @param string $table The table name without prefix.
     * @param array $where The where conditions for the delete.
     * @return int|false The number of rows deleted or false on failure.
     */
    public static function delete($table, $where) {
        global $wpdb;
        $table_name = self::get_table_name($table);
        
        return $wpdb->delete($table_name, $where);
    }

    /**
     * Get a single record from the database.
     *
     * @param string $table The table name without prefix.
     * @param array $where The where conditions for the query.
     * @param string $output_type The type of output to return (ARRAY_A|ARRAY_N|OBJECT).
     * @return mixed The query result.
     */
    public static function get_row($table, $where, $output_type = OBJECT) {
        global $wpdb;
        $table_name = self::get_table_name($table);
        
        $where_sql = self::build_where_clause($where);
        
        $query = "SELECT * FROM $table_name WHERE $where_sql LIMIT 1";
        
        return $wpdb->get_row($query, $output_type);
    }

    /**
     * Get multiple records from the database.
     *
     * @param string $table The table name without prefix.
     * @param array $where The where conditions for the query.
     * @param string $orderby The field to order by.
     * @param string $order The order direction (ASC|DESC).
     * @param int $limit The maximum number of results to return.
     * @param int $offset The offset for the results.
     * @param string $output_type The type of output to return (ARRAY_A|ARRAY_N|OBJECT).
     * @return array The query results.
     */
    public static function get_results($table, $where = array(), $orderby = 'id', $order = 'DESC', $limit = 0, $offset = 0, $output_type = OBJECT) {
        global $wpdb;
        $table_name = self::get_table_name($table);
        
        $query = "SELECT * FROM $table_name";
        
        if (!empty($where)) {
            $where_sql = self::build_where_clause($where);
            $query .= " WHERE $where_sql";
        }
        
        if (!empty($orderby)) {
            $query .= " ORDER BY $orderby $order";
        }
        
        if ($limit > 0) {
            $query .= " LIMIT $offset, $limit";
        }
        
        return $wpdb->get_results($query, $output_type);
    }

    /**
     * Count records in the database.
     *
     * @param string $table The table name without prefix.
     * @param array $where The where conditions for the query.
     * @return int The count of records.
     */
    public static function count($table, $where = array()) {
        global $wpdb;
        $table_name = self::get_table_name($table);
        
        $query = "SELECT COUNT(*) FROM $table_name";
        
        if (!empty($where)) {
            $where_sql = self::build_where_clause($where);
            $query .= " WHERE $where_sql";
        }
        
        return $wpdb->get_var($query);
    }

    /**
     * Build a WHERE clause for SQL queries.
     *
     * @param array $where The where conditions as key-value pairs.
     * @return string The WHERE clause.
     */
    private static function build_where_clause($where) {
        global $wpdb;
        
        $conditions = array();
        
        foreach ($where as $key => $value) {
            if (is_null($value)) {
                $conditions[] = "`$key` IS NULL";
            } else {
                $conditions[] = "`$key` = " . $wpdb->prepare("%s", $value);
            }
        }
        
        return implode(' AND ', $conditions);
    }

    /**
     * Execute a custom SQL query.
     *
     * @param string $query The SQL query to execute.
     * @param string $output_type The type of output to return (ARRAY_A|ARRAY_N|OBJECT).
     * @return mixed The query result.
     */
    public static function query($query, $output_type = OBJECT) {
        global $wpdb;
        
        return $wpdb->get_results($query, $output_type);
    }
}