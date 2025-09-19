 <?php
/**
 * Settings template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap cs-field-pulse-admin">
    <div id="cs-notifications"></div>
    
    <h1><?php _e('CS Field Pulse Settings', 'cs-field-pulse'); ?></h1>
    
    <div class="cs-card">
        <form method="post" action="options.php" class="cs-settings-form">
            <?php
            // Output security fields
            settings_fields('cs_field_pulse_settings');
            
            // Output setting sections
            do_settings_sections('cs_field_pulse_settings');
            ?>
            
            <div class="cs-card-footer">
                <?php submit_button(__('Save Settings', 'cs-field-pulse'), 'cs-btn cs-btn-primary'); ?>
            </div>
        </form>
    </div>
    
    <script>
        jQuery(document).ready(function($) {
            // Convert visit types textarea to array on submit
            $('.cs-settings-form').on('submit', function() {
                var visitTypesTextarea = $('textarea[name="cs_field_pulse_settings[visit_types]"]');
                if (visitTypesTextarea.length) {
                    var types = visitTypesTextarea.val().split('\n');
                    visitTypesTextarea.val(types.join(','));
                }
            });
            
            // Handle evaluation criteria actions
            $('#add-criteria').on('click', function() {
                var name = $('#new-criteria-name').val();
                var key = $('#new-criteria-key').val();
                var description = $('#new-criteria-description').val();
                
                if (!name || !key) {
                    alert('<?php _e('Name and Key are required fields.', 'cs-field-pulse'); ?>');
                    return;
                }
                
                // Create slug format for key if not provided
                if (!key) {
                    key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                }
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'cs_field_pulse_create_criteria',
                        nonce: cs_field_pulse.nonce,
                        display_name: name,
                        criteria_key: key,
                        description: description
                    },
                    success: function(response) {
                        if (response.success) {
                            // Clear form
                            $('#new-criteria-name').val('');
                            $('#new-criteria-key').val('');
                            $('#new-criteria-description').val('');
                            
                            // Reload page to show new criteria
                            location.reload();
                        } else {
                            alert(response.data || '<?php _e('Failed to add criteria.', 'cs-field-pulse'); ?>');
                        }
                    },
                    error: function() {
                        alert('<?php _e('An error occurred. Please try again.', 'cs-field-pulse'); ?>');
                    }
                });
            });
            
            // Handle edit criteria button
            $(document).on('click', '.edit-criteria', function() {
                var row = $(this).closest('tr');
                var id = row.data('id');
                var name = row.find('td:nth-child(1)').text();
                var key = row.find('td:nth-child(2)').text();
                var description = row.find('td:nth-child(3)').text();
                
                // Fill edit form
                $('#edit-criteria-id').val(id);
                $('#edit-criteria-name').val(name);
                $('#edit-criteria-description').val(description);
                
                // Show edit form
                $('#edit-criteria-form').show();
                
                // Scroll to edit form
                $('html, body').animate({
                    scrollTop: $('#edit-criteria-form').offset().top - 100
                }, 500);
            });
            
            // Handle save criteria button
            $('#save-criteria').on('click', function() {
                var id = $('#edit-criteria-id').val();
                var name = $('#edit-criteria-name').val();
                var description = $('#edit-criteria-description').val();
                
                if (!name) {
                    alert('<?php _e('Name is required.', 'cs-field-pulse'); ?>');
                    return;
                }
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'cs_field_pulse_update_criteria',
                        nonce: cs_field_pulse.nonce,
                        id: id,
                        display_name: name,
                        description: description
                    },
                    success: function(response) {
                        if (response.success) {
                            // Hide edit form
                            $('#edit-criteria-form').hide();
                            
                            // Update row in table
                            var row = $('tr[data-id="' + id + '"]');
                            row.find('td:nth-child(1)').text(name);
                            row.find('td:nth-child(3)').text(description);
                            
                            // Show success message
                            alert('<?php _e('Criteria updated successfully.', 'cs-field-pulse'); ?>');
                        } else {
                            alert(response.data || '<?php _e('Failed to update criteria.', 'cs-field-pulse'); ?>');
                        }
                    },
                    error: function() {
                        alert('<?php _e('An error occurred. Please try again.', 'cs-field-pulse'); ?>');
                    }
                });
            });
            
            // Handle cancel edit button
            $('#cancel-edit').on('click', function() {
                $('#edit-criteria-form').hide();
            });
            
            // Handle activate/deactivate criteria button
            $(document).on('click', '.activate-criteria, .deactivate-criteria', function() {
                var row = $(this).closest('tr');
                var id = row.data('id');
                var active = $(this).hasClass('deactivate-criteria');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'cs_field_pulse_toggle_criteria_active',
                        nonce: cs_field_pulse.nonce,
                        id: id,
                        active: !active
                    },
                    success: function(response) {
                        if (response.success) {
                            // Reload page to show updated status
                            location.reload();
                        } else {
                            alert(response.data || '<?php _e('Failed to update criteria status.', 'cs-field-pulse'); ?>');
                        }
                    },
                    error: function() {
                        alert('<?php _e('An error occurred. Please try again.', 'cs-field-pulse'); ?>');
                    }
                });
            });
        });
    </script>
</div>
