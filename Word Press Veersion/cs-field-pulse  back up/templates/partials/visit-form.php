 <?php
/**
 * Visit form partial template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Required variables:
// $visit - Visit object (optional, null for new visit)
// $inspectors - Array of inspector objects
// $visit_types - Array of visit types
// $action - 'create' or 'update'

// Pre-selected inspector ID from URL
$selected_inspector_id = isset($_GET['inspector_id']) ? intval($_GET['inspector_id']) : ($visit ? $visit->inspector_id : 0);
?>

<form method="post" action="" id="visit-form" data-redirect="<?php echo admin_url('admin.php?page=cs-field-pulse-visits'); ?>">
    <?php wp_nonce_field('cs_field_pulse_visit', 'cs_field_pulse_visit_nonce'); ?>
    <input type="hidden" name="action" value="<?php echo $action; ?>">
    <?php if ($visit) : ?>
        <input type="hidden" name="visit_id" value="<?php echo $visit->id; ?>">
    <?php endif; ?>
    
    <div class="cs-grid">
        <div class="cs-grid-col-2">
            <div class="cs-form-group">
                <label for="inspector_id" class="cs-form-label"><?php _e('Inspector', 'cs-field-pulse'); ?> <span class="required">*</span></label>
                <select name="inspector_id" id="inspector_id" class="cs-form-control cs-form-select" required>
                    <option value=""><?php _e('Select Inspector', 'cs-field-pulse'); ?></option>
                    <?php foreach ($inspectors as $inspector) : ?>
                        <option value="<?php echo $inspector->id; ?>" <?php selected($inspector->id, $selected_inspector_id); ?>>
                            <?php echo esc_html($inspector->name); ?> 
                            (<?php echo ucfirst(esc_html($inspector->classification)); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="cs-form-group">
                <label for="visit_date" class="cs-form-label"><?php _e('Visit Date', 'cs-field-pulse'); ?> <span class="required">*</span></label>
                <input type="date" name="visit_date" id="visit_date" class="cs-form-control cs-datepicker" 
                       value="<?php echo $visit ? date('Y-m-d', strtotime($visit->visit_date)) : date('Y-m-d'); ?>" 
                       max="<?php echo date('Y-m-d'); ?>" required>
            </div>
            
            <div class="cs-form-group">
                <label for="location_type" class="cs-form-label"><?php _e('Location Type', 'cs-field-pulse'); ?> <span class="required">*</span></label>
                <select name="location_type" id="location_type" class="cs-form-control cs-form-select" required>
                    <option value=""><?php _e('Select Location Type', 'cs-field-pulse'); ?></option>
                    <?php foreach ($visit_types as $type) : ?>
                        <option value="<?php echo esc_attr($type); ?>" <?php selected($visit && $visit->location_type === $type); ?>>
                            <?php echo esc_html(ucwords(str_replace('_', ' ', $type))); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="cs-form-group">
                <label for="classification" class="cs-form-label"><?php _e('Visit Classification', 'cs-field-pulse'); ?></label>
                <select name="classification" id="classification" class="cs-form-control cs-form-select">
                    <option value="promoter" <?php selected($visit && $visit->classification === 'promoter'); ?>><?php _e('Promoter', 'cs-field-pulse'); ?></option>
                    <option value="passive" <?php selected(!$visit || $visit->classification === 'passive'); ?>><?php _e('Passive', 'cs-field-pulse'); ?></option>
                    <option value="detractor" <?php selected($visit && $visit->classification === 'detractor'); ?>><?php _e('Detractor', 'cs-field-pulse'); ?></option>
                </select>
            </div>
            
            <div class="cs-form-group">
                <label for="notes" class="cs-form-label"><?php _e('Visit Notes', 'cs-field-pulse'); ?></label>
                <textarea name="notes" id="notes" class="cs-form-control" rows="5"><?php echo $visit ? esc_textarea($visit->notes) : ''; ?></textarea>
            </div>
        </div>
    </div>
    
    <div class="cs-card-footer cs-d-flex cs-justify-between">
        <button type="submit" class="cs-btn cs-btn-primary">
            <?php echo $visit ? __('Update Visit', 'cs-field-pulse') : __('Record Visit', 'cs-field-pulse'); ?>
        </button>
        
        <?php if ($visit) : ?>
            <button type="button" class="cs-btn cs-btn-danger" data-confirm="<?php _e('Are you sure you want to delete this visit? This action cannot be undone.', 'cs-field-pulse'); ?>" onclick="document.getElementById('delete-visit-form').submit();">
                <?php _e('Delete Visit', 'cs-field-pulse'); ?>
            </button>
        <?php endif; ?>
    </div>
</form>

<?php if ($visit) : ?>
    <form id="delete-visit-form" method="post" action="">
        <?php wp_nonce_field('cs_field_pulse_visit', 'cs_field_pulse_visit_nonce'); ?>
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="visit_id" value="<?php echo $visit->id; ?>">
    </form>
<?php endif; ?>
