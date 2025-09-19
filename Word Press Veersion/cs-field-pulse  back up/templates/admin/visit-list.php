 <?php
/**
 * Visit list template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get visits
$visits = $visit_manager->get_visits();
?>

<div class="wrap cs-field-pulse-admin">
    <div id="cs-notifications"></div>
    
    <div class="cs-d-flex cs-justify-between cs-align-center">
        <h1><?php _e('Field Visits', 'cs-field-pulse'); ?></h1>
        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits&action=add'); ?>" class="cs-btn cs-btn-icon">
            <span class="dashicons dashicons-plus"></span>
            <?php _e('Record Visit', 'cs-field-pulse'); ?>
        </a>
    </div>
    
    <!-- Search and Filters -->
    <div class="cs-card">
        <div class="cs-search-container">
            <input type="text" id="visit-search" class="cs-form-control cs-search-input" placeholder="<?php _e('Search visits...', 'cs-field-pulse'); ?>">
        </div>
        
        <div class="cs-tabs">
            <div class="cs-filter-option active" data-filter="all"><?php _e('All', 'cs-field-pulse'); ?></div>
            <div class="cs-filter-option" data-filter="promoter"><?php _e('Promoters', 'cs-field-pulse'); ?></div>
            <div class="cs-filter-option" data-filter="passive"><?php _e('Passives', 'cs-field-pulse'); ?></div>
            <div class="cs-filter-option" data-filter="detractor"><?php _e('Detractors', 'cs-field-pulse'); ?></div>
        </div>
    </div>
    
    <!-- Visits List -->
    <div id="visits-list">
        <?php if (empty($visits)) : ?>
            <div class="cs-card cs-text-center">
                <?php _e('No visits found. Click "Record Visit" to create your first visit.', 'cs-field-pulse'); ?>
            </div>
        <?php else : ?>
            <?php foreach ($visits as $visit) : ?>
                <div class="cs-card cs-visit-card <?php echo esc_attr($visit->classification); ?>">
                    <div class="cs-d-flex cs-justify-between">
                        <div>
                            <h3 class="cs-inspector-name"><?php echo esc_html($visit->inspector_name); ?></h3>
                            <div class="cs-visit-date"><?php echo date_i18n(get_option('date_format'), strtotime($visit->visit_date)); ?></div>
                            <div class="cs-visit-location"><?php echo esc_html($visit->location_type); ?></div>
                        </div>
                        <div>
                            <span class="cs-badge cs-badge-<?php echo esc_attr($visit->classification); ?>">
                                <?php echo ucfirst(esc_html($visit->classification)); ?>
                            </span>
                        </div>
                    </div>
                    
                    <?php if (!empty($visit->notes)) : ?>
                        <div class="cs-mt-10"><?php echo wp_kses_post(substr($visit->notes, 0, 100) . (strlen($visit->notes) > 100 ? '...' : '')); ?></div>
                    <?php endif; ?>
                    
                    <div class="cs-card-footer cs-text-right">
                        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits&action=edit&id=' . $visit->id); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                            <?php _e('View Details', 'cs-field-pulse'); ?>
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
