 <?php
/**
 * Inspector list template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get inspectors
$inspectors = $inspector_manager->get_inspectors();
?>

<div class="wrap cs-field-pulse-admin">
    <div id="cs-notifications"></div>
    
    <div class="cs-d-flex cs-justify-between cs-align-center">
        <h1><?php _e('Inspectors', 'cs-field-pulse'); ?></h1>
        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors&action=add'); ?>" class="cs-btn cs-btn-icon">
            <span class="dashicons dashicons-plus"></span>
            <?php _e('Add Inspector', 'cs-field-pulse'); ?>
        </a>
    </div>
    
    <!-- Search and Filters -->
    <div class="cs-card">
        <div class="cs-search-container">
            <input type="text" id="inspector-search" class="cs-form-control cs-search-input" placeholder="<?php _e('Search inspectors...', 'cs-field-pulse'); ?>">
        </div>
        
        <div class="cs-tabs">
            <div class="cs-filter-option active" data-filter="all"><?php _e('All', 'cs-field-pulse'); ?></div>
            <div class="cs-filter-option" data-filter="promoter"><?php _e('Promoters', 'cs-field-pulse'); ?></div>
            <div class="cs-filter-option" data-filter="passive"><?php _e('Passives', 'cs-field-pulse'); ?></div>
            <div class="cs-filter-option" data-filter="detractor"><?php _e('Detractors', 'cs-field-pulse'); ?></div>
        </div>
    </div>
    
    <!-- Inspectors Grid -->
    <div id="inspectors-list" class="cs-grid">
        <?php if (empty($inspectors)) : ?>
            <div class="cs-card cs-text-center">
                <?php _e('No inspectors found. Click "Add Inspector" to create your first inspector.', 'cs-field-pulse'); ?>
            </div>
        <?php else : ?>
            <?php foreach ($inspectors as $inspector) : 
                // Get initials for avatar
                $name_parts = explode(' ', $inspector->name);
                $initials = '';
                foreach ($name_parts as $part) {
                    $initials .= !empty($part) ? strtoupper(substr($part, 0, 1)) : '';
                }
                $initials = substr($initials, 0, 2);
            ?>
                <div class="cs-card cs-inspector-card" data-id="<?php echo esc_attr($inspector->id); ?>" data-classification="<?php echo esc_attr($inspector->classification); ?>">
                    <div class="cs-inspector-header">
                        <div class="cs-inspector-avatar"><?php echo esc_html($initials); ?></div>
                        <div class="cs-inspector-info">
                            <h3 class="cs-inspector-name"><?php echo esc_html($inspector->name); ?></h3>
                            <div>
                                <span class="cs-badge cs-badge-<?php echo esc_attr($inspector->classification); ?>">
                                    <?php echo ucfirst(esc_html($inspector->classification)); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <?php if (!empty($inspector->email) || !empty($inspector->phone) || !empty($inspector->location)) : ?>
                        <div class="cs-inspector-details">
                            <?php if (!empty($inspector->email)) : ?>
                                <div><strong><?php _e('Email:', 'cs-field-pulse'); ?></strong> <?php echo esc_html($inspector->email); ?></div>
                            <?php endif; ?>
                            
                            <?php if (!empty($inspector->phone)) : ?>
                                <div><strong><?php _e('Phone:', 'cs-field-pulse'); ?></strong> <?php echo esc_html($inspector->phone); ?></div>
                            <?php endif; ?>
                            
                            <?php if (!empty($inspector->location)) : ?>
                                <div><strong><?php _e('Location:', 'cs-field-pulse'); ?></strong> <?php echo esc_html($inspector->location); ?></div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    
                    <div class="cs-card-footer cs-d-flex cs-justify-between cs-mt-10">
                        <button class="cs-btn cs-btn-sm cs-classification-toggle" data-inspector-id="<?php echo esc_attr($inspector->id); ?>" data-classification="<?php echo esc_attr($inspector->classification); ?>">
                            <?php _e('Change Classification', 'cs-field-pulse'); ?>
                        </button>
                        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors&action=edit&id=' . $inspector->id); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                            <?php _e('Edit', 'cs-field-pulse'); ?>
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
