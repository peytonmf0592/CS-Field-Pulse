<?php
/**
 * Shortcodes handler
 */
class CSFP_Shortcodes {
    
    /**
     * Register all shortcodes
     */
    public function register() {
        add_shortcode('csfp_dashboard', array($this, 'render_dashboard'));
        add_shortcode('csfp_inspectors', array($this, 'render_inspectors_list'));
        add_shortcode('csfp_adjusters', array($this, 'render_adjusters_list'));
        add_shortcode('csfp_profile', array($this, 'render_profile'));
        add_shortcode('csfp_market_tour', array($this, 'render_market_tour'));
        add_shortcode('csfp_visits', array($this, 'render_visits_feed'));
    }
    
    /**
     * Render dashboard
     */
    public function render_dashboard($atts) {
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return $this->render_login_prompt();
        }
        
        ob_start();
        include CSFP_PLUGIN_DIR . 'templates/dashboard.php';
        return ob_get_clean();
    }
    
    /**
     * Render inspectors list
     */
    public function render_inspectors_list($atts) {
        if (!is_user_logged_in()) {
            return $this->render_login_prompt();
        }
        
        ob_start();
        include CSFP_PLUGIN_DIR . 'templates/inspectors-list.php';
        return ob_get_clean();
    }
    
    /**
     * Render adjusters list
     */
    public function render_adjusters_list($atts) {
        if (!is_user_logged_in()) {
            return $this->render_login_prompt();
        }
        
        ob_start();
        include CSFP_PLUGIN_DIR . 'templates/adjusters-list.php';
        return ob_get_clean();
    }
    
    /**
     * Render profile
     */
    public function render_profile($atts) {
        if (!is_user_logged_in()) {
            return $this->render_login_prompt();
        }
        
        // Get inspector/adjuster ID from URL parameter
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if (!$id) {
            return '<div class="csfp-container"><p>No profile selected.</p></div>';
        }
        
        ob_start();
        include CSFP_PLUGIN_DIR . 'templates/profile.php';
        return ob_get_clean();
    }
    
    /**
     * Render market tour
     */
    public function render_market_tour($atts) {
        if (!is_user_logged_in()) {
            return $this->render_login_prompt();
        }
        
        ob_start();
        include CSFP_PLUGIN_DIR . 'templates/market-tour.php';
        return ob_get_clean();
    }
    
    /**
     * Render visits feed
     */
    public function render_visits_feed($atts) {
        if (!is_user_logged_in()) {
            return $this->render_login_prompt();
        }
        
        ob_start();
        include CSFP_PLUGIN_DIR . 'templates/visits-feed.php';
        return ob_get_clean();
    }
    
    /**
     * Render login prompt
     */
    private function render_login_prompt() {
        return '<div class="csfp-container"><div class="csfp-glass csfp-card">
            <h2>Login Required</h2>
            <p>Please log in to access CS Field Pulse.</p>
            <a href="' . wp_login_url(get_permalink()) . '" class="csfp-btn">Login</a>
        </div></div>';
    }
}