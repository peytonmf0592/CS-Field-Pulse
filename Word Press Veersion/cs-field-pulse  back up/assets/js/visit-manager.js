 /**
 * CS Field Pulse Visit Manager JavaScript
 */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        CSFieldPulseVisitManager.init();
    });

    /**
     * CS Field Pulse Visit Manager Object
     */
    var CSFieldPulseVisitManager = {

        /**
         * Initialize
         */
        init: function() {
            this.setupSearch();
            this.setupFilters();
            this.setupVisitForm();
            this.setupDatePicker();
            this.setupEvaluationSliders();
            this.setupVisitDetail();
        },

        /**
         * Setup search functionality
         */
        setupSearch: function() {
            var self = this;
            var searchTimer;
            
            $('#visit-search').on('keyup', function() {
                var search = $(this).val();
                
                // Clear previous timer
                clearTimeout(searchTimer);
                
                // Set new timer to prevent too many requests
                searchTimer = setTimeout(function() {
                    self.searchVisits(search);
                }, 500);
            });
        },

        /**
         * Search visits
         * 
         * @param {string} search Search term
         */
        searchVisits: function(search) {
            var self = this;
            
            // Show loading indicator
            $('#visits-list').addClass('cs-loading');
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_visits',
                search: search
            }, function(response) {
                // Remove loading indicator
                $('#visits-list').removeClass('cs-loading');
                
                // Clear list
                $('#visits-list').empty();
                
                if (response.length === 0) {
                    $('#visits-list').html('<div class="cs-card cs-text-center">No visits found.</div>');
                    return;
                }
                
                // Add visits to list
                $.each(response, function(index, visit) {
                    var card = self.createVisitCard(visit);
                    $('#visits-list').append(card);
                });
            }, function(error) {
                // Remove loading indicator
                $('#visits-list').removeClass('cs-loading');
                
                CSFieldPulse.showNotification('Error', 'Failed to search visits: ' + error, 'error');
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
                self.filterVisits(filter);
            });
        },

        /**
         * Filter visits
         * 
         * @param {string} filter Filter value
         */
        filterVisits: function(filter) {
            if (filter === 'all') {
                $('.cs-visit-card').show();
                return;
            }
            
            $('.cs-visit-card').hide();
            $('.cs-visit-card.' + filter).show();
        },

        /**
         * Setup visit form
         */
        setupVisitForm: function() {
            var self = this;
            
            $('#visit-form').on('submit', function(e) {
                e.preventDefault();
                
                var form = $(this);
                var action = form.find('input[name="action"]').val();
                var visitId = form.find('input[name="visit_id"]').val();
                
                // Basic data
                var data = {
                    action: 'cs_field_pulse_' + (action === 'create' ? 'create' : 'update') + '_visit',
                    inspector_id: form.find('select[name="inspector_id"]').val(),
                    visit_date: form.find('input[name="visit_date"]').val(),
                    location_type: form.find('select[name="location_type"]').val(),
                    classification: form.find('select[name="classification"]').val(),
                    notes: form.find('textarea[name="notes"]').val()
                };
                
                // Add visit ID if updating
                if (action === 'update') {
                    data.visit_id = visitId;
                }
                
                // Collect evaluation data
                var evaluations = {};
                $('.cs-evaluation-criteria').each(function() {
                    var criteriaKey = $(this).data('criteria-key');
                    var score = $(this).find('.cs-evaluation-slider').val();
                    var notes = $(this).find('.cs-evaluation-notes').val();
                    
                    evaluations[criteriaKey] = {
                        score: score,
                        notes: notes
                    };
                });
                
                data.evaluations = evaluations;
                
                // Disable form
                form.find('button[type="submit"]').prop('disabled', true).addClass('cs-loading');
                
                CSFieldPulse.ajax(data, function(response) {
                    // Enable form
                    form.find('button[type="submit"]').prop('disabled', false).removeClass('cs-loading');
                    
                    CSFieldPulse.showNotification('Success', 'Visit ' + (action === 'create' ? 'created' : 'updated') + ' successfully.', 'success');
                    
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
         * Setup date picker
         */
        setupDatePicker: function() {
            // If jQuery UI datepicker is available
            if ($.datepicker) {
                $('.cs-datepicker').datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeMonth: true,
                    changeYear: true,
                    maxDate: '+0d' // Limit to today and past dates
                });
            }
        },

        /**
         * Setup evaluation sliders
         */
        setupEvaluationSliders: function() {
            // Update value display when slider changes
            $(document).on('input change', '.cs-evaluation-slider', function() {
                var value = $(this).val();
                $(this).siblings('.cs-evaluation-value').text(value);
                
                // Update color based on value
                self.updateSliderColor($(this), value);
            });
            
            // Initial setup of sliders
            $('.cs-evaluation-slider').each(function() {
                var value = $(this).val();
                self.updateSliderColor($(this), value);
            });
        },

        /**
         * Update slider color based on value
         * 
         * @param {object} slider jQuery slider element
         * @param {number} value Slider value
         */
        updateSliderColor: function(slider, value) {
            var max = slider.attr('max') || 10;
            var percentage = (value / max) * 100;
            
            // Determine color based on percentage
            var color;
            if (percentage >= 80) {
                color = 'var(--cs-success)';
            } else if (percentage >= 60) {
                color = 'var(--cs-warning)';
            } else {
                color = 'var(--cs-danger)';
            }
            
            slider.siblings('.cs-evaluation-value').css('background-color', color);
        },

        /**
         * Setup visit detail view
         */
        setupVisitDetail: function() {
            var self = this;
            
            if ($('#visit-detail').length === 0) {
                return;
            }
            
            var visitId = $('#visit-detail').data('visit-id');
            
            // Load visit data
            self.loadVisitDetail(visitId);
            
            // Load evaluations
            self.loadVisitEvaluations(visitId);
        },

        /**
         * Load visit detail
         * 
         * @param {number} visitId Visit ID
         */
        loadVisitDetail: function(visitId) {
            var self = this;
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_visit',
                visit_id: visitId
            }, function(visit) {
                // Fill details
                $('.cs-visit-date-detail').text(CSFieldPulse.formatDate(visit.visit_date));
                $('.cs-visit-location-detail').text(visit.location_type);
                
                // Inspector details
                if (visit.inspector) {
                    $('.cs-inspector-name-detail').text(visit.inspector.name);
                    $('.cs-inspector-classification-detail').html(CSFieldPulse.formatClassificationBadge(visit.inspector.classification));
                }
                
                // Classification badge
                $('.cs-visit-classification-detail').html(CSFieldPulse.formatClassificationBadge(visit.classification));
                
                // Notes
                if (visit.notes) {
                    $('.cs-visit-notes-detail').html(visit.notes);
                } else {
                    $('.cs-visit-notes-detail').html('<em>No notes available.</em>');
                }
                
                // Remove loading
                $('#visit-detail').removeClass('cs-loading');
            }, function(error) {
                CSFieldPulse.showNotification('Error', 'Failed to load visit details: ' + error, 'error');
            });
        },

        /**
         * Load visit evaluations
         * 
         * @param {number} visitId Visit ID
         */
        loadVisitEvaluations: function(visitId) {
            var self = this;
            
            CSFieldPulse.ajax({
                action: 'cs_field_pulse_get_visit_evaluations',
                visit_id: visitId
            }, function(evaluations) {
                var container = $('#visit-evaluations');
                container.empty();
                
                if (evaluations.length === 0) {
                    container.html('<div class="cs-card cs-text-center">No evaluation data available for this visit.</div>');
                    return;
                }
                
                $.each(evaluations, function(index, evaluation) {
                    var card = self.createEvaluationCard(evaluation);
                    container.append(card);
                });
            }, function(error) {
                $('#visit-evaluations').html('<div class="cs-card cs-text-center">Failed to load evaluation data.</div>');
            });
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
                       '<h3 class="cs-inspector-name">' + visit.inspector_name + '</h3>' +
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
         * Create evaluation card HTML
         * 
         * @param {object} evaluation Evaluation data
         * @returns {string} HTML string
         */
        createEvaluationCard: function(evaluation) {
            var scoreClass = '';
            
            if (evaluation.score >= 8) {
                scoreClass = 'cs-text-success';
            } else if (evaluation.score >= 6) {
                scoreClass = 'cs-text-warning';
            } else {
                scoreClass = 'cs-text-danger';
            }
            
            var html = '<div class="cs-card">' +
                       '<div class="cs-d-flex cs-justify-between">' +
                       '<h3 class="cs-card-title">' + evaluation.display_name + '</h3>' +
                       '<div class="cs-evaluation-score ' + scoreClass + '">' + evaluation.score + '/10</div>' +
                       '</div>';
            
            if (evaluation.description) {
                html += '<div class="cs-text-secondary cs-mb-10">' + evaluation.description + '</div>';
            }
            
            if (evaluation.notes) {
                html += '<div class="cs-mt-10"><strong>Notes:</strong> ' + evaluation.notes + '</div>';
            }
            
            html += '</div>';
            
            return html;
        }
    };

    // Make CSFieldPulseVisitManager available globally
    window.CSFieldPulseVisitManager = CSFieldPulseVisitManager;

})(jQuery);
