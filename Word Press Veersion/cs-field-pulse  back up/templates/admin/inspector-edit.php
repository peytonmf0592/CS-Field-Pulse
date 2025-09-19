 <?php
/**
 * Inspector edit template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : '';
$inspector_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Get inspector data if editing
$inspector = null;
if ($action === 'edit' && $inspector_id > 0) {
    $inspector = $inspector_manager->get_inspector($inspector_id);
    
    if (!$inspector) {
        wp_die(__('Inspector not found.', 'cs-field-pulse'));
    }
}

// Set page title
$page_title = $action === 'edit' ? __('Edit Inspector', 'cs-field-pulse') : __('Add Inspector', 'cs-field-pulse');
?>

<div class="wrap cs-field-pulse-admin">
    <div id="cs-notifications"></div>
    
    <div class="cs-d-flex cs-justify-between cs-align-center">
        <h1><?php echo $page_title; ?></h1>
        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors'); ?>" class="cs-btn cs-btn-secondary cs-btn-icon">
            <span class="dashicons dashicons-arrow-left-alt"></span>
            <?php _e('Back to Inspectors', 'cs-field-pulse'); ?>
        </a>
    </div>
    
    <div class="cs-grid">
        <div class="cs-grid-col-2">
            <!-- Inspector Form -->
            <div class="cs-card">
                <form method="post" action="" id="inspector-form" data-redirect="<?php echo admin_url('admin.php?page=cs-field-pulse-inspectors'); ?>">
                    <?php wp_nonce_field('cs_field_pulse_inspector', 'cs_field_pulse_inspector_nonce'); ?>
                    <input type="hidden" name="action" value="<?php echo $action === 'edit' ? 'update' : 'create'; ?>">
                    <?php if ($inspector) : ?>
                        <input type="hidden" name="inspector_id" value="<?php echo $inspector->id; ?>">
                    <?php endif; ?>
                    
                    <div class="cs-form-group">
                        <label for="name" class="cs-form-label"><?php _e('Name', 'cs-field-pulse'); ?> <span class="required">*</span></label>
                        <input type="text" name="name" id="name" class="cs-form-control" value="<?php echo $inspector ? esc_attr($inspector->name) : ''; ?>" required>
                    </div>
                    
                    <div class="cs-form-group">
                        <label for="email" class="cs-form-label"><?php _e('Email', 'cs-field-pulse'); ?></label>
                        <input type="email" name="email" id="email" class="cs-form-control" value="<?php echo $inspector ? esc_attr($inspector->email) : ''; ?>">
                    </div>
                    
                    <div class="cs-form-group">
                        <label for="phone" class="cs-form-label"><?php _e('Phone', 'cs-field-pulse'); ?></label>
                        <input type="tel" name="phone" id="phone" class="cs-form-control" value="<?php echo $inspector ? esc_attr($inspector->phone) : ''; ?>">
                    </div>
                    
                    <div class="cs-form-group">
                        <label for="location" class="cs-form-label"><?php _e('Location', 'cs-field-pulse'); ?></label>
                        <input type="text" name="location" id="location" class="cs-form-control" value="<?php echo $inspector ? esc_attr($inspector->location) : ''; ?>">
                    </div>
                    
                    <div class="cs-form-group">
                        <label for="classification" class="cs-form-label"><?php _e('Classification', 'cs-field-pulse'); ?></label>
                        <select name="classification" id="classification" class="cs-form-control cs-form-select">
                            <option value="promoter" <?php selected($inspector && $inspector->classification === 'promoter'); ?>><?php _e('Promoter', 'cs-field-pulse'); ?></option>
                            <option value="passive" <?php selected(!$inspector || $inspector->classification === 'passive'); ?>><?php _e('Passive', 'cs-field-pulse'); ?></option>
                            <option value="detractor" <?php selected($inspector && $inspector->classification === 'detractor'); ?>><?php _e('Detractor', 'cs-field-pulse'); ?></option>
                        </select>
                    </div>
                    
                    <div class="cs-form-group">
                        <label for="notes" class="cs-form-label"><?php _e('Notes', 'cs-field-pulse'); ?></label>
                        <textarea name="notes" id="notes" class="cs-form-control" rows="5"><?php echo $inspector ? esc_textarea($inspector->notes) : ''; ?></textarea>
                    </div>
                    
                    <div class="cs-card-footer cs-d-flex cs-justify-between">
                        <button type="submit" class="cs-btn cs-btn-primary">
                            <?php echo $action === 'edit' ? __('Update Inspector', 'cs-field-pulse') : __('Create Inspector', 'cs-field-pulse'); ?>
                        </button>
                        
                        <?php if ($action === 'edit') : ?>
                            <button type="button" class="cs-btn cs-btn-danger" data-confirm="<?php _e('Are you sure you want to delete this inspector? This action cannot be undone.', 'cs-field-pulse'); ?>" onclick="document.getElementById('delete-inspector-form').submit();">
                                <?php _e('Delete Inspector', 'cs-field-pulse'); ?>
                            </button>
                        <?php endif; ?>
                    </div>
                </form>
                
                <?php if ($action === 'edit') : ?>
                    <form id="delete-inspector-form" method="post" action="">
                        <?php wp_nonce_field('cs_field_pulse_inspector', 'cs_field_pulse_inspector_nonce'); ?>
                        <input type="hidden" name="action" value="delete">
                        <input type="hidden" name="inspector_id" value="<?php echo $inspector->id; ?>">
                    </form>
                <?php endif; ?>
            </div>
        </div>
        
        <?php if ($action === 'edit' && $inspector) : ?>
            <div>
                <!-- Recent Visits -->
                <div class="cs-card">
                    <div class="cs-card-header">
                        <h2 class="cs-card-title"><?php _e('Recent Visits', 'cs-field-pulse'); ?></h2>
                        <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits&action=add&inspector_id=' . $inspector->id); ?>" class="cs-btn cs-btn-sm cs-btn-secondary">
                            <?php _e('Add Visit', 'cs-field-pulse'); ?>
                        </a>
                    </div>
                    <div class="cs-card-content">
                        <?php
                        $visits = $inspector_manager->get_inspector_visits($inspector->id, array('limit' => 5));
                        
                        if (empty($visits)) {
                            echo '<div class="cs-text-center">' . __('No visits recorded for this inspector.', 'cs-field-pulse') . '</div>';
                        } else {
                            foreach ($visits as $visit) {
                                ?>
                                <div class="cs-card cs-visit-card <?php echo esc_attr($visit->classification); ?>">
                                    <div class="cs-d-flex cs-justify-between">
                                        <div>
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
                                <?php
                            }
                        }
                        ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>
