/**
 * CS Field Pulse Admin JavaScript
 */

jQuery(document).ready(function($) {
    
    // Create pages
    $('#csfp-create-pages').on('click', function() {
        if (!confirm('This will create all CS Field Pulse pages. Continue?')) {
            return;
        }
        
        const $button = $(this);
        const originalText = $button.text();
        $button.text('Creating...').prop('disabled', true);
        
        $.post(csfp_admin.ajax_url, {
            action: 'csfp_create_pages',
            nonce: csfp_admin.nonce
        }, function(response) {
            if (response.success) {
                $('#csfp-action-result').html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                setTimeout(function() {
                    location.reload();
                }, 2000);
            } else {
                $('#csfp-action-result').html('<div class="notice notice-error"><p>Error: ' + response.data + '</p></div>');
            }
            $button.text(originalText).prop('disabled', false);
        });
    });
    
    // Create demo data
    $('#csfp-create-demo').on('click', function() {
        if (!confirm('This will add 250 inspectors, 250 adjusters, and 250 visits with demo data. This may take a moment. Continue?')) {
            return;
        }
        
        const $button = $(this);
        const originalText = $button.text();
        $button.text('Adding...').prop('disabled', true);
        
        $.post(csfp_admin.ajax_url, {
            action: 'csfp_create_demo_data',
            nonce: csfp_admin.nonce
        }, function(response) {
            if (response.success) {
                $('#csfp-action-result').html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                setTimeout(function() {
                    location.reload();
                }, 2000);
            } else {
                $('#csfp-action-result').html('<div class="notice notice-error"><p>Error: ' + response.data + '</p></div>');
            }
            $button.text(originalText).prop('disabled', false);
        });
    });
    
    // Delete all data
    $('#csfp-delete-demo').on('click', function() {
        if (!confirm('WARNING: This will DELETE ALL data from CS Field Pulse tables. This cannot be undone. Are you sure?')) {
            return;
        }
        
        if (!confirm('Are you REALLY sure? All inspectors, adjusters, engagements, and media will be permanently deleted.')) {
            return;
        }
        
        const $button = $(this);
        const originalText = $button.text();
        $button.text('Deleting...').prop('disabled', true);
        
        $.post(csfp_admin.ajax_url, {
            action: 'csfp_delete_demo_data',
            nonce: csfp_admin.nonce
        }, function(response) {
            if (response.success) {
                $('#csfp-action-result').html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                setTimeout(function() {
                    location.reload();
                }, 2000);
            } else {
                $('#csfp-action-result').html('<div class="notice notice-error"><p>Error: ' + response.data + '</p></div>');
            }
            $button.text(originalText).prop('disabled', false);
        });
    });
    
    // Upgrade database
    $('#csfp-upgrade-db').on('click', function() {
        if (!confirm('This will upgrade the database schema. Continue?')) {
            return;
        }
        
        const $button = $(this);
        const originalText = $button.text();
        $button.text('Upgrading...').prop('disabled', true);
        
        $.post(csfp_admin.ajax_url, {
            action: 'csfp_upgrade_database',
            nonce: csfp_admin.nonce
        }, function(response) {
            if (response.success) {
                $('#csfp-action-result').html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                setTimeout(function() {
                    location.reload();
                }, 2000);
            } else {
                $('#csfp-action-result').html('<div class="notice notice-error"><p>Error: ' + response.data + '</p></div>');
            }
            $button.text(originalText).prop('disabled', false);
        });
    });
    
});