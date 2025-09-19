<?php
/**
 * AJAX handlers
 */
class CSFP_Ajax {
    
    /**
     * Initialize AJAX handlers
     */
    public function init() {
        // Dashboard data
        add_action('wp_ajax_csfp_get_dashboard_data', array($this, 'get_dashboard_data'));
        add_action('wp_ajax_csfp_get_map_data', array($this, 'get_map_data'));
        
        // Filter inspectors/adjusters
        add_action('wp_ajax_csfp_filter_inspectors', array($this, 'filter_inspectors'));
        add_action('wp_ajax_csfp_filter_adjusters', array($this, 'filter_adjusters'));
        
        // Add engagement
        add_action('wp_ajax_csfp_add_engagement', array($this, 'add_engagement'));
        
        // Update sentiment
        add_action('wp_ajax_csfp_update_sentiment', array($this, 'update_sentiment'));
        
        // Upload media
        add_action('wp_ajax_csfp_upload_media', array($this, 'upload_media'));
        
        // Save inspector/adjuster
        add_action('wp_ajax_csfp_save_inspector', array($this, 'save_inspector'));
        add_action('wp_ajax_csfp_save_adjuster', array($this, 'save_adjuster'));
        add_action('wp_ajax_csfp_delete_inspector', array($this, 'delete_inspector'));
        
        // Market tour actions
        add_action('wp_ajax_csfp_start_tour', array($this, 'start_tour'));
        add_action('wp_ajax_csfp_end_tour', array($this, 'end_tour'));
        add_action('wp_ajax_csfp_get_active_tour', array($this, 'get_active_tour'));
        add_action('wp_ajax_csfp_get_tour_stats', array($this, 'get_tour_stats'));
        add_action('wp_ajax_csfp_export_market_tour', array($this, 'export_market_tour'));
        add_action('wp_ajax_csfp_get_market_tours', array($this, 'get_market_tours'));
        add_action('wp_ajax_csfp_attach_visit_to_tour', array($this, 'attach_visit_to_tour'));
        
        // Admin actions
        add_action('wp_ajax_csfp_create_demo_data', array($this, 'create_demo_data'));
        add_action('wp_ajax_csfp_delete_demo_data', array($this, 'delete_demo_data'));
        add_action('wp_ajax_csfp_create_pages', array($this, 'create_pages'));
        add_action('wp_ajax_csfp_upgrade_database', array($this, 'upgrade_database'));
        
        // AI transcription
        add_action('wp_ajax_csfp_transcribe_visit', array($this, 'transcribe_visit'));
        
        // Visits feed
        add_action('wp_ajax_csfp_get_visits_feed', array($this, 'get_visits_feed'));
        add_action('wp_ajax_csfp_export_visits', array($this, 'export_visits'));
        
        // Search persons
        add_action('wp_ajax_csfp_search_persons', array($this, 'search_persons'));
        add_action('wp_ajax_csfp_autocomplete_persons', array($this, 'autocomplete_persons'));
        
        // Quick visit V3
        add_action('wp_ajax_csfp_save_quick_visit', array($this, 'save_quick_visit'));
        add_action('wp_ajax_csfp_save_voice_visit', array($this, 'save_voice_visit'));
        add_action('wp_ajax_csfp_transcribe_audio', array($this, 'transcribe_audio'));
        add_action('wp_ajax_csfp_export_all_visits', array($this, 'export_all_visits'));
        
        // Get current user info
        add_action('wp_ajax_csfp_get_current_user', array($this, 'get_current_user'));
        
        // Carrier and adjuster management
        add_action('wp_ajax_csfp_get_adjusters_by_carrier', array($this, 'get_adjusters_by_carrier'));
        add_action('wp_ajax_csfp_add_adjuster_to_carrier', array($this, 'add_adjuster_to_carrier'));
    }
    
    /**
     * Get dashboard data
     */
    public function get_dashboard_data() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $market = isset($_POST['market']) ? sanitize_text_field($_POST['market']) : null;
        
        // Get sentiment stats
        $inspector_stats = CSFP_Database::get_sentiment_stats('Inspector', $market);
        $adjuster_stats = CSFP_Database::get_sentiment_stats('Adjuster', $market);
        
        // Get recent activity
        global $wpdb;
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        $table_users = $wpdb->users;
        
        // Build market where clause
        $market_where = '';
        if ($market) {
            $market_where = $wpdb->prepare(" AND i.market = %s", $market);
        }
        
        $recent_activity = $wpdb->get_results(
            "SELECT e.*, i.name as inspector_name, i.role, u.display_name as user_name
            FROM $table_engagements e
            LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
            LEFT JOIN $table_users u ON e.user_id = u.ID
            WHERE 1=1 $market_where
            ORDER BY e.engagement_date DESC
            LIMIT 50"
        );
        
        // Get total visits
        $total_visits = $wpdb->get_var(
            "SELECT COUNT(*) FROM $table_engagements e
            LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
            WHERE 1=1 $market_where"
        );
        
        // Get visits this month
        $visits_this_month = $wpdb->get_var(
            "SELECT COUNT(*) FROM $table_engagements e
            LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
            WHERE MONTH(e.engagement_date) = MONTH(CURRENT_DATE())
            AND YEAR(e.engagement_date) = YEAR(CURRENT_DATE())
            $market_where"
        );
        
        // Get total adjusters
        $total_adjusters = $wpdb->get_var(
            "SELECT COUNT(*) FROM $table_inspectors
            WHERE role = 'Adjuster' $market_where"
        );
        
