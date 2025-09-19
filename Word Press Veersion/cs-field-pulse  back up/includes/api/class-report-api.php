<?php
/**
 * Report API class.
 *
 * Handles reporting functionality.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Report_API {

    /**
     * Get dashboard data.
     */
    public static function get_dashboard_data() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        try {
            $dashboard = new CS_Field_Pulse_Dashboard();
            $summary = $dashboard->get_summary();
            
            $classification_chart = $dashboard->get_classification_chart_data();
            $visits_chart = $dashboard->get_visits_by_period_chart_data('month', 6);
            $criteria_chart = $dashboard->get_criteria_performance_chart_data();
            
            $response = array(
                'summary' => $summary,
                'charts' => array(
                    'classification' => $classification_chart,
                    'visits' => $visits_chart,
                    'criteria' => $criteria_chart
                )
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get inspector performance data.
     */
    public static function get_inspector_performance() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        
        if (!$inspector_id) {
            wp_send_json_error(__('Invalid inspector ID', 'cs-field-pulse'));
        }
        
        try {
            $dashboard = new CS_Field_Pulse_Dashboard();
            $trend_data = $dashboard->get_inspector_performance_trend($inspector_id, 6);
            
            $inspector = new CS_Field_Pulse_Inspector();
            $inspector_data = $inspector->get_by_id($inspector_id);
            
            $visit = new CS_Field_Pulse_Visit();
            $visits = $visit->get_by_inspector($inspector_id, array('limit' => 5));
            
            $response = array(
                'inspector' => $inspector_data,
                'trend' => $trend_data,
                'recent_visits' => $visits
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get visit statistics.
     */
    public static function get_visit_statistics() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $period = isset($_POST['period']) ? sanitize_text_field($_POST['period']) : 'month';
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 12;
        
        try {
            $visit = new CS_Field_Pulse_Visit();
            $statistics = $visit->get_statistics_by_period($period, $limit);
            
            $dashboard = new CS_Field_Pulse_Dashboard();
            $chart_data = $dashboard->get_visits_by_period_chart_data($period, $limit);
            
            $response = array(
                'statistics' => $statistics,
                'chart' => $chart_data
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get evaluation criteria statistics.
     */
    public static function get_criteria_statistics() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $period = isset($_POST['period']) ? sanitize_text_field($_POST['period']) : 'all';
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 0;
        
        try {
            $args = array(
                'period' => $period
            );
            
            if ($inspector_id) {
                $args['inspector_id'] = $inspector_id;
            }
            
            $evaluation = new CS_Field_Pulse_Evaluation();
            $statistics = $evaluation->get_aggregate_scores_by_criteria($args);
            
            $response = array(
                'statistics' => $statistics
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get classification distribution.
     */
    public static function get_classification_distribution() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        try {
            $inspector_manager = new CS_Field_Pulse_Inspector_Manager();
            $inspector_distribution = $inspector_manager->get_classification_counts();
            
            $visit_manager = new CS_Field_Pulse_Visit_Manager();
            $visit_distribution = $visit_manager->get_classification_distribution('month');
            
            $response = array(
                'inspectors' => $inspector_distribution,
                'visits' => $visit_distribution
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get top performing inspectors.
     */
    public static function get_top_performing_inspectors() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 5;
        
        try {
            $dashboard = new CS_Field_Pulse_Dashboard();
            $top_inspectors = $dashboard->get_top_performing_inspectors($limit);
            
            wp_send_json_success($top_inspectors);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Get inspectors needing attention.
     */
    public static function get_inspectors_needing_attention() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 5;
        
        try {
            $dashboard = new CS_Field_Pulse_Dashboard();
            $needing_attention = $dashboard->get_inspectors_needing_attention($limit);
            
            wp_send_json_success($needing_attention);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Export inspector data to CSV.
     */
    public static function export_inspector_data() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('You do not have permission to do this', 'cs-field-pulse'));
            return;
        }
        
        try {
            $inspector = new CS_Field_Pulse_Inspector();
            $inspectors = $inspector->get_all();
            
            if (empty($inspectors)) {
                wp_send_json_error(__('No data to export', 'cs-field-pulse'));
                return;
            }
            
            $data = array();
            $data[] = array(
                __('ID', 'cs-field-pulse'),
                __('Name', 'cs-field-pulse'),
                __('Email', 'cs-field-pulse'),
                __('Phone', 'cs-field-pulse'),
                __('Location', 'cs-field-pulse'),
                __('Classification', 'cs-field-pulse'),
                __('Notes', 'cs-field-pulse'),
                __('Created', 'cs-field-pulse'),
                __('Updated', 'cs-field-pulse')
            );
            
            foreach ($inspectors as $inspector_data) {
                $data[] = array(
                    $inspector_data->id,
                    $inspector_data->name,
                    $inspector_data->email,
                    $inspector_data->phone,
                    $inspector_data->location,
                    $inspector_data->classification,
                    $inspector_data->notes,
                    $inspector_data->created_at,
                    $inspector_data->updated_at
                );
            }
            
            $csv = '';
            foreach ($data as $row) {
                $csv .= '"' . implode('","', $row) . '"' . "\n";
            }
            
            $filename = 'cs-field-pulse-inspectors-' . date('Y-m-d') . '.csv';
            
            $response = array(
                'filename' => $filename,
                'data' => $csv
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Export visit data to CSV.
     */
    public static function export_visit_data() {
        check_ajax_referer('cs_field_pulse_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('You do not have permission to do this', 'cs-field-pulse'));
            return;
        }
        
        try {
            $visit = new CS_Field_Pulse_Visit();
            $visits = $visit->get_with_inspector_data();
            
            if (empty($visits)) {
                wp_send_json_error(__('No data to export', 'cs-field-pulse'));
                return;
            }
            
            $data = array();
            $data[] = array(
                __('ID', 'cs-field-pulse'),
                __('Inspector', 'cs-field-pulse'),
                __('Visit Date', 'cs-field-pulse'),
                __('Location Type', 'cs-field-pulse'),
                __('Classification', 'cs-field-pulse'),
                __('Notes', 'cs-field-pulse'),
                __('Created By', 'cs-field-pulse'),
                __('Created', 'cs-field-pulse'),
                __('Updated', 'cs-field-pulse')
            );
            
            foreach ($visits as $visit_data) {
                $data[] = array(
                    $visit_data->id,
                    $visit_data->inspector_name,
                    $visit_data->visit_date,
                    $visit_data->location_type,
                    $visit_data->classification,
                    $visit_data->notes,
                    $visit_data->created_by,
                    $visit_data->created_at,
                    $visit_data->updated_at
                );
            }
            
            $csv = '';
            foreach ($data as $row) {
                $csv .= '"' . implode('","', $row) . '"' . "\n";
            }
            
            $filename = 'cs-field-pulse-visits-' . date('Y-m-d') . '.csv';
            
            $response = array(
                'filename' => $filename,
                'data' => $csv
            );
            
            wp_send_json_success($response);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }
}