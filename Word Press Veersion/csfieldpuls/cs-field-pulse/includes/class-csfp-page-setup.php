<?php
/**
 * Page setup class - creates necessary WordPress pages with shortcodes
 */
class CSFP_Page_Setup {
    
    /**
     * Create all required pages
     */
    public static function create_pages() {
        $pages = array(
            // Dashboard page
            array(
                'post_title'    => 'CS Field Pulse Dashboard',
                'post_name'     => 'csfp-dashboard',
                'post_content'  => '[csfp_dashboard]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'menu_order'    => 1,
                'meta_input'    => array(
                    '_wp_page_template' => 'default'
                )
            ),
            // Inspectors list page
            array(
                'post_title'    => 'Inspectors',
                'post_name'     => 'csfp-inspectors',
                'post_content'  => '[csfp_inspectors]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'menu_order'    => 2,
                'meta_input'    => array(
                    '_wp_page_template' => 'default'
                )
            ),
            // Adjusters list page
            array(
                'post_title'    => 'Adjusters',
                'post_name'     => 'csfp-adjusters',
                'post_content'  => '[csfp_adjusters]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'menu_order'    => 3,
                'meta_input'    => array(
                    '_wp_page_template' => 'default'
                )
            ),
            // Profile page
            array(
                'post_title'    => 'Profile',
                'post_name'     => 'csfp-profile',
                'post_content'  => '[csfp_profile]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'menu_order'    => 4,
                'meta_input'    => array(
                    '_wp_page_template' => 'default'
                )
            ),
            // Market Tour page
            array(
                'post_title'    => 'Market Tour',
                'post_name'     => 'csfp-market-tour',
                'post_content'  => '[csfp_market_tour]',
                'post_status'   => 'publish',
                'post_type'     => 'page',
                'menu_order'    => 5,
                'meta_input'    => array(
                    '_wp_page_template' => 'default'
                )
            )
        );
        
        // Create pages if they don't exist
        foreach ($pages as $page) {
            $existing_page = get_page_by_path($page['post_name']);
            
            if (!$existing_page) {
                $page_id = wp_insert_post($page);
                
                if ($page_id && !is_wp_error($page_id)) {
                    // Store page IDs in options for easy access
                    update_option('csfp_page_' . str_replace('-', '_', $page['post_name']), $page_id);
                }
            } else {
                // Update the option with existing page ID
                update_option('csfp_page_' . str_replace('-', '_', $page['post_name']), $existing_page->ID);
            }
        }
        
        // Set the dashboard page as the front page
        $dashboard_page_id = get_option('csfp_page_csfp_dashboard');
        if ($dashboard_page_id) {
            update_option('page_on_front', $dashboard_page_id);
            update_option('show_on_front', 'page');
        }
        
        // Create a custom menu
        self::create_navigation_menu();
    }
    
    /**
     * Create navigation menu
     */
    private static function create_navigation_menu() {
        $menu_name = 'CS Field Pulse Menu';
        $menu_exists = wp_get_nav_menu_object($menu_name);
        
        // If menu doesn't exist, create it
        if (!$menu_exists) {
            $menu_id = wp_create_nav_menu($menu_name);
            
            // Add pages to menu
            $pages = array(
                'csfp_page_csfp_dashboard' => 'Dashboard',
                'csfp_page_csfp_inspectors' => 'Inspectors',
                'csfp_page_csfp_adjusters' => 'Adjusters',
                'csfp_page_csfp_market_tour' => 'Market Tour'
            );
            
            $menu_order = 1;
            foreach ($pages as $option_name => $title) {
                $page_id = get_option($option_name);
                if ($page_id) {
                    wp_update_nav_menu_item($menu_id, 0, array(
                        'menu-item-title' => $title,
                        'menu-item-object' => 'page',
                        'menu-item-object-id' => $page_id,
                        'menu-item-type' => 'post_type',
                        'menu-item-status' => 'publish',
                        'menu-item-position' => $menu_order
                    ));
                    $menu_order++;
                }
            }
            
            // Add logout link
            wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => 'Logout',
                'menu-item-url' => wp_logout_url(home_url()),
                'menu-item-status' => 'publish',
                'menu-item-position' => $menu_order
            ));
            
            // Set menu location (if theme supports it)
            $locations = get_theme_mod('nav_menu_locations');
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }
    
    /**
     * Delete all plugin pages
     */
    public static function delete_pages() {
        $page_options = array(
            'csfp_page_csfp_dashboard',
            'csfp_page_csfp_inspectors',
            'csfp_page_csfp_adjusters',
            'csfp_page_csfp_profile',
            'csfp_page_csfp_market_tour'
        );
        
        foreach ($page_options as $option) {
            $page_id = get_option($option);
            if ($page_id) {
                wp_delete_post($page_id, true);
                delete_option($option);
            }
        }
    }
}