        wp_send_json_success(array(
            'inspector_stats' => $inspector_stats,
            'adjuster_stats' => $adjuster_stats,
            'recent_activity' => $recent_activity,
            'total_visits' => intval($total_visits),
            'visits_this_month' => intval($visits_this_month),
            'total_adjusters' => intval($total_adjusters)
        ));
    }
    
    /**
     * Get map data
     */
    public function get_map_data() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        
        $market = isset($_POST['market']) ? sanitize_text_field($_POST['market']) : '';
        
        // Get only inspectors/adjusters with recent engagements (last 90 days)
        $query = "SELECT DISTINCT i.id, i.name, i.role, i.city, i.market, i.sentiment, i.carrier, i.cat_local,
                  COUNT(e.id) as visit_count,
                  MAX(e.engagement_date) as last_visit
                  FROM $table_inspectors i
                  INNER JOIN $table_engagements e ON i.id = e.inspector_id
                  WHERE i.city IS NOT NULL AND i.city != ''
                  AND e.engagement_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
        
        if ($market) {
            $query .= $wpdb->prepare(" AND i.market = %s", $market);
        }
        
        $query .= " GROUP BY i.id ORDER BY i.name";
        
        $results = $wpdb->get_results($query);
        
        // Group by city for map markers
        $locations = array();
        foreach ($results as $person) {
            if (empty($person->city)) continue;
            
            $city_key = $person->city . ', ' . $person->market;
            
            if (!isset($locations[$city_key])) {
                $locations[$city_key] = array(
                    'city' => $person->city,
                    'market' => $person->market,
                    'coords' => $this->get_city_coordinates($person->city, $person->market),
                    'inspectors' => array(),
                    'adjusters' => array(),
                    'sentiment_counts' => array(
                        'Promoter' => 0,
                        'Passive' => 0,
                        'Detractor' => 0
                    ),
                    'total_visits' => 0,
                    'last_visit' => null
                );
            }
            
            // Add person to appropriate list
            if ($person->role === 'Inspector') {
                $locations[$city_key]['inspectors'][] = array(
                    'id' => $person->id,
                    'name' => $person->name,
                    'sentiment' => $person->sentiment,
                    'type' => $person->cat_local,
                    'visits' => $person->visit_count
                );
            } else {
                $locations[$city_key]['adjusters'][] = array(
                    'id' => $person->id,
                    'name' => $person->name,
                    'sentiment' => $person->sentiment,
                    'carrier' => $person->carrier,
                    'visits' => $person->visit_count
                );
            }
            
            // Count sentiment and visits
            $locations[$city_key]['sentiment_counts'][$person->sentiment]++;
            $locations[$city_key]['total_visits'] += $person->visit_count;
            
            // Track most recent visit
            if (!$locations[$city_key]['last_visit'] || $person->last_visit > $locations[$city_key]['last_visit']) {
                $locations[$city_key]['last_visit'] = $person->last_visit;
            }
        }
        
        wp_send_json_success(array_values($locations));
    }
    
    /**
     * Get city coordinates (simplified - in production, use a geocoding service)
     */
    private function get_city_coordinates($city, $market) {
        // Major US cities coordinates (simplified for demo)
        $coords = array(
            'New York' => array('lat' => 40.7128, 'lng' => -74.0060),
            'Los Angeles' => array('lat' => 34.0522, 'lng' => -118.2437),
            'Chicago' => array('lat' => 41.8781, 'lng' => -87.6298),
            'Houston' => array('lat' => 29.7604, 'lng' => -95.3698),
            'Phoenix' => array('lat' => 33.4484, 'lng' => -112.0740),
            'Philadelphia' => array('lat' => 39.9526, 'lng' => -75.1652),
            'San Antonio' => array('lat' => 29.4241, 'lng' => -98.4936),
            'San Diego' => array('lat' => 32.7157, 'lng' => -117.1611),
            'Dallas' => array('lat' => 32.7767, 'lng' => -96.7970),
            'Miami' => array('lat' => 25.7617, 'lng' => -80.1918),
            'Atlanta' => array('lat' => 33.7490, 'lng' => -84.3880),
            'Boston' => array('lat' => 42.3601, 'lng' => -71.0589),
            'Seattle' => array('lat' => 47.6062, 'lng' => -122.3321),
            'Denver' => array('lat' => 39.7392, 'lng' => -104.9903),
            'Detroit' => array('lat' => 42.3314, 'lng' => -83.0458),
            'Orlando' => array('lat' => 28.5383, 'lng' => -81.3792),
            'Cleveland' => array('lat' => 41.4993, 'lng' => -81.6944),
            'San Francisco' => array('lat' => 37.7749, 'lng' => -122.4194),
            'Richmond' => array('lat' => 37.5407, 'lng' => -77.4360),
            'Cincinnati' => array('lat' => 39.1031, 'lng' => -84.5120)
        );
        
        // Return coordinates if found, otherwise return a default
        if (isset($coords[$city])) {
            return $coords[$city];
        }
        
        // Return center of US as default
        return array('lat' => 39.8283, 'lng' => -98.5795);
    }
    
    /**
     * Filter inspectors
     */
    public function filter_inspectors() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $filters = array(
            'city' => isset($_POST['city']) ? sanitize_text_field($_POST['city']) : '',
            'sentiment' => isset($_POST['sentiment']) ? sanitize_text_field($_POST['sentiment']) : '',
            'cat_local' => isset($_POST['cat_local']) ? sanitize_text_field($_POST['cat_local']) : ''
        );
        
        // Add pagination parameters
        $page = isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1;
        $per_page = isset($_POST['per_page']) ? intval($_POST['per_page']) : 20;
        $filters['offset'] = ($page - 1) * $per_page;
        $filters['limit'] = $per_page;
        
        $inspectors = CSFP_Database::get_inspectors($filters);
        $total = CSFP_Database::count_inspectors($filters);
        
        wp_send_json_success(array(
            'items' => $inspectors,
            'total' => $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        ));
    }
    
    /**
     * Filter adjusters
     */
    public function filter_adjusters() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $filters = array(
            'city' => isset($_POST['city']) ? sanitize_text_field($_POST['city']) : '',
            'sentiment' => isset($_POST['sentiment']) ? sanitize_text_field($_POST['sentiment']) : '',
            'carrier' => isset($_POST['carrier']) ? sanitize_text_field($_POST['carrier']) : ''
        );
        
        // Add pagination parameters
        $page = isset($_POST['page']) ? max(1, intval($_POST['page'])) : 1;
        $per_page = isset($_POST['per_page']) ? intval($_POST['per_page']) : 20;
        $filters['offset'] = ($page - 1) * $per_page;
        $filters['limit'] = $per_page;
        
        $adjusters = CSFP_Database::get_adjusters($filters);
        $total = CSFP_Database::count_adjusters($filters);
        
        wp_send_json_success(array(
            'items' => $adjusters,
            'total' => $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        ));
    }
    
    /**
     * Add engagement
     */
    public function add_engagement() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        
        // Handle both inspector_id and adjuster_id
        $inspector_id = isset($_POST['inspector_id']) ? intval($_POST['inspector_id']) : 
                       (isset($_POST['adjuster_id']) ? intval($_POST['adjuster_id']) : 0);
        
        if (!$inspector_id) {
            wp_send_json_error('No inspector/adjuster ID provided');
            return;
        }
        
        $sentiment = sanitize_text_field($_POST['sentiment']);
        $notes = sanitize_textarea_field($_POST['notes']);
        $follow_up_needed = !empty($_POST['follow_up_needed']);
        $user_id = get_current_user_id();
        
        // Get inspector info to determine type
        $inspector = $wpdb->get_row($wpdb->prepare(
            "SELECT role FROM $table_inspectors WHERE id = %d",
            $inspector_id
        ));
        
        $engagement_data = array(
            'inspector_id' => $inspector_id,
            'user_id' => $user_id,
            'sentiment' => $sentiment,
            'notes' => $notes,
            'follow_up_needed' => $follow_up_needed
        );
        
        // Add transcription if provided
        if (!empty($_POST['transcription'])) {
            $engagement_data['transcription'] = sanitize_textarea_field($_POST['transcription']);
        }
        
        // Add tour-specific fields if in a tour
        if (!empty($_POST['tour_id'])) {
            $engagement_data['tour_id'] = intval($_POST['tour_id']);
            
            if (!empty($_POST['common_issues'])) {
                $engagement_data['common_issues'] = json_encode($_POST['common_issues']);
            }
            if (!empty($_POST['competitor_intel'])) {
                $engagement_data['competitor_intel'] = sanitize_textarea_field($_POST['competitor_intel']);
            }
            if (!empty($_POST['market_dynamics'])) {
                $engagement_data['market_dynamics'] = sanitize_textarea_field($_POST['market_dynamics']);
            }
        }
        
        $result = $wpdb->insert($table_engagements, $engagement_data);
        
        if ($result) {
            $engagement_id = $wpdb->insert_id;
            
            // Link to tour if applicable
            if (!empty($_POST['tour_id']) && $inspector) {
                require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
                $type = ($inspector->role === 'Inspector') ? 'inspector' : 'adjuster';
                CSFP_Market_Tour::link_engagement_to_tour(
                    intval($_POST['tour_id']),
                    $engagement_id,
                    $type
                );
            }
            
            wp_send_json_success('Engagement added successfully');
        } else {
            wp_send_json_error('Failed to add engagement');
        }
    }
    
    /**
     * Update sentiment
     */
    public function update_sentiment() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $inspector_id = intval($_POST['inspector_id']);
        $new_sentiment = sanitize_text_field($_POST['new_sentiment']);
        $reason = sanitize_textarea_field($_POST['reason']);
        $user_id = get_current_user_id();
        
        $result = CSFP_Database::update_sentiment($inspector_id, $new_sentiment, $user_id, $reason);
        
        if ($result) {
            wp_send_json_success('Sentiment updated successfully');
        } else {
            wp_send_json_error('Failed to update sentiment');
        }
    }
    
    /**
     * Upload media
     */
    public function upload_media() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }
        
        $inspector_id = intval($_POST['inspector_id']);
        $media_type = sanitize_text_field($_POST['media_type']);
        $caption = sanitize_text_field($_POST['caption']);
        
        $uploaded_file = $_FILES['file'];
        
        // Add supported MIME types for voice recordings
        if ($media_type === 'voice' || $media_type === 'voice_memo') {
            add_filter('upload_mimes', function($mimes) {
                $mimes['webm'] = 'audio/webm';
                $mimes['m4a'] = 'audio/mp4';
                $mimes['mp3'] = 'audio/mpeg';
                $mimes['wav'] = 'audio/wav';
                $mimes['ogg'] = 'audio/ogg';
                return $mimes;
            });
            
            // Fix MIME type detection for audio files
            add_filter('wp_check_filetype_and_ext', array($this, 'fix_audio_mime_type'), 10, 4);
        }
        
        $upload_overrides = array(
            'test_form' => false,
            'mimes' => array(
                'jpg|jpeg|jpe' => 'image/jpeg',
                'gif' => 'image/gif',
                'png' => 'image/png',
                'webm' => 'audio/webm',
                'm4a' => 'audio/mp4',
                'mp3' => 'audio/mpeg',
                'wav' => 'audio/wav',
                'ogg' => 'audio/ogg'
            )
        );
        
        $movefile = wp_handle_upload($uploaded_file, $upload_overrides);
        
        if ($movefile && !isset($movefile['error'])) {
            global $wpdb;
            $table = $wpdb->prefix . 'csfp_media';
            
            $wpdb->insert($table, array(
                'inspector_id' => $inspector_id,
                'user_id' => get_current_user_id(),
                'media_type' => $media_type,
                'media_url' => $movefile['url'],
                'caption' => $caption
            ));
            
            wp_send_json_success(array(
                'url' => $movefile['url'],
                'id' => $wpdb->insert_id
            ));
        } else {
            wp_send_json_error($movefile['error']);
        }
    }
    
    /**
     * Save inspector
     */
    public function save_inspector() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $data = array(
            'name' => sanitize_text_field($_POST['name']),
            'role' => 'Inspector',
            'city' => sanitize_text_field($_POST['city']),
            'market' => sanitize_text_field($_POST['market']),
            'rfm' => sanitize_text_field($_POST['rfm']),
            'cat_local' => sanitize_text_field($_POST['cat_local']),
            'is_mentor' => intval($_POST['is_mentor']),
            'sentiment' => sanitize_text_field($_POST['sentiment']),
            'personal_notes' => sanitize_textarea_field($_POST['personal_notes'])
        );
        
        $id = intval($_POST['id']);
        
        if ($id) {
            $result = $wpdb->update($table, $data, array('id' => $id));
        } else {
            $result = $wpdb->insert($table, $data);
        }
        
        if ($result !== false) {
            wp_send_json_success('Inspector saved successfully');
        } else {
            wp_send_json_error('Failed to save inspector');
        }
    }
    
    /**
     * Save adjuster
     */
    public function save_adjuster() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $data = array(
            'name' => sanitize_text_field($_POST['name']),
            'role' => 'Adjuster',
            'city' => sanitize_text_field($_POST['city']),
            'market' => sanitize_text_field($_POST['market']),
            'carrier' => sanitize_text_field($_POST['carrier']),
            'sentiment' => sanitize_text_field($_POST['sentiment']),
            'personal_notes' => sanitize_textarea_field($_POST['personal_notes'])
        );
        
        $id = intval($_POST['id']);
        
        if ($id) {
            $result = $wpdb->update($table, $data, array('id' => $id));
        } else {
            $result = $wpdb->insert($table, $data);
        }
        
        if ($result !== false) {
            wp_send_json_success('Adjuster saved successfully');
        } else {
            wp_send_json_error('Failed to save adjuster');
        }
    }
    
    /**
     * Delete inspector/adjuster
     */
    public function delete_inspector() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $id = intval($_POST['id']);
        $result = $wpdb->delete($table, array('id' => $id));
        
        if ($result !== false) {
            wp_send_json_success('Deleted successfully');
        } else {
            wp_send_json_error('Failed to delete');
        }
    }
    
    /**
     * Start market tour
     */
    public function start_tour() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        // Check if user is CS role (admin)
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Only CS team members can start tours');
        }
        
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        
        $current_user = wp_get_current_user();
        
        // Handle both old single market and new multiple markets format
        $markets = isset($_POST['markets']) ? $_POST['markets'] : array($_POST['market']);
        if (!is_array($markets)) {
            $markets = array($markets);
        }
        
        $data = array(
            'user_id' => get_current_user_id(),
            'markets' => array_map('sanitize_text_field', $markets),
            'rfm' => sanitize_text_field($_POST['rfm']),
            'traveler' => !empty($_POST['traveler']) ? sanitize_text_field($_POST['traveler']) : $current_user->display_name,
            'notes' => sanitize_text_field($_POST['notes'] ?? '')
        );
        
        $result = CSFP_Market_Tour::start_tour($data);
        
        if (is_array($result) && isset($result['error'])) {
            wp_send_json_error($result['error']);
        } else if ($result) {
            wp_send_json_success(array('tour_id' => $result));
        } else {
            wp_send_json_error('Failed to start tour');
        }
    }
    
    /**
     * End market tour
     */
    public function end_tour() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        
        $tour_id = intval($_POST['tour_id']);
        
        $result = CSFP_Market_Tour::end_tour($tour_id);
        
        if ($result) {
            wp_send_json_success('Tour ended successfully');
        } else {
            wp_send_json_error('Failed to end tour');
        }
    }
    
    /**
     * Get active tour
     */
    public function get_active_tour() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        
        $user_id = get_current_user_id();
        $tour = CSFP_Market_Tour::get_active_tour($user_id);
        
        // Convert markets from JSON to array if needed
        if ($tour && isset($tour->markets)) {
            $tour->markets = json_decode($tour->markets, true);
        }
        
        wp_send_json_success($tour);
    }
    
    /**
     * Get tour statistics
     */
    public function get_tour_stats() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        
        $tour_id = intval($_POST['tour_id']);
        $stats = CSFP_Market_Tour::get_tour_stats($tour_id);
        $engagements = CSFP_Market_Tour::get_tour_engagements($tour_id);
        
        wp_send_json_success(array(
            'stats' => $stats,
            'engagements' => $engagements
        ));
    }
    
    /**
     * Create demo data
     */
    public function create_demo_data() {
        check_ajax_referer('csfp_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        // Arrays for random data generation
        $first_names = array('John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'James', 'Maria', 'Robert', 'William', 
                            'Michael', 'Jessica', 'Christopher', 'Ashley', 'Matthew', 'Amanda', 'Joshua', 'Jennifer', 
                            'Daniel', 'Lisa', 'Andrew', 'Michelle', 'Ryan', 'Kimberly', 'Brandon', 'Amy', 'Jason', 
                            'Angela', 'Justin', 'Melissa', 'Kevin', 'Rebecca', 'Brian', 'Stephanie', 'Thomas', 'Nicole',
                            'Steven', 'Elizabeth', 'Timothy', 'Heather', 'Richard', 'Tiffany', 'Jeremy', 'Christina',
                            'Jeffrey', 'Rachel', 'Nicholas', 'Laura', 'Eric', 'Lauren', 'Stephen', 'Megan', 'Jacob',
                            'Adam', 'Nathan', 'Benjamin', 'Samuel', 'Patrick', 'Kenneth', 'Gregory', 'Jose', 'Alexander');
                            
        $last_names = array('Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
                           'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
                           'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez',
                           'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
                           'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker',
                           'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans',
                           'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris');
                           
        $cities = array(
            'New York' => 'Northeast', 'Los Angeles' => 'West', 'Chicago' => 'Midwest', 'Houston' => 'South',
            'Phoenix' => 'Southwest', 'Philadelphia' => 'Northeast', 'San Antonio' => 'South', 'San Diego' => 'West',
            'Dallas' => 'South', 'Miami' => 'Southeast', 'Atlanta' => 'Southeast', 'Boston' => 'Northeast',
            'Seattle' => 'Northwest', 'Denver' => 'Mountain', 'Detroit' => 'Midwest', 'Orlando' => 'Southeast',
            'San Francisco' => 'West', 'Cleveland' => 'Midwest', 'Richmond' => 'Southeast', 'Cincinnati' => 'Midwest',
            'Portland' => 'Northwest', 'Las Vegas' => 'Southwest', 'Nashville' => 'South', 'Memphis' => 'South',
            'Louisville' => 'South', 'Milwaukee' => 'Midwest', 'Albuquerque' => 'Southwest', 'Tucson' => 'Southwest',
            'Sacramento' => 'West', 'Kansas City' => 'Midwest', 'Omaha' => 'Midwest', 'Raleigh' => 'Southeast',
            'Cleveland' => 'Midwest', 'Virginia Beach' => 'Southeast', 'Indianapolis' => 'Midwest'
        );
        
        $carriers = array('State Farm', 'Allstate', 'Progressive', 'GEICO', 'Liberty Mutual', 'USAA', 'Farmers',
                         'Nationwide', 'American Family', 'Travelers', 'The Hartford', 'Chubb', 'Auto-Owners',
                         'Erie Insurance', 'Mercury', 'Kemper', 'MetLife', 'Safeco', 'Esurance', 'The General');
                         
        $sentiments = array('Promoter', 'Passive', 'Detractor');
        $cat_local = array('CAT', 'Local');
        
        // Generate 250 inspectors
        $generated_names = array();
        for ($i = 0; $i < 250; $i++) {
            $first = $first_names[array_rand($first_names)];
            $last = $last_names[array_rand($last_names)];
            $name = $first . ' ' . $last;
            
            // Ensure unique names
            $suffix = 1;
            while (in_array($name, $generated_names)) {
                $name = $first . ' ' . $last . ' ' . $suffix;
                $suffix++;
            }
            $generated_names[] = $name;
            
            $city = array_rand($cities);
            $market = $cities[$city];
            
            $inspector = array(
                'name' => $name,
                'role' => 'Inspector',
                'city' => $city,
                'market' => $market,
                'rfm' => 'RFM-' . sprintf('%03d', rand(1, 999)),
                'cat_local' => $cat_local[array_rand($cat_local)],
                'is_mentor' => rand(0, 100) < 10 ? 1 : 0, // 10% chance of being a mentor
                'sentiment' => $sentiments[array_rand($sentiments)],
                'personal_notes' => 'Auto-generated demo inspector profile.'
            );
            
            $wpdb->insert($table, $inspector);
        }
        
        // Generate 250 adjusters
        for ($i = 0; $i < 250; $i++) {
            $first = $first_names[array_rand($first_names)];
            $last = $last_names[array_rand($last_names)];
            $name = $first . ' ' . $last;
            
            // Ensure unique names
            $suffix = 1;
            while (in_array($name, $generated_names)) {
                $name = $first . ' ' . $last . ' ' . $suffix;
                $suffix++;
            }
            $generated_names[] = $name;
            
            $city = array_rand($cities);
            $market = $cities[$city];
            
            $adjuster = array(
                'name' => $name,
                'role' => 'Adjuster',
                'city' => $city,
                'market' => $market,
                'carrier' => $carriers[array_rand($carriers)],
                'sentiment' => $sentiments[array_rand($sentiments)],
                'personal_notes' => 'Auto-generated demo adjuster profile.'
            );
            
            $wpdb->insert($table, $adjuster);
        }
        
        // Create 250 demo visits/engagements
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $current_user_id = get_current_user_id();
        
        // Get all inspector/adjuster IDs
        $all_person_ids = $wpdb->get_col("SELECT id FROM $table ORDER BY RAND()");
        
        // Extended visit templates with Seek Now contractor success themed content
        $visit_templates = array(
            array(
                'sentiment' => 'Promoter',
                'notes' => 'Excellent jobsite visit. Inspector showed exceptional professionalism and attention to detail. Carrier relationships strong.',
                'transcription' => 'Just finished visiting the Thompson property with John. Man, what a pro! His presentation to the homeowner was spot on - clear, professional, really built trust. The adjuster mentioned he\'s their go-to inspector because his reports are always thorough and on time. He was wearing the Seek Now branded gear, looked sharp. Homeowner even commented on how professional he was. This is exactly the standard we want across all markets.',
                'follow_up_needed' => 0
            ),
            array(
                'sentiment' => 'Promoter',
                'notes' => 'Outstanding field performance. Multiple positive feedback from carriers this week. Setting the standard for professionalism.',
                'transcription' => 'Caught up with Sarah at three different job sites today. Every single one was running smoothly. The State Farm adjuster pulled me aside to say she\'s the best inspector they work with - always prepared, great communication, helps educate the homeowners. Her truck setup is immaculate, all tools organized. She\'s mentoring two newer inspectors and they\'re already showing improvement. This is what Seek Now excellence looks like.',
                'follow_up_needed' => 0
            ),
            array(
                'sentiment' => 'Passive',
                'notes' => 'Adequate performance but room for improvement in presentation. Technical skills solid, soft skills need work.',
                'transcription' => 'Site visit with Mike today. His technical work is fine, measurements accurate, but his interaction with the homeowner was... awkward. Didn\'t really explain the process, seemed rushed. The adjuster mentioned he\'s reliable but not their first choice. His appearance was okay but could be more professional - wrinkled shirt, no Seek Now branding visible. We need to work on his customer-facing skills.',
                'follow_up_needed' => 1
            ),
            array(
                'sentiment' => 'Passive',
                'notes' => 'Meeting minimum standards. Some carrier complaints about response times. Presentation needs improvement.',
                'transcription' => 'Visited Emily at the Johnson claim. She got the job done but it felt very transactional. No rapport building with the homeowner, minimal explanation of findings. Progressive adjuster mentioned she\'s been slow to respond to calls lately. Her vehicle had Seek Now magnets but they were dirty and peeling. She seems disengaged. Need to understand what\'s going on and how we can re-energize her.',
                'follow_up_needed' => 0
            ),
            array(
                'sentiment' => 'Detractor',
                'notes' => 'Multiple carrier complaints received. Unprofessional appearance and communication. Immediate intervention required.',
                'transcription' => 'Difficult visit at the Martinez property. Robert showed up late, looking disheveled. The Allstate adjuster was clearly frustrated - this is the third time this month. His explanation to the homeowner was confusing and borderline argumentative. No Seek Now branding anywhere, truck was a mess. The homeowner asked if there was someone else who could handle their claim. This is damaging our reputation. Need immediate action plan.',
                'follow_up_needed' => 1
            ),
            array(
                'sentiment' => 'Detractor',
                'notes' => 'Professionalism concerns. Multiple reports of poor communication. Risk to carrier relationships.',
                'transcription' => 'Had to do damage control today. Three different carriers called about issues with David. Showing up late or not at all, poor communication, sloppy reports. Met him at a job site and he was on his phone most of the time, barely acknowledged the adjuster. His attitude is affecting our relationship with GEICO in this market. If we don\'t turn this around fast, we\'ll lose carrier confidence.',
                'follow_up_needed' => 1
            ),
            array(
                'sentiment' => 'Promoter',
                'notes' => 'Exemplary field presence. Carriers specifically requesting this inspector. Perfect brand ambassador.',
                'transcription' => 'What a day with Marcus! Four job sites, four home runs. Every adjuster sang his praises. His customer service is off the charts - explains everything clearly, puts homeowners at ease, makes the adjusters\' jobs easier. Truck is branded perfectly, he looks professional, even carries Seek Now business cards to hand out. Liberty Mutual wants him on all their complex claims. This is our gold standard.',
                'follow_up_needed' => 0
            ),
            array(
                'sentiment' => 'Passive',
                'notes' => 'Competent but not exceptional. Does the minimum required. No complaints but no accolades either.',
                'transcription' => 'Standard visit with Jennifer. She completes inspections accurately, shows up on time, but there\'s no wow factor. Adjusters say she\'s fine but forgettable. Homeowners get their inspection but no memorable experience. She wears the Seek Now shirt but it\'s faded and old. Technically competent but missing the customer service excellence we strive for. Could be great with some coaching.',
                'follow_up_needed' => 0
            ),
            array(
                'sentiment' => 'Promoter',
                'notes' => 'Rising star. Newer inspector but already getting praise from carriers. Eager to learn and improve.',
                'transcription' => 'Fantastic field visit with our newer inspector, Alex. Only been with us 6 months but already getting requested by Farmers adjusters. Super enthusiastic, asks great questions, really cares about doing things right. Homeowner commented on how thorough and patient he was. Truck is clean, branded, organized. He asked about advanced training opportunities. This is someone we should invest in - future leader material.',
                'follow_up_needed' => 0
            ),
            array(
                'sentiment' => 'Detractor',
                'notes' => 'Concerning field behavior. Argumentative with adjusters. Creating tension on job sites.',
                'transcription' => 'Had to mediate a situation today. Tom got into a heated argument with the adjuster about scope. In front of the homeowner! The tension was so thick you could cut it. This isn\'t the first time - he thinks he knows better than everyone. His technical skills are good but his attitude is toxic. Three carriers have asked us not to send him. His ego is costing us business. Need a serious intervention.',
                'follow_up_needed' => 1
            )
        );
        
        // Generate 250 visits randomly distributed across all persons
        for ($i = 0; $i < 250; $i++) {
            $person_id = $all_person_ids[array_rand($all_person_ids)];
            $template = $visit_templates[array_rand($visit_templates)];
            $days_ago = rand(0, 90); // Visits within last 3 months
            
            // Add some randomization to the notes - Seek Now specific
            $random_additions = array(
                ' Weather conditions affected job site efficiency.',
                ' Discussed Seek Now training and certification programs.',
                ' Inspector requested updated measuring equipment.',
                ' Carrier relationships in this market are strong.',
                ' Homeowner satisfaction was exceptionally high.',
                ' Multiple carriers competing for this inspector\'s time.',
                ' Job volume is increasing in this market.',
                ' Excellent brand representation observed.',
                ' Technology adoption could improve efficiency.',
                ' Professional appearance standards need reinforcement.',
                ' Communication skills training would be beneficial.',
                ' Time management on site needs improvement.'
            );
            
            $notes = $template['notes'];
            if (rand(0, 100) < 30) { // 30% chance to add extra note
                $notes .= $random_additions[array_rand($random_additions)];
            }
            
            $wpdb->insert($table_engagements, array(
                'inspector_id' => $person_id,
                'user_id' => $current_user_id,
                'sentiment' => $template['sentiment'],
                'notes' => $notes,
                'transcription' => $template['transcription'],
                'follow_up_needed' => $template['follow_up_needed'],
                'engagement_date' => date('Y-m-d H:i:s', strtotime("-$days_ago days"))
            ));
        }
        
        // Create some sentiment changes for random people
        $table_sentiment_changes = $wpdb->prefix . 'csfp_sentiment_changes';
        
        $change_reasons = array(
            'Promoter' => array(
                'Excellent performance and positive attitude after implementing new mobile tools',
                'Outstanding results and mentoring new team members',
                'Consistently exceeding targets and showing great leadership',
                'Embraced new technology and helped others adapt'
            ),
            'Passive' => array(
                'Performance has stabilized after initial concerns',
                'Showing steady improvement but still needs encouragement',
                'Meeting expectations but lacking previous enthusiasm',
                'Adjusting to new processes, cautiously optimistic'
            ),
            'Detractor' => array(
                'Ongoing frustrations with policy changes despite interventions',
                'Multiple complaints from carriers about attitude',
                'Resistance to new procedures affecting team morale',
                'Performance declining, considering other opportunities'
            )
        );
        
        // Create 20-30 sentiment changes
        $num_changes = rand(20, 30);
        $some_person_ids = array_slice($all_person_ids, 0, 100); // Pick from first 100 people
        
        for ($i = 0; $i < $num_changes; $i++) {
            $person_id = $some_person_ids[array_rand($some_person_ids)];
            $old_sentiment = $sentiments[array_rand($sentiments)];
            $new_sentiment = $sentiments[array_rand($sentiments)];
            
            // Make sure old and new are different
            while ($old_sentiment == $new_sentiment) {
                $new_sentiment = $sentiments[array_rand($sentiments)];
            }
            
            $days_ago = rand(5, 60);
            
            $wpdb->insert($table_sentiment_changes, array(
                'inspector_id' => $person_id,
                'old_sentiment' => $old_sentiment,
                'new_sentiment' => $new_sentiment,
                'user_id' => $current_user_id,
                'reason' => $change_reasons[$new_sentiment][array_rand($change_reasons[$new_sentiment])],
                'changed_at' => date('Y-m-d H:i:s', strtotime("-$days_ago days"))
            ));
        }
        
        wp_send_json_success('Created 250 inspectors, 250 adjusters, and 250 visits with demo data successfully!');
    }
    
    /**
     * Delete demo data
     */
    public function delete_demo_data() {
        check_ajax_referer('csfp_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        
        // Clear all tables
        $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}csfp_inspectors");
        $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}csfp_engagements");
        $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}csfp_sentiment_changes");
        $wpdb->query("TRUNCATE TABLE {$wpdb->prefix}csfp_media");
        
        wp_send_json_success('All data deleted successfully');
    }
    
    /**
     * Create pages
     */
    public function create_pages() {
        check_ajax_referer('csfp_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $pages = array(
            array(
                'title' => 'CS Field Pulse Dashboard',
                'content' => '[csfp_dashboard]',
                'option' => 'csfp_dashboard_page_id'
            ),
            array(
                'title' => 'Inspectors',
                'content' => '[csfp_inspectors]',
                'option' => 'csfp_inspectors_page_id'
            ),
            array(
                'title' => 'Adjusters',
                'content' => '[csfp_adjusters]',
                'option' => 'csfp_adjusters_page_id'
            ),
            array(
                'title' => 'Profile',
                'content' => '[csfp_profile]',
                'option' => 'csfp_profile_page_id'
            ),
            array(
                'title' => 'Visits',
                'content' => '[csfp_visits]',
                'option' => 'csfp_visits_page_id'
            )
        );
        
        foreach ($pages as $page) {
            $page_id = wp_insert_post(array(
                'post_title' => $page['title'],
                'post_content' => $page['content'],
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_author' => get_current_user_id()
            ));
            
            if ($page_id) {
                update_option($page['option'], $page_id);
                
                // Set page template to blank if available
                update_post_meta($page_id, '_wp_page_template', 'template-blank.php');
            }
        }
        
        wp_send_json_success('Pages created successfully');
    }
    
    /**
     * Fix audio MIME type for WebM files
     */
    public function fix_audio_mime_type($data, $file, $filename, $mimes) {
        $wp_filetype = wp_check_filetype($filename, $mimes);
        
        // Check for WebM audio files
        if (!$wp_filetype['type'] && preg_match('/\.webm$/i', $filename)) {
            $data['ext'] = 'webm';
            $data['type'] = 'audio/webm';
        }
        
        // Also check the actual file content for audio files
        if (!empty($file)) {
            $file_content = file_get_contents($file, false, null, 0, 100);
            if (strpos($file_content, 'webm') !== false || strpos($file_content, 'WebM') !== false) {
                $data['ext'] = 'webm';
                $data['type'] = 'audio/webm';
            }
        }
        
        return $data;
    }
    
    /**
     * Transcribe visit recording using OpenAI
     */
    public function transcribe_visit() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        // Check if audio file was uploaded
        if (!isset($_FILES['audio'])) {
            wp_send_json_error('No audio file uploaded');
            return;
        }
        
        // Get OpenAI API key
        $api_key = get_option('csfp_ai_api_key');
        if (empty($api_key)) {
            wp_send_json_error('AI API key not configured. Please add it in CS Field Pulse settings.');
            return;
        }
        
        // Temporarily grant upload capabilities
        add_filter('user_has_cap', function($allcaps, $caps, $args) {
            $allcaps['upload_files'] = true;
            $allcaps['unfiltered_upload'] = true;
            return $allcaps;
        }, 10, 3);
        
        // Handle the uploaded file
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }
        
        $uploaded_file = $_FILES['audio'];
        
        // Add supported audio MIME types
        add_filter('upload_mimes', function($mimes) {
            $mimes['webm'] = 'audio/webm';
            $mimes['m4a'] = 'audio/mp4';
            $mimes['mp3'] = 'audio/mpeg';
            $mimes['wav'] = 'audio/wav';
            $mimes['ogg'] = 'audio/ogg';
            return $mimes;
        }, 999);
        
        // For audio files, we need to bypass WordPress mime check temporarily
        add_filter('wp_check_filetype_and_ext', array($this, 'fix_audio_mime_type'), 10, 4);
        
        // Disable the upload file type check for this operation
        add_filter('pre_site_option_upload_filetypes', function() {
            return 'webm m4a mp3 wav ogg jpg jpeg png gif pdf doc docx xls xlsx ppt pptx';
        });
        
        $upload_overrides = array(
            'test_form' => false,
            'test_type' => false,
            'mimes' => array(
                'webm' => 'audio/webm',
                'm4a' => 'audio/mp4',
                'mp3' => 'audio/mpeg',
                'wav' => 'audio/wav',
                'ogg' => 'audio/ogg'
            )
        );
        
        $movefile = wp_handle_upload($uploaded_file, $upload_overrides);
        
        // If WordPress upload fails, try manual approach
        if (!$movefile || isset($movefile['error'])) {
            // Try manual file handling
            $upload_dir = wp_upload_dir();
            $upload_path = $upload_dir['basedir'] . '/csfp-audio';
            
            // Create directory if it doesn't exist
            if (!file_exists($upload_path)) {
                wp_mkdir_p($upload_path);
            }
            
            // Generate unique filename
            $filename = 'audio_' . time() . '_' . wp_generate_password(8, false) . '.webm';
            $file_path = $upload_path . '/' . $filename;
            
            // Move uploaded file
            if (move_uploaded_file($uploaded_file['tmp_name'], $file_path)) {
                $movefile = array(
                    'file' => $file_path,
                    'url' => $upload_dir['baseurl'] . '/csfp-audio/' . $filename,
                    'type' => 'audio/webm'
                );
            } else {
                wp_send_json_error('Failed to move uploaded file. Please check file permissions.');
                return;
            }
        }
        
        if ($movefile && !isset($movefile['error'])) {
            // File uploaded successfully
            $audio_path = $movefile['file'];
            $audio_url = $movefile['url'];
            
            try {
                // Send to OpenAI Whisper API for transcription
                $transcription = $this->transcribe_with_openai($audio_path, $api_key);
                
                if ($transcription) {
                    // Analyze the transcription for sentiment and summary
                    $analysis = $this->analyze_transcription($transcription, $api_key);
                    
                    wp_send_json_success(array(
                        'transcription' => $transcription,
                        'formatted_transcript' => $analysis['formatted_transcript'],
                        'summary' => $analysis['summary'],
                        'key_points' => $analysis['key_points'],
                        'sentiment' => $analysis['sentiment'],
                        'follow_up_needed' => $analysis['follow_up_needed'],
                        'action_items' => $analysis['action_items'],
                        'audio_url' => $audio_url
                    ));
                } else {
                    wp_send_json_error('Failed to transcribe audio');
                }
            } catch (Exception $e) {
                wp_send_json_error('Transcription error: ' . $e->getMessage());
            }
        } else {
            $error_message = 'Failed to upload audio file';
            if (isset($movefile['error'])) {
                $error_message .= ': ' . $movefile['error'];
            }
            error_log('CSFP Audio Upload Error: ' . print_r($movefile, true));
            error_log('File info: ' . print_r($_FILES['audio'], true));
            wp_send_json_error($error_message);
        }
    }
    
    /**
     * Transcribe audio using OpenAI Whisper
     */
    private function transcribe_with_openai($audio_path, $api_key) {
        $ch = curl_init();
        
        $postfields = array(
            'file' => new CURLFile($audio_path),
            'model' => 'whisper-1'
        );
        
        curl_setopt_array($ch, array(
            CURLOPT_URL => 'https://api.openai.com/v1/audio/transcriptions',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postfields,
            CURLOPT_HTTPHEADER => array(
                'Authorization: Bearer ' . $api_key
            )
        ));
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code === 200) {
            $result = json_decode($response, true);
            return $result['text'] ?? '';
        } else {
            error_log('OpenAI Whisper API error: ' . $response);
            return false;
        }
    }
    
    /**
     * Analyze transcription for sentiment and summary
     */
    private function analyze_transcription($transcription, $api_key, $inspector_name = null, $user_name = null) {
        // Get additional context if not provided
        if (!$inspector_name && isset($_POST['inspector_id'])) {
            global $wpdb;
            $inspector = $wpdb->get_row($wpdb->prepare(
                "SELECT name FROM {$wpdb->prefix}csfp_inspectors WHERE id = %d",
                intval($_POST['inspector_id'])
            ));
            if ($inspector) {
                $inspector_name = $inspector->name;
            }
        }
        
        if (!$user_name) {
            $current_user = wp_get_current_user();
            $user_name = $current_user->display_name;
        }
        
        $prompt = "Analyze this contractor field visit transcription. The participants are:
- {$user_name} (Contractor Success Team member)
- {$inspector_name} (Inspector/Adjuster being visited)

Please provide:
1. A speaker-attributed transcript formatted as a conversation
2. A brief executive summary (2-3 sentences)
3. Key points discussed
4. The overall sentiment (Promoter, Passive, or Detractor)
5. Whether follow-up is needed (true/false)
6. Any action items mentioned

Raw Transcription: " . $transcription . "

Respond in JSON format:
{
  \"formatted_transcript\": [
    {\"speaker\": \"Name\", \"text\": \"What they said\", \"timestamp\": \"optional\"},
    ...
  ],
  \"summary\": \"Executive summary here\",
  \"key_points\": [\"point 1\", \"point 2\", ...],
  \"sentiment\": \"Promoter|Passive|Detractor\",
  \"follow_up_needed\": true/false,
  \"action_items\": [\"item 1\", \"item 2\", ...]
}";
        
        $ch = curl_init();
        
        $postdata = json_encode(array(
            'model' => 'gpt-4-turbo-preview',
            'messages' => array(
                array(
                    'role' => 'system',
                    'content' => 'You are analyzing contractor field visit transcriptions. You need to identify speakers based on context and format the conversation clearly. The contractor team member typically asks questions about satisfaction, issues, and needs. The inspector/adjuster responds with their experiences and concerns.'
                ),
                array(
                    'role' => 'user',
                    'content' => $prompt
                )
            ),
            'temperature' => 0.3,
            'max_tokens' => 2000
        ));
        
        curl_setopt_array($ch, array(
            CURLOPT_URL => 'https://api.openai.com/v1/chat/completions',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postdata,
            CURLOPT_HTTPHEADER => array(
                'Authorization: Bearer ' . $api_key,
                'Content-Type: application/json'
            )
        ));
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code === 200) {
            $result = json_decode($response, true);
            $content = $result['choices'][0]['message']['content'] ?? '';
            
            // Try to parse JSON from the response
            $json_match = preg_match('/\{.*\}/s', $content, $matches);
            if ($json_match) {
                $analysis = json_decode($matches[0], true);
                if ($analysis) {
                    return $analysis;
                }
            }
        }
        
        // Default response if analysis fails
        return array(
            'formatted_transcript' => array(),
            'summary' => 'Unable to generate summary. Raw transcript: ' . substr($transcription, 0, 200) . '...',
            'key_points' => array(),
            'sentiment' => 'Passive',
            'follow_up_needed' => false,
            'action_items' => array()
        );
    }
    
    /**
     * Get visits feed
     */
    public function get_visits_feed() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        $table_users = $wpdb->users;
        $table_media = $wpdb->prefix . 'csfp_media';
        $table_tours = $wpdb->prefix . 'csfp_market_tours';
        
        // Filters
        $date_range = isset($_POST['date_range']) ? sanitize_text_field($_POST['date_range']) : '';
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : '';
        $sentiment = isset($_POST['sentiment']) ? sanitize_text_field($_POST['sentiment']) : '';
        $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $per_page = 20;
        $offset = ($page - 1) * $per_page;
        
        // Build where clause
        $where = array('1=1');
        $where_values = array();
        
        // Date range filter
        switch ($date_range) {
            case 'today':
                $where[] = 'DATE(e.engagement_date) = CURDATE()';
                break;
            case 'week':
                $where[] = 'e.engagement_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                break;
            case 'month':
                $where[] = 'e.engagement_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                break;
            case 'quarter':
                $where[] = 'e.engagement_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
                break;
        }
        
        // Type filter
        if ($type) {
            $where[] = 'i.role = %s';
            $where_values[] = $type;
        }
        
        // Sentiment filter
        if ($sentiment) {
            $where[] = 'e.sentiment = %s';
            $where_values[] = $sentiment;
        }
        
        // User filter
        if ($user_id) {
            $where[] = 'e.user_id = %d';
            $where_values[] = $user_id;
        }
        
        $where_clause = implode(' AND ', $where);
        
        // Get total count for stats
        $total_query = "SELECT COUNT(*) FROM $table_engagements e
                        LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
                        WHERE $where_clause";
        
        if ($where_values) {
            $total_query = $wpdb->prepare($total_query, $where_values);
        }
        
        $total_visits = $wpdb->get_var($total_query);
        
        // Get visits
        $query = "SELECT e.*, i.name as inspector_name, i.role, i.city, i.market,
                  u.display_name as user_name, t.market_name as tour_name,
                  (SELECT COUNT(*) FROM $table_media m WHERE m.inspector_id = e.inspector_id AND m.media_type = 'voice_memo' AND DATE(m.created_at) = DATE(e.engagement_date)) as has_audio,
                  (SELECT COUNT(*) FROM $table_media m WHERE m.inspector_id = e.inspector_id AND m.media_type = 'photo' AND DATE(m.created_at) = DATE(e.engagement_date)) as has_photos
                  FROM $table_engagements e
                  LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
                  LEFT JOIN $table_users u ON e.user_id = u.ID
                  LEFT JOIN $table_tours t ON e.tour_id = t.id
                  WHERE $where_clause
                  ORDER BY e.engagement_date DESC
                  LIMIT %d OFFSET %d";
        
        $query_values = array_merge($where_values, array($per_page, $offset));
        $visits = $wpdb->get_results($wpdb->prepare($query, $query_values));
        
        // Get stats
        $stats_query = "SELECT 
            COUNT(*) as total_visits,
            SUM(CASE WHEN DATE(e.engagement_date) = CURDATE() THEN 1 ELSE 0 END) as visits_today,
            SUM(CASE WHEN e.follow_up_needed = 1 THEN 1 ELSE 0 END) as follow_ups_needed
            FROM $table_engagements e
            LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
            WHERE $where_clause";
        
        if ($where_values) {
            $stats_query = $wpdb->prepare($stats_query, $where_values);
        }
        
        $stats = $wpdb->get_row($stats_query);
        
        // Count voice visits (visits that have associated voice recordings)
        $voice_visits_query = "SELECT COUNT(DISTINCT e.id) 
            FROM $table_engagements e
            LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
            LEFT JOIN $table_media m ON m.inspector_id = e.inspector_id 
                AND m.media_type = 'voice_memo' 
                AND DATE(m.created_at) = DATE(e.engagement_date)
            WHERE m.id IS NOT NULL AND $where_clause";
            
        if ($where_values) {
            $voice_visits_query = $wpdb->prepare($voice_visits_query, $where_values);
        }
        
        $voice_visits = $wpdb->get_var($voice_visits_query);
        
        wp_send_json_success(array(
            'visits' => $visits,
            'stats' => array(
                'total_visits' => intval($stats->total_visits),
                'visits_today' => intval($stats->visits_today),
                'follow_ups_needed' => intval($stats->follow_ups_needed),
                'voice_visits' => intval($voice_visits)
            ),
            'has_more' => ($total_visits > ($page * $per_page))
        ));
    }
    
    /**
     * Export visits to CSV
     */
    public function export_visits() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_engagements = $wpdb->prefix . 'csfp_engagements';
        $table_inspectors = $wpdb->prefix . 'csfp_inspectors';
        $table_users = $wpdb->users;
        
        // Apply same filters as get_visits_feed
        $date_range = isset($_GET['date_range']) ? sanitize_text_field($_GET['date_range']) : '';
        $type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
        $sentiment = isset($_GET['sentiment']) ? sanitize_text_field($_GET['sentiment']) : '';
        $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
        
        // Build where clause (same as get_visits_feed)
        $where = array('1=1');
        $where_values = array();
        
        switch ($date_range) {
            case 'today':
                $where[] = 'DATE(e.engagement_date) = CURDATE()';
                break;
            case 'week':
                $where[] = 'e.engagement_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                break;
            case 'month':
                $where[] = 'e.engagement_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                break;
            case 'quarter':
                $where[] = 'e.engagement_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
                break;
        }
        
        if ($type) {
            $where[] = 'i.role = %s';
            $where_values[] = $type;
        }
        
        if ($sentiment) {
            $where[] = 'e.sentiment = %s';
            $where_values[] = $sentiment;
        }
        
        if ($user_id) {
            $where[] = 'e.user_id = %d';
            $where_values[] = $user_id;
        }
        
        $where_clause = implode(' AND ', $where);
        
        // Get all visits
        $query = "SELECT e.*, i.name as inspector_name, i.role, i.city, i.market,
                  i.carrier, i.cat_local, u.display_name as user_name
                  FROM $table_engagements e
                  LEFT JOIN $table_inspectors i ON e.inspector_id = i.id
                  LEFT JOIN $table_users u ON e.user_id = u.ID
                  WHERE $where_clause
                  ORDER BY e.engagement_date DESC";
        
        if ($where_values) {
            $query = $wpdb->prepare($query, $where_values);
        }
        
        $visits = $wpdb->get_results($query);
        
        // Set headers for CSV download
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="visits_export_' . date('Y-m-d') . '.csv"');
        
        // Open output stream
        $output = fopen('php://output', 'w');
        
        // Write headers
        fputcsv($output, array(
            'Date',
            'Time',
            'Name',
            'Type',
            'City',
            'Market',
            'Carrier/CAT-Local',
            'Sentiment',
            'CS Team Member',
            'Notes',
            'Follow-up Needed'
        ));
        
        // Write data
        foreach ($visits as $visit) {
            $date_time = new DateTime($visit->engagement_date);
            fputcsv($output, array(
                $date_time->format('Y-m-d'),
                $date_time->format('g:i A'),
                $visit->inspector_name,
                $visit->role,
                $visit->city,
                $visit->market,
                $visit->role === 'Adjuster' ? $visit->carrier : $visit->cat_local,
                $visit->sentiment,
                $visit->user_name,
                $visit->notes,
                $visit->follow_up_needed ? 'Yes' : 'No'
            ));
        }
        
        fclose($output);
        exit;
    }
    
    /**
     * Upgrade database
     */
    public function upgrade_database() {
        check_ajax_referer('csfp_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-activator.php';
        CSFP_Activator::upgrade_database_schema();
        
        // Force update the version
        update_option('csfp_db_version', '1.1');
        
        wp_send_json_success('Database upgraded successfully');
    }
    
    /**
     * Search persons (inspectors and adjusters)
     */
    public function search_persons() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $query = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';
        
        if (strlen($query) < 2) {
            wp_send_json_success(array());
            return;
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT id, name, role, city, market, carrier, cat_local 
             FROM $table 
             WHERE name LIKE %s 
             ORDER BY name 
             LIMIT 10",
            '%' . $wpdb->esc_like($query) . '%'
        ));
        
        wp_send_json_success($results);
    }
    
    /**
     * Autocomplete persons for quick visit
     */
    public function autocomplete_persons() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $query = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : '';
        
        if (strlen($query) < 1) {
            wp_send_json_success(array());
            return;
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'csfp_inspectors';
        
        // Build query based on type
        $where_type = '';
        if ($type && in_array($type, array('Inspector', 'Adjuster'))) {
            $where_type = $wpdb->prepare(" AND role = %s", $type);
        }
        
        // Search for names starting with the query (prioritized) and containing the query
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT id, name, role, city, market, carrier, cat_local,
             CASE 
                WHEN LOWER(name) LIKE LOWER(%s) THEN 1
                WHEN LOWER(name) LIKE LOWER(%s) THEN 2
                ELSE 3
             END as priority
             FROM $table 
             WHERE (LOWER(name) LIKE LOWER(%s) OR LOWER(name) LIKE LOWER(%s))
             $where_type
             ORDER BY priority, name 
             LIMIT 15",
            $wpdb->esc_like($query) . '%',  // Starts with
            '%' . $wpdb->esc_like($query) . '%',  // Contains
            $wpdb->esc_like($query) . '%',  // Starts with (for WHERE)
            '%' . $wpdb->esc_like($query) . '%'  // Contains (for WHERE)
        ));
        
        wp_send_json_success($results);
    }
    
    /**
     * Save quick visit from V3 modal
     */
    public function save_quick_visit() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $visit_data = json_decode(stripslashes($_POST['visit_data']), true);
        if (!$visit_data) {
            wp_send_json_error('Invalid visit data');
        }
        
        global $wpdb;
        $table_visits = $wpdb->prefix . 'csfp_visits';
        
        // Check for active tour
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        $active_tour = CSFP_Market_Tour::get_active_tour(get_current_user_id());
        
        // Prepare data for insertion
        $insert_data = array(
            'type' => $visit_data['type'],
            'cs' => isset($visit_data['cs']) ? $visit_data['cs'] : '',
            'date' => isset($visit_data['date']) ? $visit_data['date'] : date('Y-m-d'),
            'user_id' => get_current_user_id(),
            'created_at' => current_time('mysql'),
            'follow_up_needed' => isset($visit_data['follow_up_needed']) && $visit_data['follow_up_needed'] ? 1 : 0,
            'tour_id' => $active_tour ? $active_tour->id : null
        );
        
        // Extract person name for potential inspector/adjuster record
        $person_name = '';
        if ($visit_data['type'] === 'inspector' && !empty($visit_data['inspector_name'])) {
            $person_name = $visit_data['inspector_name'];
        } else if ($visit_data['type'] === 'adjuster' && !empty($visit_data['adjuster_name'])) {
            $person_name = $visit_data['adjuster_name'];
        }
        
        // Add all field data as JSON
        unset($visit_data['follow_up_needed']);
        $insert_data['field_data'] = json_encode($visit_data);
        
        // Insert into database
        $result = $wpdb->insert($table_visits, $insert_data);
        
        if ($result === false) {
            $error = $wpdb->last_error ?: 'Database insert failed';
            wp_send_json_error('Failed to save visit: ' . $error);
        }
        
        wp_send_json_success(array('id' => $wpdb->insert_id));
    }
    
    /**
     * Export all visits as Excel and CSV files
     */
    public function export_all_visits() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_visits = $wpdb->prefix . 'csfp_visits';
        
        // Get all visits ordered by date DESC, then created_at DESC
        $inspector_visits = $wpdb->get_results(
            "SELECT * FROM $table_visits 
             WHERE type = 'inspector' 
             ORDER BY date DESC, created_at DESC"
        );
        
        $adjuster_visits = $wpdb->get_results(
            "SELECT * FROM $table_visits 
             WHERE type = 'adjuster' 
             ORDER BY date DESC, created_at DESC"
        );
        
        // Define exact headers and field mappings for Inspector (including inspector name in column 2)
        $inspector_headers = ['CS', 'Inspector Name', 'Date', 'Sentiment', 'Mojo', 'Adjuster Interaction', 
                             'Appearance', 'Branding/Equipment Compliance', 'Punctual', 
                             'Mentor Quality', 'Takes Scope Sheet On Roof', 'Scope Sheet Quality',
                             'Communication', 'Issues', 'Claim Number', 'Notes'];
        
        $inspector_field_keys = ['cs', 'inspector_name', 'date', 'sentiment', 'mojo', 'adjuster_interaction',
                                'appearance', 'branding_compliance', 'punctual',
                                'mentor_quality', 'takes_scope_sheet', 'scope_sheet_quality',
                                'communication', 'issues', 'claim_number', 'notes'];
        
        // Define exact headers and field mappings for Adjuster (exact column order with Intel)
        $adjuster_headers = ['CS', 'Date', 'Carrier', 'Adjuster', 'Portal Availability', 'Portal Requests',
                            'Satisfied with Inspectors', 'Supported', 'Trust in Seek Now',
                            'RFM Communication', 'Satisfied with reports', 'Regional Shoutout',
                            'Inspectors Punctual', 'Confirmation Texts', 'Scope Sheet Satisfaction',
                            'Solo Service Satisfaction', 'Inspector Feedback', 'Office Feeback',
                            'Claim Number', 'Intel', 'Notes'];
        
        $adjuster_field_keys = ['cs', 'date', 'carrier', 'adjuster', 'portal_availability', 'portal_requests',
                               'satisfied_inspectors', 'supported', 'trust_seek_now',
                               'rfm_communication', 'satisfied_reports', 'regional_shoutout',
                               'inspectors_punctual', 'confirmation_texts', 'scope_sheet_satisfaction',
                               'solo_service_satisfaction', 'inspector_feedback', 'office_feedback',
                               'claim_number', 'intel', 'notes'];
        
        // Process Inspector data
        $inspector_data = array();
        $inspector_data[] = $inspector_headers;
        
        foreach ($inspector_visits as $visit) {
            $field_data = json_decode($visit->field_data, true);
            $row = array();
            
            // Use exact field values as they appear in dropdowns
            foreach ($inspector_field_keys as $key) {
                if ($key === 'date') {
                    // Use date from main record
                    $row[] = $visit->date;
                } else if ($key === 'cs') {
                    // Use CS from main record
                    $row[] = $visit->cs ?: (isset($field_data[$key]) ? $field_data[$key] : '');
                } else if ($key === 'inspector_name') {
                    // Get inspector name from field_data
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else {
                    // Use field data values (these are already the label values, not IDs)
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                }
            }
            $inspector_data[] = $row;
        }
        
        // Process Adjuster data
        $adjuster_data = array();
        $adjuster_data[] = $adjuster_headers;
        
        foreach ($adjuster_visits as $visit) {
            $field_data = json_decode($visit->field_data, true);
            $row = array();
            
            // Use exact field values as they appear in dropdowns
            foreach ($adjuster_field_keys as $key) {
                if ($key === 'date') {
                    // Use date from main record
                    $row[] = $visit->date;
                } else if ($key === 'cs') {
                    // Use CS from main record
                    $row[] = $visit->cs ?: (isset($field_data[$key]) ? $field_data[$key] : '');
                } else if ($key === 'carrier') {
                    // Get carrier from field_data
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else if ($key === 'adjuster') {
                    // Get adjuster from field_data
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else if ($key === 'intel') {
                    // Get intel from field_data (default to empty string for old records)
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else {
                    // Use field data values (these are already the label values, not IDs)
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                }
            }
            $adjuster_data[] = $row;
        }
        
        // Return data for client-side processing
        wp_send_json_success(array(
            'inspector_data' => $inspector_data,
            'adjuster_data' => $adjuster_data,
            'filename_base' => 'CSFieldPulse_Visits_' . date('Y-m-d')
        ));
    }
    
    /**
     * Export market tour visits to CSV
     */
    public function export_market_tour() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $tour_id = isset($_POST['tour_id']) ? intval($_POST['tour_id']) : 0;
        if (!$tour_id) {
            wp_send_json_error('Tour ID is required');
        }
        
        // Get tour data
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        $tour = CSFP_Market_Tour::get_tour($tour_id);
        if (!$tour) {
            wp_send_json_error('Tour not found');
        }
        
        // Get all visits for the tour
        $all_visits = CSFP_Market_Tour::get_tour_visits($tour_id);
        
        // Separate visits into inspector and adjuster arrays
        $inspector_visits = array();
        $adjuster_visits = array();
        
        foreach ($all_visits as $visit) {
            if ($visit->type === 'inspector') {
                $inspector_visits[] = $visit;
            } else if ($visit->type === 'adjuster') {
                $adjuster_visits[] = $visit;
            }
        }
        
        // Use exact same headers and field mappings as export_all_visits function
        $inspector_headers = ['CS', 'Inspector Name', 'Date', 'Sentiment', 'Mojo', 'Adjuster Interaction', 
                             'Appearance', 'Branding/Equipment Compliance', 'Punctual', 
                             'Mentor Quality', 'Takes Scope Sheet On Roof', 'Scope Sheet Quality',
                             'Communication', 'Issues', 'Claim Number', 'Notes'];
        
        $inspector_field_keys = ['cs', 'inspector_name', 'date', 'sentiment', 'mojo', 'adjuster_interaction',
                                'appearance', 'branding_compliance', 'punctual',
                                'mentor_quality', 'takes_scope_sheet', 'scope_sheet_quality',
                                'communication', 'issues', 'claim_number', 'notes'];
        
        $adjuster_headers = ['CS', 'Date', 'Carrier', 'Adjuster', 'Portal Availability', 'Portal Requests',
                            'Satisfied with Inspectors', 'Supported', 'Trust in Seek Now',
                            'RFM Communication', 'Satisfied with reports', 'Regional Shoutout',
                            'Inspectors Punctual', 'Confirmation Texts', 'Scope Sheet Satisfaction',
                            'Solo Service Satisfaction', 'Inspector Feedback', 'Office Feeback',
                            'Claim Number', 'Intel', 'Notes'];
        
        $adjuster_field_keys = ['cs', 'date', 'carrier', 'adjuster', 'portal_availability', 'portal_requests',
                               'satisfied_inspectors', 'supported', 'trust_seek_now',
                               'rfm_communication', 'satisfied_reports', 'regional_shoutout',
                               'inspectors_punctual', 'confirmation_texts', 'scope_sheet_satisfaction',
                               'solo_service_satisfaction', 'inspector_feedback', 'office_feedback',
                               'claim_number', 'intel', 'notes'];
        
        // Process Inspector data with exact same format as export_all_visits
        $inspector_data = array();
        $inspector_data[] = $inspector_headers;
        
        foreach ($inspector_visits as $visit) {
            $field_data = json_decode($visit->field_data, true);
            $row = array();
            
            // Use exact field values as they appear in dropdowns
            foreach ($inspector_field_keys as $key) {
                if ($key === 'date') {
                    // Use date from main record
                    $row[] = $visit->date;
                } else if ($key === 'cs') {
                    // Use CS from main record
                    $row[] = $visit->cs ?: (isset($field_data[$key]) ? $field_data[$key] : '');
                } else if ($key === 'inspector_name') {
                    // Get inspector name from field_data
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else {
                    // Use field data values (these are already the label values, not IDs)
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                }
            }
            $inspector_data[] = $row;
        }
        
        // Process Adjuster data with exact same format as export_all_visits
        $adjuster_data = array();
        $adjuster_data[] = $adjuster_headers;
        
        foreach ($adjuster_visits as $visit) {
            $field_data = json_decode($visit->field_data, true);
            $row = array();
            
            // Use exact field values as they appear in dropdowns
            foreach ($adjuster_field_keys as $key) {
                if ($key === 'date') {
                    // Use date from main record
                    $row[] = $visit->date;
                } else if ($key === 'cs') {
                    // Use CS from main record
                    $row[] = $visit->cs ?: (isset($field_data[$key]) ? $field_data[$key] : '');
                } else if ($key === 'carrier') {
                    // Get carrier from field_data
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else if ($key === 'adjuster') {
                    // Get adjuster from field_data
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else if ($key === 'intel') {
                    // Get intel from field_data (default to empty string for old records)
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                } else {
                    // Use field data values (these are already the label values, not IDs)
                    $row[] = isset($field_data[$key]) ? $field_data[$key] : '';
                }
            }
            $adjuster_data[] = $row;
        }
        
        // Get tour stats
        $tour_stats = CSFP_Market_Tour::get_tour_stats($tour_id);
        
        // Helper function to convert slug to label
        $slugToLabel = function($slug) {
            $mapping = array(
                'affolter' => 'Affolter',
                'brasuel' => 'Brasuel',
                'hillerich' => 'Hillerich',
                'humphries' => 'Humphries',
                'johnson' => 'Johnson',
                'morton' => 'Morton',
                'morris' => 'Morris',
                'munda' => 'Munda',
                'riley' => 'Riley',
                'sanderson' => 'Sanderson',
                'snelling' => 'Snelling',
                'swett' => 'Swett',
                'vanjoosten' => 'VanJoosten',
                'zatulak' => 'Zatulak',
                'carolinas' => 'Carolinas',
                'central-great-lakes' => 'Central Great Lakes',
                'florida' => 'Florida',
                'great-plains' => 'Great Plains',
                'hawaiian-islands' => 'Hawaiian Islands',
                'lower-midwest' => 'Lower Midwest',
                'mid-atlantic' => 'Mid-Atlantic',
                'new-england' => 'New England',
                'northeast' => 'Northeast',
                'northern-great-lakes' => 'Northern Great Lakes',
                'northwest' => 'Northwest',
                'ohio-valley' => 'Ohio Valley',
                'rocky-mountains' => 'Rocky Mountains',
                'south-central' => 'South Central',
                'south-pacific' => 'South Pacific',
                'southeast' => 'Southeast',
                'southwest' => 'Southwest',
                'tennessee-valley' => 'Tennessee Valley',
                'upper-midwest' => 'Upper Midwest'
            );
            return isset($mapping[$slug]) ? $mapping[$slug] : $slug;
        };
        
        // Convert markets from JSON if needed
        $markets = json_decode($tour->markets, true);
        if (!is_array($markets)) {
            $markets = array($tour->market); // Fallback for old format
        }
        
        // Convert market slugs to labels
        $marketLabels = array_map($slugToLabel, $markets);
        
        // Format tour info for export
        $tour_info = array(
            'rfm' => $tour->rfm,  // Keep slug for now, JS will convert
            'markets' => implode(', ', $marketLabels),
            'traveler' => $tour->traveler,
            'start_time' => $tour->start_time,
            'end_time' => $tour->end_time,
            'notes' => $tour->notes
        );
        
        // Create filename with RFM label
        $rfmLabel = $slugToLabel($tour->rfm);
        $filename_base = 'CSFieldPulse_Tour_' . $rfmLabel . '_' . date('Y-m-d', strtotime($tour->start_time));
        
        // Return data in same format as export_all_visits
        wp_send_json_success(array(
            'inspector_data' => $inspector_data,
            'adjuster_data' => $adjuster_data,
            'tour_stats' => $tour_stats,
            'tour_info' => $tour_info,
            'filename_base' => $filename_base
        ));
    }
    
    /**
     * Save voice visit from V3 modal
     */
    public function save_voice_visit() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        $visit_data = json_decode(stripslashes($_POST['visit_data']), true);
        if (!$visit_data) {
            wp_send_json_error('Invalid visit data');
        }
        
        global $wpdb;
        $table_visits = $wpdb->prefix . 'csfp_visits';
        
        // Handle audio file upload if present
        $audio_url = '';
        if (!empty($_FILES['audio_file'])) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            
            $uploaded = wp_handle_upload($_FILES['audio_file'], array('test_form' => false));
            if (!isset($uploaded['error'])) {
                $audio_url = $uploaded['url'];
            }
        }
        
        // Check for active tour
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
        $active_tour = CSFP_Market_Tour::get_active_tour(get_current_user_id());
        
        // Prepare data for insertion
        $insert_data = array(
            'type' => $visit_data['type'],
            'cs' => isset($visit_data['cs']) ? $visit_data['cs'] : '',
            'date' => isset($visit_data['date']) ? $visit_data['date'] : date('Y-m-d'),
            'user_id' => get_current_user_id(),
            'created_at' => current_time('mysql'),
            'follow_up_needed' => isset($visit_data['follow_up_needed']) && $visit_data['follow_up_needed'] ? 1 : 0,
            'tour_id' => $active_tour ? $active_tour->id : null
        );
        
        // Add transcription and audio URL to field data
        if (!empty($visit_data['transcription'])) {
            $visit_data['transcription'] = $visit_data['transcription'];
        }
        if ($audio_url) {
            $visit_data['audio_url'] = $audio_url;
        }
        
        // Remove follow_up_needed from field data
        unset($visit_data['follow_up_needed']);
        $insert_data['field_data'] = json_encode($visit_data);
        
        // Insert into database
        $result = $wpdb->insert($table_visits, $insert_data);
        
        if ($result === false) {
            $error = $wpdb->last_error ?: 'Database insert failed';
            wp_send_json_error('Failed to save visit: ' . $error);
        }
        
        wp_send_json_success(array('id' => $wpdb->insert_id));
    }
    
    /**
     * Transcribe audio file using OpenAI Whisper or similar service
     */
    public function transcribe_audio() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_die('Unauthorized');
        }
        
        if (empty($_FILES['audio_file'])) {
            wp_send_json_error('No audio file provided');
        }
        
        // For now, return a mock transcription
        // In production, this would call OpenAI Whisper API or similar service
        $mock_transcription = "This is a sample transcription. The inspector was very professional and punctual. They had good appearance and communication. The sentiment is promoter. Kyle conducted this visit on " . date('Y-m-d') . ". The adjuster interaction was great. Mojo was yes. The inspector takes scope sheet on roof. The quality was very good.";
        
        // In production, you would:
        // 1. Upload the audio file to a temporary location
        // 2. Send it to OpenAI Whisper API
        // 3. Return the actual transcription
        
        wp_send_json_success(array('transcription' => $mock_transcription));
    }
    
    /**
     * Get current logged-in user info
     */
    public function get_current_user() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('Not logged in');
        }
        
        $current_user = wp_get_current_user();
        
        wp_send_json_success(array(
            'id' => $current_user->ID,
            'display_name' => $current_user->display_name,
            'first_name' => $current_user->first_name ?: explode(' ', $current_user->display_name)[0],
            'email' => $current_user->user_email,
            'login' => $current_user->user_login
        ));
    }
    
    /**
     * Get adjusters by carrier
     */
    public function get_adjusters_by_carrier() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('Not logged in');
        }
        
        $carrier = sanitize_text_field($_POST['carrier']);
        
        global $wpdb;
        $table_adjusters = $wpdb->prefix . 'csfp_adjusters';
        
        // Get adjusters for this carrier
        $adjusters = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_adjusters 
                 WHERE carrier = %s 
                 ORDER BY name ASC",
                $carrier
            )
        );
        
        wp_send_json_success($adjusters);
    }
    
    /**
     * Add adjuster to carrier
     */
    public function add_adjuster_to_carrier() {
        check_ajax_referer('csfp_ajax_nonce', 'nonce');
        
        if (!is_user_logged_in()) {
            wp_send_json_error('Not logged in');
        }
        
        $carrier = sanitize_text_field($_POST['carrier']);
        $adjuster_name = sanitize_text_field($_POST['adjuster_name']);
        
        if (!$carrier || !$adjuster_name) {
            wp_send_json_error('Carrier and adjuster name are required');
        }
        
        global $wpdb;
        $table_adjusters = $wpdb->prefix . 'csfp_adjusters';
        
        // Check if adjuster already exists for this carrier
        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $table_adjusters 
                 WHERE carrier = %s AND name = %s",
                $carrier, $adjuster_name
            )
        );
        
        if ($exists) {
            wp_send_json_error('Adjuster already exists for this carrier');
        }
        
        // Insert new adjuster
        $result = $wpdb->insert(
            $table_adjusters,
            array(
                'carrier' => $carrier,
                'name' => $adjuster_name,
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s')
        );
        
        if ($result === false) {
            wp_send_json_error('Failed to add adjuster');
        }
        
        wp_send_json_success(array(
            'id' => $wpdb->insert_id,
            'message' => 'Adjuster added successfully'
        ));
    }
}