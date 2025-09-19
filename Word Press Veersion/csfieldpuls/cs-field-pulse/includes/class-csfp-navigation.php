<?php
/**
 * Navigation component
 */
 
// Include page finder
require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-page-finder.php';

class CSFP_Navigation {
    
    /**
     * Render navigation bar
     */
    public static function render() {
        $current_page = get_the_ID();
        $logo_url = get_option('csfp_logo_url', '');
        $current_user = wp_get_current_user();
        
        // Get page IDs using page finder
        $dashboard_id = CSFP_Page_Finder::get_dashboard_page_id();
        $inspectors_id = CSFP_Page_Finder::get_inspectors_page_id();
        $adjusters_id = CSFP_Page_Finder::get_adjusters_page_id();
        $visits_id = CSFP_Page_Finder::get_visits_page_id();
        
        // Generate proper URLs using page IDs
        $dashboard_url = $dashboard_id ? get_permalink($dashboard_id) : home_url('/');
        $inspectors_url = $inspectors_id ? get_permalink($inspectors_id) : home_url('/');
        $adjusters_url = $adjusters_id ? get_permalink($adjusters_id) : home_url('/');
        $visits_url = $visits_id ? get_permalink($visits_id) : home_url('/');
        
        // If permalinks fail, try with page_id parameter
        if (!$dashboard_url || $dashboard_url == home_url('/')) {
            $dashboard_url = home_url('/?page_id=' . $dashboard_id);
        }
        if (!$inspectors_url || $inspectors_url == home_url('/')) {
            $inspectors_url = home_url('/?page_id=' . $inspectors_id);
        }
        if (!$adjusters_url || $adjusters_url == home_url('/')) {
            $adjusters_url = home_url('/?page_id=' . $adjusters_id);
        }
        if (!$visits_url || $visits_url == home_url('/')) {
            $visits_url = home_url('/?page_id=' . $visits_id);
        }
        
        ?>
        <!-- Logo Section - Spans most of screen -->
        <div class="csfp-logo-section">
            <?php if ($logo_url): ?>
                <img src="<?php echo esc_url($logo_url); ?>" alt="CS Field Pulse" class="csfp-nav-logo">
            <?php endif; ?>
            
            <!-- Logout button at top-right -->
            <a href="<?php echo wp_logout_url(home_url()); ?>" class="csfp-logout-top">
                Logout
            </a>
        </div>
        
        <!-- Navigation Menu in Glass Window -->
        <div class="csfp-glass csfp-nav-window">
            <div class="csfp-nav-items">
                <a href="<?php echo esc_url($dashboard_url); ?>" class="csfp-nav-item <?php echo $current_page == $dashboard_id ? 'active' : ''; ?>">
                    <span class="nav-icon">📊</span> Dashboard
                </a>
                
                <a href="<?php echo esc_url($inspectors_url); ?>" class="csfp-nav-item <?php echo $current_page == $inspectors_id ? 'active' : ''; ?>">
                    <span class="nav-icon">👥</span> Inspectors
                </a>
                
                <a href="<?php echo esc_url($adjusters_url); ?>" class="csfp-nav-item <?php echo $current_page == $adjusters_id ? 'active' : ''; ?>">
                    <span class="nav-icon">📋</span> Adjusters
                </a>
                
                <a href="<?php echo esc_url($visits_url); ?>" class="csfp-nav-item <?php echo $current_page == $visits_id ? 'active' : ''; ?>">
                    <span class="nav-icon">📍</span> Visits
                </a>
                
                <button id="csfp-export-visits-nav" class="csfp-nav-item csfp-nav-export">
                    <span class="nav-icon">📊</span> Export Visits
                </button>
            </div>
            
            <div class="csfp-nav-user">
                <span>👤 <?php echo esc_html($current_user->display_name); ?></span>
            </div>
        </div>
        <?php
    }
}