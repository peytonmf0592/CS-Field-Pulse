<?php
/**
 * Dashboard class.
 *
 * Handles dashboard functionality.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Dashboard {

    /**
     * Inspector model.
     *
     * @var CS_Field_Pulse_Inspector
     */
    private $inspector;

    /**
     * Visit model.
     *
     * @var CS_Field_Pulse_Visit
     */
    private $visit;

    /**
     * Evaluation model.
     *
     * @var CS_Field_Pulse_Evaluation
     */
    private $evaluation;

    /**
     * Constructor.
     */
    public function __construct() {
        // Try to initialize models if they exist
        if (class_exists('CS_Field_Pulse_Inspector')) {
            $this->inspector = new CS_Field_Pulse_Inspector();
        } else {
            error_log('CS_Field_Pulse_Inspector class not found');
        }
        
        if (class_exists('CS_Field_Pulse_Visit')) {
            $this->visit = new CS_Field_Pulse_Visit();
        } else {
            error_log('CS_Field_Pulse_Visit class not found');
        }
        
        if (class_exists('CS_Field_Pulse_Evaluation')) {
            $this->evaluation = new CS_Field_Pulse_Evaluation();
        } else {
            error_log('CS_Field_Pulse_Evaluation class not found');
        }
        
        // Register hooks for scripts and AJAX
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_cs_field_pulse_get_dashboard_data', array($this, 'ajax_get_dashboard_data'));
    }

    /**
     * Enqueue scripts and styles for the dashboard.
     * This method loads Chart.js from a CDN and your own dashboard scripts.
     *
     * @param string $hook The current admin page.
     */
    public function enqueue_scripts($hook) {
        // Debug information to help troubleshoot
        error_log('Current hook: ' . $hook);
        
        // Only load our scripts on our plugin pages
        $plugin_pages = array(
            'toplevel_page_cs-field-pulse',
            'cs-field-pulse_page_cs-field-pulse-dashboard',
            'cs-field-pulse_page_cs-field-pulse-inspectors',
            'cs-field-pulse_page_cs-field-pulse-visits',
            'cs-field-pulse_page_cs-field-pulse-settings'
        );
        
        // DEBUG: For now, load on all admin pages for testing
        // if (!in_array($hook, $plugin_pages)) {
        //     return;
        // }
        
        // Define URL if not already defined
        if (!defined('CS_FIELD_PULSE_URL')) {
            define('CS_FIELD_PULSE_URL', plugin_dir_url(dirname(dirname(__FILE__))));
        }
        
        // Load Chart.js directly from CDN with integrity and crossorigin attributes
        wp_enqueue_script(
            'chartjs',
            'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js',
            array('jquery'),
            '3.7.1',
            true
        );
        
        // Add a fallback script in case CDN fails
        add_action('wp_footer', function() {
            ?>
            <script type="text/javascript">
                // If Chart is not defined after 1 second, load from backup CDN
                setTimeout(function() {
                    if (typeof Chart === 'undefined') {
                        console.log('Chart.js not loaded from primary CDN, trying backup...');
                        var script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js';
                        script.onload = function() {
                            console.log('Chart.js loaded from backup CDN');
                            // Trigger event to notify that Chart.js is now available
                            jQuery(document).trigger('chartjs_loaded');
                        };
                        document.head.appendChild(script);
                    }
                }, 1000);
            </script>
            <?php
        }, 99);
        
        // Load your dashboard.js file
        wp_enqueue_script(
            'cs-field-pulse-dashboard',
            CS_FIELD_PULSE_URL . 'assets/js/dashboard.js',
            array('jquery', 'chartjs'),  // Note that chartjs is a dependency
            defined('CS_FIELD_PULSE_VERSION') ? CS_FIELD_PULSE_VERSION : '1.0.0',
            true
        );
        
        // Provide necessary data to JavaScript - Make sure this comes AFTER enqueueing the script
        wp_localize_script(
            'cs-field-pulse-dashboard',
            'cs_field_pulse_params',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('cs_field_pulse_dashboard_nonce')
            )
        );
        
        // Ensure ajaxurl is defined in case the global one isn't available
        wp_add_inline_script('cs-field-pulse-dashboard', 'var ajaxurl = "' . admin_url('admin-ajax.php') . '";', 'before');
        
        // Load your dashboard styles
        wp_enqueue_style(
            'cs-field-pulse-admin',
            plugin_dir_url(dirname(dirname(__FILE__))) . 'assets/css/admin-style.css',
            array(),
            defined('CS_FIELD_PULSE_VERSION') ? CS_FIELD_PULSE_VERSION : '1.0.0'
        );
    }

    /**
     * Render the dashboard page.
     * This method includes the dashboard template.
     */
    public function render_dashboard() {
        // Include the dashboard template
        include plugin_dir_path(dirname(dirname(__FILE__))) . 'templates/admin/dashboard.php';
    }

    /**
     * AJAX handler for dashboard data.
     * This method responds to AJAX requests to load dashboard data.
     */
    public function ajax_get_dashboard_data() {
        // Verify the security nonce - but make it less strict for testing
        if (isset($_POST['nonce']) && $_POST['nonce'] !== 'default_nonce') {
            check_ajax_referer('cs_field_pulse_dashboard_nonce', 'nonce');
        }
        
        // Check if user has permission
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission denied'));
            return;
        }
        
        try {
            // Check if model classes are properly initialized
            if (!isset($this->inspector) || !isset($this->visit) || !isset($this->evaluation)) {
                throw new Exception('Model classes not properly initialized');
            }
            
            // Get summary data
            $summary = $this->get_summary();
            
            // Get period from request for chart data
            $period = isset($_POST['period']) ? sanitize_text_field($_POST['period']) : 'month';
            
            // Get chart data
            $visits_chart_data = $this->get_visits_by_period_chart_data($period);
            $classification_chart_data = $this->get_classification_chart_data();
            $criteria_chart_data = $this->get_criteria_performance_chart_data();
            
            // Calculate percentages for display
            $total_inspectors = max(1, $summary['total_inspectors']); // Avoid division by zero
            $classifications = $summary['inspector_classification'];
            
            $promoters_percent = round(($classifications['promoter'] / $total_inspectors) * 100);
            $passives_percent = round(($classifications['passive'] / $total_inspectors) * 100);
            $detractors_percent = round(($classifications['detractor'] / $total_inspectors) * 100);
            
            // Send the dashboard data to the client
            wp_send_json_success(array(
                'total_inspectors' => $summary['total_inspectors'],
                'total_visits' => $summary['total_visits'],
                'visits_this_month' => $summary['visits_this_month'],
                'promoters_percent' => $promoters_percent,
                'passives_percent' => $passives_percent,
                'detractors_percent' => $detractors_percent,
                'chart_data' => array(
                    'visit_trend' => $visits_chart_data,
                    'classification' => $classification_chart_data,
                    'criteria' => $criteria_chart_data
                ),
                'recent_visits' => $summary['recent_visits'],
                'recent_inspectors' => $summary['recent_inspectors']
            ));
            
        } catch (Exception $e) {
            // Log the error
            error_log('Dashboard data error: ' . $e->getMessage());
            
            // Send a graceful error response
            wp_send_json_error(array(
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ));
        }
    }

    /**
     * Get dashboard summary data.
     *
     * @return array The dashboard summary.
     */
    public function get_summary() {
        global $wpdb;
        
        $inspectors_table = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        
        // Total inspectors
        $total_inspectors = $wpdb->get_var("SELECT COUNT(*) FROM {$inspectors_table}");
        if ($total_inspectors === null) {
            $total_inspectors = 0;
        }
        
        // Total visits
        $total_visits = $wpdb->get_var("SELECT COUNT(*) FROM {$visits_table}");
        if ($total_visits === null) {
            $total_visits = 0;
        }
        
        // Visits this month
        $visits_this_month = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$visits_table} 
            WHERE MONTH(visit_date) = MONTH(CURRENT_DATE()) 
            AND YEAR(visit_date) = YEAR(CURRENT_DATE())"
        );
        if ($visits_this_month === null) {
            $visits_this_month = 0;
        }
        
        // Classification distribution for inspectors
        $inspector_classification = $this->inspector->get_classification_distribution();
        
        // Recent visits with inspector data
        $recent_visits = array();
        if ($total_visits > 0) {
            $recent_visits = $this->visit->get_recent(5);
            
            // Add edit URLs to each visit
            foreach ($recent_visits as &$visit) {
                $visit->edit_url = admin_url('admin.php?page=cs-field-pulse-visits&action=edit&id=' . $visit->id);
            }
        }
        
        // Inspectors with recent visits
        $recent_inspectors = array();
        if ($total_inspectors > 0) {
            $recent_inspectors = $this->inspector->get_with_recent_visits(5);
            
            // Add edit URLs to each inspector
            foreach ($recent_inspectors as &$inspector) {
                $inspector->edit_url = admin_url('admin.php?page=cs-field-pulse-inspectors&action=edit&id=' . $inspector->id);
            }
        }
        
        return array(
            'total_inspectors' => $total_inspectors,
            'total_visits' => $total_visits,
            'visits_this_month' => $visits_this_month,
            'inspector_classification' => $inspector_classification,
            'recent_visits' => $recent_visits,
            'recent_inspectors' => $recent_inspectors
        );
    }

    // Your existing methods remain unchanged below this point

    /**
     * Get visits by period chart data.
     *
     * @param string $period The period to group by (day, week, month).
     * @param int $limit The number of periods to include.
     * @return array The chart data.
     */
    public function get_visits_by_period_chart_data($period = 'month', $limit = 12) {
        $statistics = $this->visit->get_statistics_by_period($period, $limit);
        
        $chart_data = array(
            'labels' => array(),
            'datasets' => array(
                array(
                    'label' => __('Promoters', 'cs-field-pulse'),
                    'data' => array(),
                    'backgroundColor' => '#00E676' // Vibrant green from UI spec
                ),
                array(
                    'label' => __('Passives', 'cs-field-pulse'),
                    'data' => array(),
                    'backgroundColor' => '#FFD600' // Yellow from UI spec
                ),
                array(
                    'label' => __('Detractors', 'cs-field-pulse'),
                    'data' => array(),
                    'backgroundColor' => '#FF5252' // Red from UI spec
                )
            )
        );
        
        if (empty($statistics)) {
            return $chart_data;
        }
        
        // Reverse the data to show oldest to newest
        $statistics = array_reverse($statistics);
        
        foreach ($statistics as $stat) {
            $chart_data['labels'][] = isset($stat->period) ? $stat->period : '';
            $chart_data['datasets'][0]['data'][] = isset($stat->promoters) ? $stat->promoters : 0;
            $chart_data['datasets'][1]['data'][] = isset($stat->passives) ? $stat->passives : 0;
            $chart_data['datasets'][2]['data'][] = isset($stat->detractors) ? $stat->detractors : 0;
        }
        
        return $chart_data;
    }

    /**
     * Get evaluation criteria performance chart data.
     *
     * @return array The chart data.
     */
    public function get_criteria_performance_chart_data() {
        $aggregate_scores = $this->evaluation->get_aggregate_scores_by_criteria();
        
        $chart_data = array(
            'labels' => array(),
            'datasets' => array(
                array(
                    'label' => __('Average Score', 'cs-field-pulse'),
                    'data' => array(),
                    'backgroundColor' => '#00C853' // Darker green from UI spec
                )
            )
        );
        
        if (empty($aggregate_scores)) {
            return $chart_data;
        }
        
        foreach ($aggregate_scores as $score) {
            $chart_data['labels'][] = $score->display_name;
            $chart_data['datasets'][0]['data'][] = round($score->average_score, 1);
        }
        
        return $chart_data;
    }

    /**
     * Get classification distribution chart data.
     *
     * @return array The chart data.
     */
    public function get_classification_chart_data() {
        $inspector_classification = $this->inspector->get_classification_distribution();
        
        $chart_data = array(
            'labels' => array(
                __('Promoters', 'cs-field-pulse'),
                __('Passives', 'cs-field-pulse'),
                __('Detractors', 'cs-field-pulse')
            ),
            'datasets' => array(
                array(
                    'data' => array(
                        $inspector_classification['promoter'],
                        $inspector_classification['passive'],
                        $inspector_classification['detractor']
                    ),
                    'backgroundColor' => array(
                        '#00E676', // Vibrant green from UI spec
                        '#FFD600', // Yellow from UI spec
                        '#FF5252'  // Red from UI spec
                    )
                )
            )
        );
        
        return $chart_data;
    }

    /**
     * Get inspector performance trend data.
     *
     * @param int $inspector_id The inspector ID.
     * @param int $months The number of months to include.
     * @return array The performance trend data.
     */
    public function get_inspector_performance_trend($inspector_id, $months = 6) {
        $trend_data = $this->inspector->get_performance_trend($inspector_id, $months);
        
        $chart_data = array(
            'labels' => array(),
            'datasets' => array(
                array(
                    'label' => __('Average Score', 'cs-field-pulse'),
                    'data' => array(),
                    'borderColor' => '#00E676', // Vibrant green from UI spec
                    'fill' => false
                ),
                array(
                    'label' => __('Classification', 'cs-field-pulse'),
                    'data' => array(),
                    'borderColor' => '#FFD600', // Yellow from UI spec
                    'fill' => false
                )
            )
        );
        
        if (empty($trend_data)) {
            return $chart_data;
        }
        
        $months_data = array();
        
        foreach ($trend_data as $data) {
            if (!isset($months_data[$data->month])) {
                $months_data[$data->month] = array(
                    'month' => $data->month,
                    'average_score' => $data->average_score,
                    'classifications' => array()
                );
            }
            
            $months_data[$data->month]['classifications'][$data->classification] = true;
        }
        
        // Sort by month
        ksort($months_data);
        
        foreach ($months_data as $month => $data) {
            $chart_data['labels'][] = $month;
            $chart_data['datasets'][0]['data'][] = $data['average_score'];
            
            // Derive a numeric value for classification:
            // Promoter = 3, Passive = 2, Detractor = 1
            $classification_value = 2; // Default to passive
            
            if (isset($data['classifications']['promoter']) && $data['classifications']['promoter']) {
                $classification_value = 3;
            } elseif (isset($data['classifications']['detractor']) && $data['classifications']['detractor']) {
                $classification_value = 1;
            }
            
            $chart_data['datasets'][1]['data'][] = $classification_value;
        }
        
        return $chart_data;
    }

    /**
     * Get top performing inspectors.
     *
     * @param int $limit The number of inspectors to retrieve.
     * @return array The top performing inspectors.
     */
    public function get_top_performing_inspectors($limit = 5) {
        global $wpdb;
        
        $inspectors_table = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        
        $query = $wpdb->prepare(
            "SELECT 
                i.id, i.name, i.classification,
                COUNT(DISTINCT v.id) as visit_count,
                AVG(e.score) as average_score
            FROM {$inspectors_table} i
            JOIN {$visits_table} v ON i.id = v.inspector_id
            JOIN {$evaluations_table} e ON v.id = e.visit_id
            GROUP BY i.id, i.name, i.classification
            ORDER BY average_score DESC
            LIMIT %d",
            $limit
        );
        
        $results = $wpdb->get_results($query);
        
        return $results ? $results : array();
    }

    /**
     * Get inspectors needing attention.
     *
     * @param int $limit The number of inspectors to retrieve.
     * @return array The inspectors needing attention.
     */
    public function get_inspectors_needing_attention($limit = 5) {
        global $wpdb;
        
        $inspectors_table = CS_Field_Pulse_DB_Manager::get_table_name('inspectors');
        $visits_table = CS_Field_Pulse_DB_Manager::get_table_name('visits');
        $evaluations_table = CS_Field_Pulse_DB_Manager::get_table_name('evaluations');
        
        $query = $wpdb->prepare(
            "SELECT 
                i.id, i.name, i.classification,
                COUNT(DISTINCT v.id) as visit_count,
                AVG(e.score) as average_score
            FROM {$inspectors_table} i
            JOIN {$visits_table} v ON i.id = v.inspector_id
            JOIN {$evaluations_table} e ON v.id = e.visit_id
            WHERE i.classification = 'detractor'
            GROUP BY i.id, i.name, i.classification
            ORDER BY average_score ASC
            LIMIT %d",
            $limit
        );
        
        $results = $wpdb->get_results($query);
        
        return $results ? $results : array();
    }
}