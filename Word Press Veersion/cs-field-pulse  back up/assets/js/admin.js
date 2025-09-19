 /**
 * CS Field Pulse Admin JavaScript
 */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        CSFieldPulse.init();
    });

    /**
     * CS Field Pulse Admin Object
     */
    var CSFieldPulse = {

        /**
         * Initialize
         */
        init: function() {
            this.setupTabs();
            this.setupNotifications();
            this.setupConfirmActions();
            this.setupModals();
        },

        /**
         * Setup tabs functionality
         */
        setupTabs: function() {
            $('.cs-tab').on('click', function() {
                var target = $(this).data('target');
                
                // Update active tab
                $('.cs-tab').removeClass('active');
                $(this).addClass('active');
                
                // Show target content
                $('.cs-tab-content').removeClass('active');
                $('#' + target).addClass('active');
            });
        },

        /**
         * Setup auto-hiding notifications
         */
        setupNotifications: function() {
            // Automatically hide success notifications after 5 seconds
            setTimeout(function() {
                $('.cs-notification-success').fadeOut();
            }, 5000);
            
            // Add close button functionality to notifications
            $('.cs-notification').each(function() {
                $(this).append('<button class="cs-notification-close">&times;</button>');
            });
            
            $(document).on('click', '.cs-notification-close', function() {
                $(this).closest('.cs-notification').fadeOut(function() {
                    $(this).remove();
                });
            });
            
            // Check for URL parameters to show notifications
            var urlParams = new URLSearchParams(window.location.search);
            var message = urlParams.get('message');
            
            if (message) {
                switch(message) {
                    case 'created':
                        this.showNotification('Success', 'Item has been created successfully.', 'success');
                        break;
                    case 'updated':
                        this.showNotification('Success', 'Item has been updated successfully.', 'success');
                        break;
                    case 'deleted':
                        this.showNotification('Success', 'Item has been deleted successfully.', 'success');
                        break;
                    case 'error':
                        this.showNotification('Error', 'An error occurred. Please try again.', 'error');
                        break;
                }
                
                // Remove the message parameter from URL
                urlParams.delete('message');
                var newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
                window.history.replaceState({}, document.title, newUrl);
            }
        },

        /**
         * Setup confirmation for dangerous actions
         */
        setupConfirmActions: function() {
            $(document).on('click', '[data-confirm]', function(e) {
                var message = $(this).data('confirm') || 'Are you sure you want to perform this action?';
                
                if (!confirm(message)) {
                    e.preventDefault();
                    return false;
                }
            });
        },

        /**
         * Setup modal functionality
         */
        setupModals: function() {
            // Open modal
            $(document).on('click', '[data-modal]', function(e) {
                e.preventDefault();
                
                var modalId = $(this).data('modal');
                $('#' + modalId).addClass('active');
                $('body').addClass('cs-modal-open');
            });
            
            // Close modal
            $(document).on('click', '.cs-modal-close, .cs-modal-backdrop', function(e) {
                if ($(e.target).is('.cs-modal-content') || $(e.target).closest('.cs-modal-content').length) {
                    return;
                }
                
                $('.cs-modal').removeClass('active');
                $('body').removeClass('cs-modal-open');
            });
        },

        /**
         * Show notification
         * 
         * @param {string} title Notification title
         * @param {string} message Notification message
         * @param {string} type Notification type (success, warning, error)
         */
        showNotification: function(title, message, type) {
            type = type || 'success';
            
            var icon = '';
            switch(type) {
                case 'success':
                    icon = '<span class="dashicons dashicons-yes-alt"></span>';
                    break;
                case 'warning':
                    icon = '<span class="dashicons dashicons-warning"></span>';
                    break;
                case 'error':
                    icon = '<span class="dashicons dashicons-dismiss"></span>';
                    break;
            }
            
            var html = '<div class="cs-notification cs-notification-' + type + '">' +
                       '<div class="cs-notification-icon">' + icon + '</div>' +
                       '<div class="cs-notification-content">' +
                       '<div class="cs-notification-title">' + title + '</div>' +
                       '<div class="cs-notification-message">' + message + '</div>' +
                       '</div>' +
                       '<button class="cs-notification-close">&times;</button>' +
                       '</div>';
            
            // Remove existing notifications of the same type
            $('.cs-notification-' + type).remove();
            
            // Add new notification
            $('#cs-notifications').append(html);
            
            // Auto-hide success notifications
            if (type === 'success') {
                setTimeout(function() {
                    $('.cs-notification-' + type).fadeOut(function() {
                        $(this).remove();
                    });
                }, 5000);
            }
        },

        /**
         * Format date string
         * 
         * @param {string} dateString The date string to format
         * @returns {string} Formatted date string
         */
        formatDate: function(dateString) {
            var date = new Date(dateString);
            var day = date.getDate().toString().padStart(2, '0');
            var month = (date.getMonth() + 1).toString().padStart(2, '0');
            var year = date.getFullYear();
            
            return year + '-' + month + '-' + day;
        },

        /**
         * Format classification badge
         * 
         * @param {string} classification The classification value
         * @returns {string} HTML for the badge
         */
        formatClassificationBadge: function(classification) {
            return '<span class="cs-badge cs-badge-' + classification.toLowerCase() + '">' + 
                   classification.charAt(0).toUpperCase() + classification.slice(1) + 
                   '</span>';
        },

        /**
         * Make AJAX request
         * 
         * @param {object} data Request data
         * @param {function} successCallback Success callback
         * @param {function} errorCallback Error callback
         */
        ajax: function(data, successCallback, errorCallback) {
            // Add nonce
            data.nonce = cs_field_pulse.nonce;
            
            $.ajax({
                url: cs_field_pulse.ajax_url,
                type: 'POST',
                data: data,
                success: function(response) {
                    if (response.success) {
                        if (typeof successCallback === 'function') {
                            successCallback(response.data);
                        }
                    } else {
                        if (typeof errorCallback === 'function') {
                            errorCallback(response.data);
                        } else {
                            CSFieldPulse.showNotification('Error', response.data, 'error');
                        }
                    }
                },
                error: function(xhr, status, error) {
                    if (typeof errorCallback === 'function') {
                        errorCallback(error);
                    } else {
                        CSFieldPulse.showNotification('Error', 'An AJAX error occurred. Please try again.', 'error');
                    }
                }
            });
        }
    };

    // Make CSFieldPulse available globally
    window.CSFieldPulse = CSFieldPulse;

})(jQuery);
