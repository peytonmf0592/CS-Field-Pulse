 /**
 * CS Field Pulse Inspector Manager JavaScript
 */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        CSFieldPulseInspectorManager.init();
    });

    /**
     * CS Field Pulse Inspector Manager Object
     */
    var CSFieldPulseInspectorManager = {

        /**
         * Initialize
         */
        init: function() {
            this.setupSearch();
            this.setupFilters();
            this.setupInspectorForm();
            this.setupClassificationToggle();
            this.setupInspectorDetail();
            this.setupInspectorCards();
        },

        /**
         * Setup search functionality
         */
        setupSearch: function() {
            var self = this;
            var searchTimer;
            
            $('#inspector-search').on('keyup', function() {
                var search = $(this).val();
                
                // Clear previous timer
                clearTimeout(searchTimer);
                
                // Set new timer to prevent too many requests
                searchTimer = setTimeout(function() {
                    self.searchInspectors(search);
                }, 500);
            });
        },

        /**
         * Search inspectors
         * 
         * @param {string} search Search term
         */
        searchInspectors: function(search) {
            var self = this;
            
            // Show loading indicator
            $('#inspectors-list').addClass('cs-loading');
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_inspectors',
                search: search
            }, function(response) {
                // Remove loading indicator
                $('#inspectors-list').removeClass('cs-loading');
                
                // Clear list
                $('#inspectors-list').empty();
                
                if (response.length === 0) {
                    $('#inspectors-list').html('<div class="cs-card cs-text-center">No inspectors found.</div>');
                    return;
                }
                
                // Add inspectors to list
                $.each(response, function(index, inspector) {
                    var card = self.createInspectorCard(inspector);
                    $('#inspectors-list').append(card);
                });
            }, function(error) {
                // Remove loading indicator
                $('#inspectors-list').removeClass('cs-loading');
                
                CSFieldPulse.showNotification('Error', 'Failed to search inspectors: ' + error, 'error');
            });
        },

        /**
         * Setup filter functionality
         */
        setupFilters: function() {
            var self = this;
            
            $('.cs-filter-option').on('click', function() {
                var filter = $(this).data('filter');
                
                // Update active filter
                $('.cs-filter-option').removeClass('active');
                $(this).addClass('active');
                
                // Apply filter
                self.filterInspectors(filter);
            });
        },

        /**
         * Filter inspectors
         * 
         * @param {string} filter Filter value
         */
        filterInspectors: function(filter) {
            if (filter === 'all') {
                $('.cs-inspector-card').show();
                return;
            }
            
            $('.cs-inspector-card').hide();
            $('.cs-inspector-card[data-classification="' + filter + '"]').show();
        },

        /**
         * Setup inspector form
         */
        setupInspectorForm: function() {
            var self = this;
            
            $('#inspector-form').on('submit', function(e) {
                e.preventDefault();
                
                var form = $(this);
                var action = form.find('input[name="action"]').val();
                var inspectorId = form.find('input[name="inspector_id"]').val();
                
                var data = {
                    action: 'cs_field_pulse_' + (action === 'create' ? 'create' : 'update') + '_inspector',
                    name: form.find('input[name="name"]').val(),
                    email: form.find('input[name="email"]').val(),
                    phone: form.find('input[name="phone"]').val(),
                    location: form.find('input[name="location"]').val(),
                    classification: form.find('select[name="classification"]').val(),
                    notes: form.find('textarea[name="notes"]').val()
                };
                
                if (action === 'update') {
                    data.inspector_id = inspectorId;
                }
                
                // Disable form
                form.find('button[type="submit"]').prop('disabled', true).addClass('cs-loading');
                
                CSFieldPulse.ajax(data, function(response) {
                    // Enable form
                    form.find('button[type="submit"]').prop('disabled', false).removeClass('cs-loading');
                    
                    CSFieldPulse.showNotification('Success', 'Inspector ' + (action === 'create' ? 'created' : 'updated') + ' successfully.', 'success');
                    
                    // Redirect to list
                    window.location.href = form.data('redirect');
                }, function(error) {
                    // Enable form
                    form.find('button[type="submit"]').prop('disabled', false).removeClass('cs-loading');
                    
                    CSFieldPulse.showNotification('Error', error, 'error');
                });
            });
        },

        /**
         * Setup classification toggle
         */
        setupClassificationToggle: function() {
            $(document).on('click', '.cs-classification-toggle', function() {
                var inspectorId = $(this).data('inspector-id');
                var currentClass = $(this).data('classification');
                var nextClass = '';
                
                // Cycle through classifications
                switch(currentClass) {
                    case 'promoter':
                        nextClass = 'passive';
                        break;
                    case 'passive':
                        nextClass = 'detractor';
                        break;
                    case 'detractor':
                        nextClass = 'promoter';
                        break;
                    default:
                        nextClass = 'passive';
                }
                
                CSFieldPulse.ajax({
                    action: 'cs_field_pulse_update_inspector',
                    inspector_id: inspectorId,
                    classification: nextClass
                }, function(response) {
                    // Update UI
                    var badge = CSFieldPulse.formatClassificationBadge(nextClass);
                    $('.cs-inspector-card[data-id="' + inspectorId + '"] .cs-badge').replaceWith(badge);
                    
                    // Update data attribute
                    $('.cs-inspector-card[data-id="' + inspectorId + '"]').attr('data-classification', nextClass);
                    $('.cs-classification-toggle[data-inspector-id="' + inspectorId + '"]').data('classification', nextClass);
                    
                    CSFieldPulse.showNotification('Success', 'Inspector classification updated to ' + nextClass + '.', 'success');
                }, function(error) {
                    CSFieldPulse.showNotification('Error', error, 'error');
                });
            });
        },

        /**
         * Setup inspector detail view
         */
        setupInspectorDetail: function() {
            var self = this;
            
            if ($('#inspector-detail').length === 0) {
                return;
            }
            
            var inspectorId = $('#inspector-detail').data('inspector-id');
            
            // Load inspector data
            self.loadInspectorDetail(inspectorId);
            
            // Load performance chart
            self.loadPerformanceChart(inspectorId);
            
            // Load visits
            self.loadInspectorVisits(inspectorId);
        },

        /**
         * Load inspector detail
         * 
         * @param {number} inspectorId Inspector ID
         */
        loadInspectorDetail: function(inspectorId) {
            var self = this;
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_inspector',
                inspector_id: inspectorId
            }, function(inspector) {
                // Fill details
                $('.cs-inspector-name-detail').text(inspector.name);
                $('.cs-inspector-email-detail').text(inspector.email || 'N/A');
                $('.cs-inspector-phone-detail').text(inspector.phone || 'N/A');
                $('.cs-inspector-location-detail').text(inspector.location || 'N/A');
                
                // Classification badge
                $('.cs-inspector-classification-detail').html(CSFieldPulse.formatClassificationBadge(inspector.classification));
                
                // Visit stats
                var visitStats = inspector.visit_stats || {
                    total_visits: 0,
                    promoter_visits: 0,
                    passive_visits: 0,
                    detractor_visits: 0,
                    last_visit_date: null
                };
                
                $('.cs-inspector-total-visits').text(visitStats.total_visits || 0);
                $('.cs-inspector-promoter-visits').text(visitStats.promoter_visits || 0);
                $('.cs-inspector-passive-visits').text(visitStats.passive_visits || 0);
                $('.cs-inspector-detractor-visits').text(visitStats.detractor_visits || 0);
                
                if (visitStats.last_visit_date) {
                    $('.cs-inspector-last-visit').text(CSFieldPulse.formatDate(visitStats.last_visit_date));
                } else {
                    $('.cs-inspector-last-visit').text('N/A');
                }
                
                // Notes
                if (inspector.notes) {
                    $('.cs-inspector-notes-detail').html(inspector.notes);
                } else {
                    $('.cs-inspector-notes-detail').html('<em>No notes available.</em>');
                }
                
                // Remove loading
                $('#inspector-detail').removeClass('cs-loading');
            }, function(error) {
                CSFieldPulse.showNotification('Error', 'Failed to load inspector details: ' + error, 'error');
            });
        },

        /**
         * Load performance chart
         * 
         * @param {number} inspectorId Inspector ID
         */
        loadPerformanceChart: function(inspectorId) {
            var self = this;
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_inspector_performance_trend',
                inspector_id: inspectorId,
                months: 6
            }, function(chartData) {
                // Create chart using Chart.js
                if (typeof Chart !== 'undefined' && $('#performance-chart').length > 0) {
                    var ctx = document.getElementById('performance-chart').getContext('2d');
                    
                    var chart = new Chart(ctx, {
                        type: 'line',
                        data: chartData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true,
                                        max: 10
                                    }
                                }]
                            }
                        }
                    });
                } else {
                    // Fallback for when Chart.js is not available
                    $('#performance-chart-container').html('<div class="cs-card cs-text-center">Chart library not available. Install Chart.js to view performance chart.</div>');
                }
            }, function(error) {
                $('#performance-chart-container').html('<div class="cs-card cs-text-center">Failed to load performance data.</div>');
            });
        },

        /**
         * Load inspector visits
         * 
         * @param {number} inspectorId Inspector ID
         */
        loadInspectorVisits: function(inspectorId) {
            var self = this;
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_inspector_visits',
                inspector_id: inspectorId
            }, function(visits) {
                var container = $('#inspector-visits');
                container.empty();
                
                if (visits.length === 0) {
                    container.html('<div class="cs-card cs-text-center">No visits recorded for this inspector.</div>');
                    return;
                }
                
                $.each(visits, function(index, visit) {
                    var card = self.createVisitCard(visit);
                    container.append(card);
                });
            }, function(error) {
                $('#inspector-visits').html('<div class="cs-card cs-text-center">Failed to load visits data.</div>');
            });
        },

        /**
         * Create inspector card HTML
         * 
         * @param {object} inspector Inspector data
         * @returns {string} HTML string
         */
        createInspectorCard: function(inspector) {
            var initials = inspector.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
            
            var html = '<div class="cs-card cs-inspector-card" data-id="' + inspector.id + '" data-classification="' + inspector.classification + '">' +
                       '<div class="cs-inspector-header">' +
                       '<div class="cs-inspector-avatar">' + initials + '</div>' +
                       '<div class="cs-inspector-info">' +
                       '<h3 class="cs-inspector-name">' + inspector.name + '</h3>' +
                       '<div>' + CSFieldPulse.formatClassificationBadge(inspector.classification) + '</div>' +
                       '</div>' +
                       '</div>';
            
            if (inspector.email || inspector.phone || inspector.location) {
                html += '<div class="cs-inspector-details">';
                if (inspector.email) {
                    html += '<div><strong>Email:</strong> ' + inspector.email + '</div>';
                }
                if (inspector.phone) {
                    html += '<div><strong>Phone:</strong> ' + inspector.phone + '</div>';
                }
                if (inspector.location) {
                    html += '<div><strong>Location:</strong> ' + inspector.location + '</div>';
                }
                html += '</div>';
            }
            
            html += '<div class="cs-card-footer cs-d-flex cs-justify-between cs-mt-10">' +
                   '<button class="cs-btn cs-btn-sm cs-classification-toggle" data-inspector-id="' + inspector.id + '" data-classification="' + inspector.classification + '">Change Classification</button>' +
                   '<a href="?page=cs-field-pulse-inspectors&action=edit&id=' + inspector.id + '" class="cs-btn cs-btn-sm cs-btn-secondary">Edit</a>' +
                   '</div>' +
                   '</div>';
            
            return html;
        },

        /**
         * Create visit card HTML
         * 
         * @param {object} visit Visit data
         * @returns {string} HTML string
         */
        createVisitCard: function(visit) {
            var html = '<div class="cs-card cs-visit-card ' + visit.classification + '">' +
                       '<div class="cs-d-flex cs-justify-between">' +
                       '<div>' +
                       '<div class="cs-visit-date">' + CSFieldPulse.formatDate(visit.visit_date) + '</div>' +
                       '<div class="cs-visit-location">' + visit.location_type + '</div>' +
                       '</div>' +
                       '<div>' + CSFieldPulse.formatClassificationBadge(visit.classification) + '</div>' +
                       '</div>';
            
            if (visit.notes) {
                html += '<div class="cs-mt-10">' + visit.notes.substring(0, 100) + (visit.notes.length > 100 ? '...' : '') + '</div>';
            }
            
            html += '<div class="cs-card-footer cs-text-right">' +
                   '<a href="?page=cs-field-pulse-visits&action=edit&id=' + visit.id + '" class="cs-btn cs-btn-sm cs-btn-secondary">View Details</a>' +
                   '</div>' +
                   '</div>';
            
            return html;
        },

        /**
         * Setup inspector cards
         */
        setupInspectorCards: function() {
            // Handle click on inspector card to navigate to detail view
            $(document).on('click', '.cs-inspector-card', function(e) {
                // Do not navigate if clicking a button or link
                if ($(e.target).is('button, a') || $(e.target).closest('button, a').length) {
                    return;
                }
                
                var inspectorId = $(this).data('id');
                window.location.href = '?page=cs-field-pulse-inspectors&action=edit&id=' + inspectorId;
            });
        }
    };

    // Make CSFieldPulseInspectorManager available globally
    window.CSFieldPulseInspectorManager = CSFieldPulseInspectorManager;

})(jQuery);
