<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

$visit_id = isset($visit) && isset($visit->id) ? $visit->id : 0;
$inspector_id = isset($visit) && isset($visit->inspector_id) ? $visit->inspector_id : '';
$visit_date = isset($visit) && isset($visit->visit_date) ? $visit->visit_date : date('Y-m-d');
$location_type = isset($visit) && isset($visit->location_type) ? $visit->location_type : '';
$classification = isset($visit) && isset($visit->classification) ? $visit->classification : 'passive';
$notes = isset($visit) && isset($visit->notes) ? $visit->notes : '';
$page_title = $visit_id ? __('Edit Visit', 'cs-field-pulse') : __('Record Visit', 'cs-field-pulse');
?>

<div class="wrap cs-field-pulse-admin">
    <h1><?php echo $page_title; ?></h1>
    
    <div id="cs-notifications"></div>
    
    <form id="visit-form" class="cs-card">
        <input type="hidden" id="visit-id" value="<?php echo esc_attr($visit_id); ?>">
        
<div class="cs-form-row">
    <label for="inspector-name" class="cs-form-label"><?php _e('Inspector Name', 'cs-field-pulse'); ?> <span class="cs-required">*</span></label>
    <input type="text" id="inspector-name" class="cs-form-control" required>
    <input type="hidden" id="inspector-id" value="">
</div>v>
            
            <div class="cs-form-row">
                <label for="visit-date" class="cs-form-label"><?php _e('Visit Date', 'cs-field-pulse'); ?> <span class="cs-required">*</span></label>
                <input type="date" id="visit-date" class="cs-form-control" value="<?php echo esc_attr($visit_date); ?>" required>
            </div>
            
            <div class="cs-form-row">
                <label for="location-type" class="cs-form-label"><?php _e('Location Type', 'cs-field-pulse'); ?> <span class="cs-required">*</span></label>
                <select id="location-type" class="cs-form-control" required>
                    <option value=""><?php _e('Select Location Type', 'cs-field-pulse'); ?></option>
                    <option value="office" <?php selected($location_type, 'office'); ?>><?php _e('Office', 'cs-field-pulse'); ?></option>
                    <option value="field" <?php selected($location_type, 'field'); ?>><?php _e('Field', 'cs-field-pulse'); ?></option>
                    <option value="virtual" <?php selected($location_type, 'virtual'); ?>><?php _e('Virtual', 'cs-field-pulse'); ?></option>
                </select>
            </div>
            
            <div class="cs-form-row">
                <label class="cs-form-label"><?php _e('Classification', 'cs-field-pulse'); ?> <span class="cs-required">*</span></label>
                <div class="cs-radio-group">
                    <label class="cs-radio">
                        <input type="radio" name="classification" value="promoter" <?php checked($classification, 'promoter'); ?> required>
                        <span class="cs-radio-label cs-text-success"><?php _e('Promoter', 'cs-field-pulse'); ?></span>
                    </label>
                    <label class="cs-radio">
                        <input type="radio" name="classification" value="passive" <?php checked($classification, 'passive'); ?> required>
                        <span class="cs-radio-label cs-text-warning"><?php _e('Passive', 'cs-field-pulse'); ?></span>
                    </label>
                    <label class="cs-radio">
                        <input type="radio" name="classification" value="detractor" <?php checked($classification, 'detractor'); ?> required>
                        <span class="cs-radio-label cs-text-danger"><?php _e('Detractor', 'cs-field-pulse'); ?></span>
                    </label>
                </div>
            </div>
            
            <div class="cs-form-row">
                <label for="notes" class="cs-form-label"><?php _e('Notes', 'cs-field-pulse'); ?></label>
                <textarea id="notes" class="cs-form-control" rows="4"><?php echo esc_textarea($notes); ?></textarea>
            </div>
        </div>
        
        <div class="cs-card-footer">
            <button type="submit" class="cs-btn cs-btn-success"><?php echo $visit_id ? __('Update Visit', 'cs-field-pulse') : __('Save Visit', 'cs-field-pulse'); ?></button>
            <a href="<?php echo admin_url('admin.php?page=cs-field-pulse-visits'); ?>" class="cs-btn cs-btn-secondary"><?php _e('Cancel', 'cs-field-pulse'); ?></a>
        </div>
    </form>
</div>

<script>
jQuery(document).ready(function($) {
    // When the form is submitted
    $('#visit-form').on('submit', function(e) {
        e.preventDefault();
        
        var inspectorName = $('#inspector-name').val();
        
        // First create/get the inspector
        $.ajax({
            url: cs_field_pulse_visits.ajax_url,
            type: 'POST',
            data: {
                action: 'cs_field_pulse_get_or_create_inspector',
                nonce: cs_field_pulse_visits.nonce,
                name: inspectorName
            },
            success: function(response) {
                if (response.success) {
                    // Set the inspector ID and submit the visit
                    $('#inspector-id').val(response.data.inspector_id);
                    submitVisit();
                } else {
                    // Show error message
                    var message = '<div class="cs-alert cs-alert-danger">' + response.data.message + '</div>';
                    $('#cs-notifications').html(message);
                }
            },
            error: function() {
                // Show generic error message
                var message = '<div class="cs-alert cs-alert-danger"><?php _e('Something went wrong. Please try again.', 'cs-field-pulse'); ?></div>';
                $('#cs-notifications').html(message);
            }
        });
    });

    // Function to submit the visit after we have the inspector ID
    function submitVisit() {
        var visitData = {
            id: $('#visit-id').val(),
            inspector_id: $('#inspector-id').val(),
            visit_date: $('#visit-date').val(),
            location_type: $('#location-type').val(),
            classification: $('input[name="classification"]:checked').val(),
            notes: $('#notes').val()
        };
        
        // Show loading state
        $('#visit-form').find('button[type="submit"]').prop('disabled', true).html('<?php _e('Saving...', 'cs-field-pulse'); ?>');
        
        // Save visit via AJAX
        $.ajax({
            url: cs_field_pulse_visits.ajax_url,
            type: 'POST',
            data: {
                action: 'cs_field_pulse_save_visit',
                nonce: cs_field_pulse_visits.nonce,
                visit: JSON.stringify(visitData)
            },
            success: function(response) {
                if (response.success) {
                    // Show success message
                    var message = '<div class="cs-alert cs-alert-success">' + response.data.message + '</div>';
                    $('#cs-notifications').html(message);
                    
                    // Redirect to visit list after a delay
                    setTimeout(function() {
                        window.location.href = '<?php echo admin_url('admin.php?page=cs-field-pulse-visits'); ?>';
                    }, 1500);
                } else {
                    // Show error message
                    var message = '<div class="cs-alert cs-alert-danger">' + response.data.message + '</div>';
                    $('#cs-notifications').html(message);
                    
                    // Re-enable submit button
                    $('#visit-form').find('button[type="submit"]').prop('disabled', false).html('<?php echo $visit_id ? __('Update Visit', 'cs-field-pulse') : __('Save Visit', 'cs-field-pulse'); ?>');
                }
            },
            error: function() {
                // Show generic error message
                var message = '<div class="cs-alert cs-alert-danger"><?php _e('Something went wrong. Please try again.', 'cs-field-pulse'); ?></div>';
                $('#cs-notifications').html(message);
                
                // Re-enable submit button
                $('#visit-form').find('button[type="submit"]').prop('disabled', false).html('<?php echo $visit_id ? __('Update Visit', 'cs-field-pulse') : __('Save Visit', 'cs-field-pulse'); ?>');
            }
        });
    }
});
</script>
