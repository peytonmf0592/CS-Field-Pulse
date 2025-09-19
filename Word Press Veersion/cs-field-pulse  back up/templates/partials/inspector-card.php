 <?php
/**
 * Inspector card partial template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Required variables:
// $inspector - Inspector object

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
    
    <?php if (isset($show_stats) && $show_stats && isset($inspector->visit_stats)) : ?>
        <div class="cs-inspector-meta">
            <div class="cs-inspector-stat">
                <div class="cs-inspector-stat-value"><?php echo esc_html($inspector->visit_stats->total_visits ?? 0); ?></div>
                <div class="cs-inspector-stat-label"><?php _e('Visits', 'cs-field-pulse'); ?></div>
            </div>
            <div class="cs-inspector-stat">
                <div class="cs-inspector-stat-value"><?php echo esc_html($inspector->visit_stats->promoter_visits ?? 0); ?></div>
                <div class="cs-inspector-stat-label"><?php _e('Promoter', 'cs-field-pulse'); ?></div>
            </div>
            <div class="cs-inspector-stat">
                <div class="cs-inspector-stat-value"><?php echo esc_html($inspector->visit_stats->detractor_visits ?? 0); ?></div>
                <div class="cs-inspector-stat-label"><?php _e('Detractor', 'cs-field-pulse'); ?></div>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="cs-card-footer cs-d-flex cs-justify-between cs-mt-10">
        <?php if (isset($show_classification_toggle) && $show_classification_toggle) : ?>
            <button class="cs-btn cs-btn-sm cs-classification-toggle" data-inspector-id="<?php echo esc_attr($inspector->id); ?>" data-classification="<?php echo esc_attr($inspector->classification); ?>">
                <?php _e('Change Classification', 'cs-field-pulse'); ?>
            </button>
        <?php endif; ?>
        
        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors&action=edit&id=' . $inspector->id); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
            <?php _e('View Details', 'cs-field-pulse'); ?>
        </a>
    </div>
</div>
