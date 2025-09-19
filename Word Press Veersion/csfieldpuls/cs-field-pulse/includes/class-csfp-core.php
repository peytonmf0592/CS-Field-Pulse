<?php
/**
 * Core plugin class
 */
class CSFP_Core {
    
    /**
     * Plugin version
     */
    protected $version;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->version = CSFP_VERSION;
    }
    
    /**
     * Run the plugin
     */
    public function run() {
        $this->load_dependencies();
        $this->register_hooks();
        $this->register_shortcodes();
        $this->maybe_upgrade_database();
    }
    
    /**
     * Check and upgrade database if needed
     */
    private function maybe_upgrade_database() {
        $db_version = get_option('csfp_db_version', '1.0');
        $current_version = '1.7'; // Increment this when schema changes
        
        if (version_compare($db_version, $current_version, '<')) {
            require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-activator.php';
            CSFP_Activator::upgrade_database_schema();
            update_option('csfp_db_version', $current_version);
        }
    }
    
    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-ajax.php';
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-shortcodes.php';
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-database.php';
        require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-navigation.php';
    }
    
    /**
     * Register all hooks
     */
    private function register_hooks() {
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_public_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Initialize AJAX handlers
        $ajax = new CSFP_Ajax();
        $ajax->init();
        
        // Hide admin bar for non-admins
        add_action('after_setup_theme', array($this, 'hide_admin_bar'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Add audio MIME types
        add_filter('upload_mimes', array($this, 'add_audio_mime_types'));
        
        // Allow audio uploads for non-admin users
        add_filter('user_has_cap', array($this, 'allow_audio_uploads'), 10, 3);
        
        // Custom login page
        add_action('login_enqueue_scripts', array($this, 'enqueue_login_styles'));
        add_filter('login_headerurl', array($this, 'login_logo_url'));
        add_filter('login_headertext', array($this, 'login_logo_text'));
        
        // Use custom template for CS Field Pulse pages
        add_filter('template_include', array($this, 'use_custom_template'));
    }
    
    /**
     * Register shortcodes
     */
    private function register_shortcodes() {
        $shortcodes = new CSFP_Shortcodes();
        $shortcodes->register();
    }
    
    /**
     * Enqueue public scripts and styles
     */
    public function enqueue_public_scripts() {
        // Only enqueue on pages with our shortcodes
        global $post;
        if (is_a($post, 'WP_Post') && (
            has_shortcode($post->post_content, 'csfp_dashboard') ||
            has_shortcode($post->post_content, 'csfp_inspectors') ||
            has_shortcode($post->post_content, 'csfp_adjusters') ||
            has_shortcode($post->post_content, 'csfp_profile') ||
            has_shortcode($post->post_content, 'csfp_visits')
        )) {
            // CSS
            wp_enqueue_style(
                'csfp-style',
                CSFP_PLUGIN_URL . 'assets/css/csfp-style.css',
                array(),
                $this->version
            );
            
            // Enhanced particle effects CSS
            wp_enqueue_style(
                'csfp-particles-enhanced',
                CSFP_PLUGIN_URL . 'assets/css/csfp-particles-enhanced.css',
                array('csfp-style'),
                $this->version
            );
            
            // Clean page headers CSS
            wp_enqueue_style(
                'csfp-page-headers',
                CSFP_PLUGIN_URL . 'assets/css/csfp-page-headers.css',
                array('csfp-style'),
                $this->version
            );
            
            // Navigation icons CSS
            wp_enqueue_style(
                'csfp-nav-icons',
                CSFP_PLUGIN_URL . 'assets/css/csfp-nav-icons.css',
                array('csfp-style'),
                $this->version
            );
            
            // Clean 3D Tesseract icons CSS (No Blur)
            wp_enqueue_style(
                'csfp-clean-tesseract',
                CSFP_PLUGIN_URL . 'assets/css/csfp-clean-tesseract.css',
                array('csfp-style'),
                $this->version . '.7'
            );
            
            // Navigation updates CSS
            wp_enqueue_style(
                'csfp-nav-update',
                CSFP_PLUGIN_URL . 'assets/css/csfp-nav-update.css',
                array('csfp-style'),
                $this->version
            );
            
            // Navigation redesign CSS
            wp_enqueue_style(
                'csfp-nav-redesign',
                CSFP_PLUGIN_URL . 'assets/css/csfp-nav-redesign.css',
                array('csfp-style', 'csfp-nav-update'),
                $this->version
            );
            
            // Logo and nav split layout CSS
            wp_enqueue_style(
                'csfp-logo-nav-split',
                CSFP_PLUGIN_URL . 'assets/css/csfp-logo-nav-split.css',
                array('csfp-style'),
                $this->version
            );
            
            // Compact layout CSS
            wp_enqueue_style(
                'csfp-compact-layout',
                CSFP_PLUGIN_URL . 'assets/css/csfp-compact-layout.css',
                array('csfp-style'),
                $this->version
            );
            
            // Quick action priority CSS
            wp_enqueue_style(
                'csfp-quick-action',
                CSFP_PLUGIN_URL . 'assets/css/csfp-quick-action.css',
                array('csfp-style'),
                $this->version
            );
            
            // Mobile override CSS - MUST load last for actual devices
            wp_enqueue_style(
                'csfp-mobile-override',
                CSFP_PLUGIN_URL . 'assets/css/csfp-mobile-override.css',
                array('csfp-style', 'csfp-quick-action', 'csfp-dashboard-mobile'),
                $this->version . '.1',
                'screen and (max-width: 768px)'
            );
            
            // iOS-specific CSS
            wp_enqueue_style(
                'csfp-ios-style',
                CSFP_PLUGIN_URL . 'assets/css/csfp-ios.css',
                array('csfp-style'),
                $this->version
            );
            
            // iOS Safari layout fixes
            wp_enqueue_style(
                'csfp-ios-safari-fix',
                CSFP_PLUGIN_URL . 'assets/css/csfp-ios-safari-fix.css',
                array('csfp-style', 'csfp-ios-style'),
                $this->version
            );
            
            // iOS Dashboard specific fixes
            if (has_shortcode($post->post_content, 'csfp_dashboard')) {
                wp_enqueue_style(
                    'csfp-ios-dashboard-fix',
                    CSFP_PLUGIN_URL . 'assets/css/csfp-ios-dashboard-fix.css',
                    array('csfp-style', 'csfp-ios-style'),
                    $this->version
                );
                
                // Chart mobile touch improvements
                wp_enqueue_style(
                    'csfp-chart-mobile',
                    CSFP_PLUGIN_URL . 'assets/css/csfp-chart-mobile.css',
                    array('csfp-style'),
                    $this->version
                );
                
                // Enhanced chart legend styles
                wp_enqueue_style(
                    'csfp-chart-legend',
                    CSFP_PLUGIN_URL . 'assets/css/csfp-chart-legend.css',
                    array('csfp-style'),
                    $this->version
                );
                
                // Mobile chart and map fixes
                wp_enqueue_style(
                    'csfp-mobile-fix',
                    CSFP_PLUGIN_URL . 'assets/css/csfp-mobile-fix.css',
                    array('csfp-style'),
                    $this->version
                );
                
                // Simple mobile map styles
                wp_enqueue_style(
                    'csfp-map-mobile',
                    CSFP_PLUGIN_URL . 'assets/css/csfp-map-mobile.css',
                    array('csfp-style'),
                    $this->version
                );
                
                // Dashboard mobile optimizations
                wp_enqueue_style(
                    'csfp-dashboard-mobile',
                    CSFP_PLUGIN_URL . 'assets/css/csfp-dashboard-mobile.css',
                    array('csfp-style'),
                    $this->version
                );
            }
            
            // Chart.js
            wp_enqueue_script(
                'chart-js',
                'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
                array(),
                '4.4.0',
                true
            );
            
            // Google Maps API with visualization library for heatmap
            $maps_api_key = get_option('csfp_google_maps_api_key');
            if ($maps_api_key && has_shortcode($post->post_content, 'csfp_dashboard')) {
                wp_enqueue_script(
                    'google-maps',
                    'https://maps.googleapis.com/maps/api/js?key=' . $maps_api_key . '&libraries=visualization&callback=initCSFPMap&loading=async',
                    array(),
                    null,
                    true
                );
            }
            
            // Voice Recorder JS
            wp_enqueue_script(
                'csfp-voice-recorder',
                CSFP_PLUGIN_URL . 'assets/js/csfp-voice-recorder.js',
                array('jquery'),
                $this->version,
                true
            );
            
            // Quick Visit JS (for dashboard and visits pages)
            if (has_shortcode($post->post_content, 'csfp_dashboard') || has_shortcode($post->post_content, 'csfp_visits')) {
                wp_enqueue_script(
                    'csfp-quick-visit',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-quick-visit-v4.js',
                    array('jquery', 'csfp-voice-recorder'),
                    $this->version,
                    true
                );
                
                // Localize quick visit script with user info
                $current_user = wp_get_current_user();
                wp_localize_script('csfp-quick-visit', 'csfp_ajax', array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('csfp_ajax_nonce'),
                    'current_user_name' => $current_user->display_name
                ));
                
                // Market Tour JS
                wp_enqueue_script(
                    'csfp-market-tour',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-market-tour.js',
                    array('jquery'),
                    $this->version,
                    true
                );
                
                // Quick Search JS (for dashboard)
                if (has_shortcode($post->post_content, 'csfp_dashboard')) {
                    wp_enqueue_script(
                        'csfp-quick-search',
                        CSFP_PLUGIN_URL . 'assets/js/csfp-quick-search.js',
                        array('jquery'),
                        $this->version,
                        true
                    );
                }
                
                // Quick Presets JS (for inspectors page)
                if (has_shortcode($post->post_content, 'csfp_inspectors')) {
                    wp_enqueue_script(
                        'csfp-quick-presets',
                        CSFP_PLUGIN_URL . 'assets/js/csfp-quick-presets.js',
                        array('jquery'),
                        $this->version,
                        true
                    );
                }
            }
            
            // Export JS (for dashboard and visits pages)
            if (has_shortcode($post->post_content, 'csfp_dashboard') || has_shortcode($post->post_content, 'csfp_visits')) {
                wp_enqueue_script(
                    'csfp-export',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-export.js',
                    array('jquery'),
                    $this->version,
                    true
                );
            }
            
            // Fixed particle effects JS
            wp_enqueue_script(
                'csfp-particles-fixed',
                CSFP_PLUGIN_URL . 'assets/js/csfp-particles-fixed.js',
                array('jquery'),
                $this->version . '.2',
                true
            );
            
            // Main JS
            wp_enqueue_script(
                'csfp-script',
                CSFP_PLUGIN_URL . 'assets/js/csfp-script.js',
                array('jquery', 'chart-js', 'csfp-voice-recorder'),
                $this->version . '.' . time(),
                true
            );
            
            // iOS-specific JS
            wp_enqueue_script(
                'csfp-ios-script',
                CSFP_PLUGIN_URL . 'assets/js/csfp-ios.js',
                array('jquery', 'csfp-script'),
                $this->version,
                true
            );
            
            // iOS Dashboard fixes JS
            if (has_shortcode($post->post_content, 'csfp_dashboard')) {
                wp_enqueue_script(
                    'csfp-ios-dashboard-fix',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-ios-dashboard-fix.js',
                    array('jquery', 'csfp-script', 'csfp-ios-script'),
                    $this->version,
                    true
                );
                
                // Clean map implementation
                wp_enqueue_script(
                    'csfp-map-clean',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-map-clean.js',
                    array('jquery', 'csfp-script'),
                    $this->version,
                    true
                );
                
                // Navigation scroll functionality
                wp_enqueue_script(
                    'csfp-nav-scroll',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-nav-scroll.js',
                    array('jquery'),
                    $this->version,
                    true
                );
                
                // Chart touch interaction handler
                wp_enqueue_script(
                    'csfp-chart-touch',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-chart-touch.js',
                    array('jquery', 'chart-js'),
                    $this->version,
                    true
                );
                
                // Enhanced chart legend interactions
                wp_enqueue_script(
                    'csfp-chart-legend',
                    CSFP_PLUGIN_URL . 'assets/js/csfp-chart-legend.js',
                    array('jquery', 'chart-js'),
                    $this->version,
                    true
                );
            }
            
            // Localize script with current user info
            $current_user = wp_get_current_user();
            wp_localize_script('csfp-script', 'csfp_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('csfp_ajax_nonce'),
                'has_maps' => !empty($maps_api_key),
                'current_user_name' => $current_user->display_name
            ));
        }
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Add admin styles if needed
        if ($hook === 'toplevel_page_csfp-settings') {
            wp_enqueue_style(
                'csfp-admin-style',
                CSFP_PLUGIN_URL . 'assets/css/csfp-admin.css',
                array(),
                $this->version
            );
            
            wp_enqueue_script(
                'csfp-admin-script',
                CSFP_PLUGIN_URL . 'assets/js/csfp-admin.js',
                array('jquery'),
                $this->version,
                true
            );
            
            wp_localize_script('csfp-admin-script', 'csfp_admin', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('csfp_admin_nonce')
            ));
        }
    }
    
    /**
     * Hide admin bar for non-admin users
     */
    public function hide_admin_bar() {
        if (!current_user_can('manage_options')) {
            show_admin_bar(false);
        }
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'CS Field Pulse Settings',
            'CS Field Pulse',
            'manage_options',
            'csfp-settings',
            array($this, 'render_settings_page'),
            'dashicons-location-alt',
            30
        );
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        require_once CSFP_PLUGIN_DIR . 'admin/settings-page.php';
    }
    
    /**
     * Enqueue login styles
     */
    public function enqueue_login_styles() {
        wp_enqueue_style(
            'csfp-login-style',
            CSFP_PLUGIN_URL . 'assets/css/csfp-login.css',
            array(),
            $this->version
        );
    }
    
    /**
     * Change login logo URL
     */
    public function login_logo_url() {
        return home_url();
    }
    
    /**
     * Change login logo text
     */
    public function login_logo_text() {
        return 'CS Field Pulse';
    }
    
    /**
     * Use custom template for CS Field Pulse pages
     */
    public function use_custom_template($template) {
        global $post;
        
        if (!$post) {
            return $template;
        }
        
        // Check if this is one of our pages
        $csfp_pages = array(
            get_option('csfp_dashboard_page_id'),
            get_option('csfp_inspectors_page_id'),
            get_option('csfp_adjusters_page_id'),
            get_option('csfp_profile_page_id'),
            get_option('csfp_visits_page_id')
        );
        
        if (in_array($post->ID, $csfp_pages)) {
            $custom_template = CSFP_PLUGIN_DIR . 'templates/page-template.php';
            if (file_exists($custom_template)) {
                return $custom_template;
            }
        }
        
        return $template;
    }
    
    /**
     * Add audio MIME types for upload
     */
    public function add_audio_mime_types($mimes) {
        // Audio formats
        $mimes['webm'] = 'audio/webm';
        $mimes['m4a'] = 'audio/mp4';
        $mimes['mp3'] = 'audio/mpeg';
        $mimes['wav'] = 'audio/wav';
        $mimes['ogg'] = 'audio/ogg';
        
        return $mimes;
    }
    
    /**
     * Allow audio uploads for non-admin users
     */
    public function allow_audio_uploads($allcaps, $caps, $args) {
        // Allow audio file uploads for logged-in users
        if (isset($args[0]) && $args[0] === 'upload_files' && is_user_logged_in()) {
            $allcaps['upload_files'] = true;
        }
        return $allcaps;
    }
}