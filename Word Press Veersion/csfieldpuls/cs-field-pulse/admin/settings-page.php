<?php
/**
 * Admin Settings Page
 */

// Save settings
if (isset($_POST['csfp_save_settings'])) {
    check_admin_referer('csfp_settings_nonce');
    
    update_option('csfp_logo_url', sanitize_url($_POST['csfp_logo_url']));
    update_option('csfp_ai_api_key', sanitize_text_field($_POST['csfp_ai_api_key']));
    update_option('csfp_google_maps_api_key', sanitize_text_field($_POST['csfp_google_maps_api_key']));
    
    echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
}
?>

<div class="wrap">
    <h1>CS Field Pulse Settings</h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('csfp_settings_nonce'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="csfp_logo_url">Logo URL</label>
                </th>
                <td>
                    <input type="url" 
                           id="csfp_logo_url" 
                           name="csfp_logo_url" 
                           value="<?php echo esc_attr(get_option('csfp_logo_url', '')); ?>" 
                           class="regular-text" />
                    <p class="description">Enter the URL of your logo image (recommended: 200x50px)</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="csfp_ai_api_key">AI API Key</label>
                </th>
                <td>
                    <input type="password" 
                           id="csfp_ai_api_key" 
                           name="csfp_ai_api_key" 
                           value="<?php echo esc_attr(get_option('csfp_ai_api_key', '')); ?>" 
                           class="regular-text" />
                    <p class="description">Enter your OpenAI API key for AI features</p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="csfp_google_maps_api_key">Google Maps API Key</label>
                </th>
                <td>
                    <input type="password" 
                           id="csfp_google_maps_api_key" 
                           name="csfp_google_maps_api_key" 
                           value="<?php echo esc_attr(get_option('csfp_google_maps_api_key', '')); ?>" 
                           class="regular-text" />
                    <p class="description">Enter your Google Maps API key for map features</p>
                </td>
            </tr>
        </table>
        
        <p class="submit">
            <input type="submit" 
                   name="csfp_save_settings" 
                   class="button-primary" 
                   value="Save Settings" />
        </p>
    </form>
    
    <hr />
    
    <h2>Quick Actions</h2>
    
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <button id="csfp-create-pages" class="button button-primary">
            Create All Pages
        </button>
        
        <button id="csfp-create-demo" class="button">
            Add Demo Data (500+ Records)
        </button>
        
        <button id="csfp-delete-demo" class="button" style="color: #d63638;">
            Delete All Data
        </button>
        
        <button id="csfp-upgrade-db" class="button">
            Upgrade Database
        </button>
    </div>
    
    <div id="csfp-action-result"></div>
    
    <hr />
    
    <h2>Page Status</h2>
    
    <table class="widefat">
        <thead>
            <tr>
                <th>Page</th>
                <th>Status</th>
                <th>Shortcode</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $pages = array(
                array('name' => 'Dashboard', 'option' => 'csfp_dashboard_page_id', 'shortcode' => '[csfp_dashboard]'),
                array('name' => 'Inspectors', 'option' => 'csfp_inspectors_page_id', 'shortcode' => '[csfp_inspectors]'),
                array('name' => 'Adjusters', 'option' => 'csfp_adjusters_page_id', 'shortcode' => '[csfp_adjusters]'),
                array('name' => 'Profile', 'option' => 'csfp_profile_page_id', 'shortcode' => '[csfp_profile]'),
                array('name' => 'Visits', 'option' => 'csfp_visits_page_id', 'shortcode' => '[csfp_visits]')
            );
            
            foreach ($pages as $page) {
                $page_id = get_option($page['option']);
                $status = $page_id && get_post($page_id) ? '<span style="color: green;">✓ Created</span>' : '<span style="color: red;">✗ Not Created</span>';
                $link = $page_id ? ' (<a href="' . get_permalink($page_id) . '" target="_blank">View</a>)' : '';
                
                echo '<tr>';
                echo '<td>' . $page['name'] . $link . '</td>';
                echo '<td>' . $status . '</td>';
                echo '<td><code>' . $page['shortcode'] . '</code></td>';
                echo '</tr>';
            }
            ?>
        </tbody>
    </table>
    
    <hr />
    
    <h2>Database Status</h2>
    
    <?php
    global $wpdb;
    $tables = array(
        'csfp_inspectors' => 'Inspectors/Adjusters',
        'csfp_engagements' => 'Engagements',
        'csfp_sentiment_changes' => 'Sentiment Changes',
        'csfp_media' => 'Media Uploads'
    );
    ?>
    
    <table class="widefat">
        <thead>
            <tr>
                <th>Table</th>
                <th>Records</th>
            </tr>
        </thead>
        <tbody>
            <?php
            foreach ($tables as $table => $name) {
                $full_table = $wpdb->prefix . $table;
                $count = $wpdb->get_var("SELECT COUNT(*) FROM $full_table");
                
                echo '<tr>';
                echo '<td>' . $name . '</td>';
                echo '<td>' . number_format($count) . '</td>';
                echo '</tr>';
            }
            ?>
        </tbody>
    </table>
</div>