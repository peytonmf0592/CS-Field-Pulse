<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
?>
<div class="wrap cs-field-pulse-admin">
    <div id="cs-notifications"></div>
    
    <div class="cs-d-flex cs-justify-between cs-align-center">
        <h1><?php _e('CS Field Pulse Dashboard', 'cs-field-pulse'); ?></h1>
        <button id="refresh-dashboard" class="cs-btn cs-btn-sm cs-btn-icon">
            <span class="dashicons dashicons-update"></span>
            <?php _e('Refresh', 'cs-field-pulse'); ?>
        </button>
    </div>
    
    <div class="cs-card cs-text-center" style="margin: 20px 0 40px 0; padding: 30px;">
        <h2 style="margin-bottom: 15px;"><?php _e('Record a new field visit', 'cs-field-pulse'); ?></h2>
        <p style="margin-bottom: 20px;"><?php _e('Document inspector engagements, evaluate performance, and track transformation.', 'cs-field-pulse'); ?></p>
        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits&action=add'); ?>" class="cs-btn cs-btn-success cs-btn-icon cs-btn-lg">
            <span class="dashicons dashicons-plus"></span>
            <?php _e('Record Visit', 'cs-field-pulse'); ?>
        </a>
    </div>
    
    <div class="loading-dashboard-data cs-card cs-text-center" style="display: none;">
        <div class="cs-loading"></div>
        <p><?php _e('Loading dashboard data...', 'cs-field-pulse'); ?></p>
    </div>
    
    <!-- Summary Metrics -->
    <div class="cs-grid">
        <div class="cs-card cs-metric-card">
            <div class="cs-metric-label"><?php _e('Total Inspectors', 'cs-field-pulse'); ?></div>
            <div id="total-inspectors" class="cs-metric-value">0</div>
            <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors'); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                <?php _e('View All', 'cs-field-pulse'); ?>
            </a>
        </div>
        
        <div class="cs-card cs-metric-card">
            <div class="cs-metric-label"><?php _e('Total Visits', 'cs-field-pulse'); ?></div>
            <div id="total-visits" class="cs-metric-value">0</div>
            <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits'); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                <?php _e('View All', 'cs-field-pulse'); ?>
            </a>
        </div>
        
        <div class="cs-card cs-metric-card">
            <div class="cs-metric-label"><?php _e('Visits This Month', 'cs-field-pulse'); ?></div>
            <div id="visits-this-month" class="cs-metric-value">0</div>
            <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits'); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                <?php _e('View Details', 'cs-field-pulse'); ?>
            </a>
        </div>
    </div>
    
    <!-- Classification Distribution -->
    <div class="cs-card">
        <div class="cs-card-header">
            <h2 class="cs-card-title"><?php _e('Classification Distribution', 'cs-field-pulse'); ?></h2>
        </div>
        <div class="cs-card-content">
            <div class="cs-d-flex cs-justify-between cs-mb-10">
                <div>
                    <span class="cs-badge cs-badge-promoter"><?php _e('Promoters', 'cs-field-pulse'); ?></span>
                    <span id="promoter-percent">0%</span>
                </div>
                <div>
                    <span class="cs-badge cs-badge-passive"><?php _e('Passives', 'cs-field-pulse'); ?></span>
                    <span id="passive-percent">0%</span>
                </div>
                <div>
                    <span class="cs-badge cs-badge-detractor"><?php _e('Detractors', 'cs-field-pulse'); ?></span>
                    <span id="detractor-percent">0%</span>
                </div>
            </div>
            <div class="cs-progress">
                <div id="promoter-bar" class="cs-progress-bar" style="background-color: var(--cs-success); width: 0%"></div>
            </div>
            <div class="cs-progress">
                <div id="passive-bar" class="cs-progress-bar" style="background-color: var(--cs-warning); width: 0%"></div>
            </div>
            <div class="cs-progress">
                <div id="detractor-bar" class="cs-progress-bar" style="background-color: var(--cs-danger); width: 0%"></div>
            </div>
        </div>
    </div>
    
    <!-- Charts -->
    <div class="cs-dashboard-charts">
        <!-- Chart Filters -->
        <div class="cs-d-flex cs-justify-between cs-mb-10">
            <div class="cs-tabs">
                <div class="cs-period-filter active" data-period="month"><?php _e('Monthly', 'cs-field-pulse'); ?></div>
                <div class="cs-period-filter" data-period="week"><?php _e('Weekly', 'cs-field-pulse'); ?></div>
                <div class="cs-period-filter" data-period="day"><?php _e('Daily', 'cs-field-pulse'); ?></div>
            </div>
        </div>
        
        <div class="cs-grid">
            <div class="cs-chart-container cs-grid-col-2">
                <canvas id="visits-chart"></canvas>
            </div>
            
            <div class="cs-chart-container">
                <canvas id="classification-chart"></canvas>
            </div>
            
            <div class="cs-chart-container">
                <canvas id="criteria-chart"></canvas>
            </div>
        </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="cs-grid">
        <div class="cs-grid-col-2">
            <div class="cs-card">
                <div class="cs-card-header">
                    <h2 class="cs-card-title"><?php _e('Recent Visits', 'cs-field-pulse'); ?></h2>
                    <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits'); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                        <?php _e('View All', 'cs-field-pulse'); ?>
                    </a>
                </div>
                <div class="cs-card-content">
                    <div id="recent-visits" class="cs-loading">
                        <!-- Recent visits will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
        
        <div>
            <div class="cs-card">
                <div class="cs-card-header">
                    <h2 class="cs-card-title"><?php _e('Recent Inspector Activity', 'cs-field-pulse'); ?></h2>
                    <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors'); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                        <?php _e('View All', 'cs-field-pulse'); ?>
                    </a>
                </div>
                <div class="cs-card-content">
                    <div id="recent-inspectors" class="cs-loading">
                        <!-- Recent inspectors will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>