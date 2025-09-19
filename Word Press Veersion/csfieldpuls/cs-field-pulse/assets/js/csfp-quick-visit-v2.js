/**
 * CS Field Pulse Quick Visit Modal V2
 * Updated with direct type selection and autocomplete
 */

(function($) {
    'use strict';
    
    // Quick Visit Modal HTML Template
    const quickVisitModalHTML = `
        <div id="quick-visit-modal" class="csfp-modal">
            <div class="csfp-modal-content" style="max-width: 700px;">
                <button class="csfp-modal-close" onclick="CSFPQuickVisit.close()">&times;</button>
                <h2>Record Visit</h2>
                
                <!-- Step 1: Select Type -->
                <div id="step-type" class="csfp-step">
                    <div class="csfp-form-group">
                        <label>Who are you visiting?</label>
                        <div class="csfp-type-selector">
                            <button type="button" class="csfp-type-btn" onclick="CSFPQuickVisit.selectType('Inspector')">
                                <span class="csfp-type-icon">🔍</span>
                                <span>Inspector</span>
                            </button>
                            <button type="button" class="csfp-type-btn" onclick="CSFPQuickVisit.selectType('Adjuster')">
                                <span class="csfp-type-icon">📋</span>
                                <span>Adjuster</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Step 2: Enter Name with Autocomplete -->
                <div id="step-name" class="csfp-step" style="display: none;">
                    <div class="csfp-form-group">
                        <label>Enter <span id="person-type-label">Person</span> Name</label>
                        <div class="csfp-autocomplete-wrapper">
                            <input type="text" id="person-name-input" class="csfp-input" placeholder="Start typing name..." autocomplete="off">
                            <div id="name-suggestions" class="csfp-suggestions-dropdown"></div>
                        </div>
                        <small class="csfp-help-text">Start typing to see suggestions from existing records</small>
                    </div>
                    
                    <!-- Selected Person Info -->
                    <div id="selected-person" class="csfp-glass" style="padding: 1rem; margin: 1rem 0; display: none;">
                        <h4 id="selected-name"></h4>
                        <p id="selected-details" style="margin: 0; opacity: 0.8;"></p>
                    </div>
                    
                    <!-- Location Selection (Required for all visits) -->
                    <div id="location-fields" style="display: none;">
                        <h4>Current Location</h4>
                        <p class="csfp-help-text" style="margin-bottom: 1rem;">Where is this visit taking place?</p>
                        
                        <!-- View By Toggle -->
                        <div class="csfp-form-group">
                            <div class="csfp-location-toggle" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                <label style="margin: 0;">Select by:</label>
                                <div class="csfp-toggle-buttons" style="display: inline-flex; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;">
                                    <button type="button" class="csfp-toggle-btn active" data-view="market" onclick="CSFPQuickVisit.toggleLocationView('market')" style="padding: 0.5rem 1rem; background: var(--csfp-green); color: var(--csfp-black); border: none; border-radius: 5px 0 0 5px; cursor: pointer; font-weight: 600;">Market</button>
                                    <button type="button" class="csfp-toggle-btn" data-view="rfm" onclick="CSFPQuickVisit.toggleLocationView('rfm')" style="padding: 0.5rem 1rem; background: transparent; color: var(--csfp-white); border: none; border-radius: 0 5px 5px 0; cursor: pointer;">RFM</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Market Selection -->
                        <div id="market-location-selector">
                            <div class="csfp-form-group">
                                <label>Market *</label>
                                <select id="visit-market" class="csfp-select" required>
                                    <option value="">Select Market</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- RFM Selection -->
                        <div id="rfm-location-selector" style="display: none;">
                            <div class="csfp-form-group">
                                <label>RFM *</label>
                                <select id="visit-rfm" class="csfp-select" onchange="CSFPQuickVisit.onRfmSelect()">
                                    <option value="">Select RFM</option>
                                </select>
                            </div>
                            <div class="csfp-form-group" id="rfm-market-group" style="display: none;">
                                <label>Market *</label>
                                <select id="visit-rfm-market" class="csfp-select">
                                    <option value="">Select Market</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- New Person Form (if not found) -->
                    <div id="new-person-fields" style="display: none;">
                        <h4>Creating New <span class="person-type-text">Person</span></h4>
                        
                        <!-- Inspector Fields -->
                        <div id="inspector-fields" style="display: none;">
                            <div class="csfp-form-group">
                                <label>CAT/Local</label>
                                <select id="new-cat-local" class="csfp-select">
                                    <option value="CAT">CAT</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                            
                            <div class="csfp-form-group">
                                <label>
                                    <input type="checkbox" id="new-is-mentor"> Is Mentor
                                </label>
                            </div>
                        </div>
                        
                        <!-- Adjuster Fields -->
                        <div id="adjuster-fields" style="display: none;">
                            <div class="csfp-form-group">
                                <label>Carrier</label>
                                <input type="text" id="new-carrier" class="csfp-input">
                            </div>
                        </div>
                    </div>
                    
                    <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.proceedToLocation()">Continue</button>
                    <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToType()">Back</button>
                </div>
                
                <!-- Step 3: Visit Form -->
                <div id="step-visit" class="csfp-step" style="display: none;">
                    <!-- Visit Tabs -->
                    <div class="csfp-visit-tabs">
                        <button class="csfp-tab active" onclick="CSFPQuickVisit.switchTab('text')">Text Notes</button>
                        <button class="csfp-tab" onclick="CSFPQuickVisit.switchTab('voice')">Voice Recording</button>
                        <button class="csfp-tab" onclick="CSFPQuickVisit.switchTab('upload')">Upload Audio</button>
                    </div>
                    
                    <!-- Text Tab -->
                    <div id="text-tab" class="csfp-tab-content active">
                        <div class="csfp-form-group">
                            <label>Sentiment</label>
                            <select id="visit-sentiment" class="csfp-select">
                                <option value="Promoter">Promoter</option>
                                <option value="Passive">Passive</option>
                                <option value="Detractor">Detractor</option>
                            </select>
                        </div>
                        
                        <div class="csfp-form-group">
                            <label>Notes</label>
                            <textarea id="visit-notes" class="csfp-textarea" rows="5" placeholder="Describe your visit..."></textarea>
                        </div>
                        
                        <div class="csfp-form-group">
                            <label>
                                <input type="checkbox" id="visit-follow-up"> Follow-up needed
                            </label>
                        </div>
                        
                        <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveTextVisit()">Save Visit</button>
                        <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToName()">Back</button>
                    </div>
                    
                    <!-- Voice and Upload tabs remain the same... -->
                </div>
            </div>
        </div>
    `;
    
    // Quick Visit Manager Object
    window.CSFPQuickVisit = {
        selectedType: null,
        selectedPersonId: null,
        selectedPersonName: null,
        selectedPersonDetails: null,
        selectedMarket: null,
        selectedRfm: null,
        isNewPerson: false,
        searchTimeout: null,
        onSaveCallback: null,
        
        // Market and RFM data
        marketsData: [
            { slug: 'carolinas', name: 'Carolinas', rfm: 'Riley' },
            { slug: 'central-great-lakes', name: 'Central Great Lakes', rfm: 'Swett' },
            { slug: 'florida', name: 'Florida', rfm: 'VanJoosten' },
            { slug: 'great-plains', name: 'Great Plains', rfm: 'Munda' },
            { slug: 'hawaiian-islands', name: 'Hawaiian Islands', rfm: null },
            { slug: 'lower-midwest', name: 'Lower Midwest', rfm: 'Morton' },
            { slug: 'mid-atlantic', name: 'Mid-Atlantic', rfm: 'Zatulak' },
            { slug: 'new-england', name: 'New England', rfm: 'Hillerich' },
            { slug: 'northeast', name: 'Northeast', rfm: 'Hillerich' },
            { slug: 'northern-great-lakes', name: 'Northern Great Lakes', rfm: 'Swett' },
            { slug: 'northwest', name: 'Northwest', rfm: 'Sanderson' },
            { slug: 'ohio-valley', name: 'Ohio Valley', rfm: 'Affolter' },
            { slug: 'rocky-mountains', name: 'Rocky Mountains', rfm: 'Munda' },
            { slug: 'south-central', name: 'South Central', rfm: 'Brasuel' },
            { slug: 'south-pacific', name: 'South Pacific', rfm: 'Morris' },
            { slug: 'southeast', name: 'Southeast', rfm: 'Humphries' },
            { slug: 'southwest', name: 'Southwest', rfm: 'Johnson' },
            { slug: 'tennessee-valley', name: 'Tennessee Valley', rfm: 'Snelling' },
            { slug: 'upper-midwest', name: 'Upper Midwest', rfm: 'Sanderson' }
        ],
        
        rfmToMarkets: {
            'Affolter': ['Ohio Valley'],
            'Brasuel': ['South Central'],
            'Hillerich': ['New England', 'Northeast'],
            'Humphries': ['Southeast'],
            'Johnson': ['Southwest'],
            'Morton': ['Lower Midwest'],
            'Morris': ['South Pacific'],
            'Munda': ['Great Plains', 'Rocky Mountains'],
            'Riley': ['Carolinas'],
            'Sanderson': ['Northwest', 'Upper Midwest'],
            'Snelling': ['Tennessee Valley'],
            'Swett': ['Central Great Lakes', 'Northern Great Lakes'],
            'VanJoosten': ['Florida'],
            'Zatulak': ['Mid-Atlantic']
        },
        
        rfmList: ['Affolter', 'Brasuel', 'Hillerich', 'Humphries', 'Johnson', 'Morton', 
                  'Morris', 'Munda', 'Riley', 'Sanderson', 'Snelling', 'Swett', 'VanJoosten', 'Zatulak'],
        
        // Initialize the modal
        init: function(onSaveCallback) {
            // Add modal to page if not exists
            if ($('#quick-visit-modal').length === 0) {
                $('body').append(quickVisitModalHTML);
            }
            
            // Set callback
            this.onSaveCallback = onSaveCallback;
            
            // Bind events
            this.bindEvents();
        },
        
        // Bind events
        bindEvents: function() {
            const self = this;
            
            // Autocomplete for name input
            $(document).on('input', '#person-name-input', function() {
                const query = $(this).val();
                clearTimeout(self.searchTimeout);
                
                if (query.length < 1) {
                    $('#name-suggestions').empty().hide();
                    self.checkIfNewPerson(query);
                    return;
                }
                
                self.searchTimeout = setTimeout(() => {
                    self.searchNames(query);
                }, 200);
                
                self.checkIfNewPerson(query);
            });
            
            // Click outside to close suggestions
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.csfp-autocomplete-wrapper').length) {
                    $('#name-suggestions').hide();
                }
            });
            
            // Focus on name input to show suggestions
            $(document).on('focus', '#person-name-input', function() {
                if ($('#name-suggestions').children().length > 0) {
                    $('#name-suggestions').show();
                }
            });
            
            // Quick visit button
            $('#quick-visit-btn').off('click').on('click', function() {
                self.open();
            });
        },
        
        // Open modal
        open: function() {
            $('#quick-visit-modal').addClass('active');
            this.reset();
            $('#step-type').show();
        },
        
        // Close modal
        close: function() {
            $('#quick-visit-modal').removeClass('active');
            this.reset();
        },
        
        // Select type (Inspector/Adjuster)
        selectType: function(type) {
            this.selectedType = type;
            $('#person-type-label').text(type);
            $('.person-type-text').text(type);
            
            // Show/hide relevant fields
            if (type === 'Inspector') {
                $('#inspector-fields').show();
                $('#adjuster-fields').hide();
            } else {
                $('#inspector-fields').hide();
                $('#adjuster-fields').show();
            }
            
            // Initialize location dropdowns
            this.initLocationDropdowns();
            
            // Move to name step
            $('#step-type').hide();
            $('#step-name').show();
            $('#person-name-input').focus();
        },
        
        // Initialize location dropdowns
        initLocationDropdowns: function() {
            // Populate market dropdown
            const $marketSelect = $('#visit-market');
            $marketSelect.empty().append('<option value="">Select Market</option>');
            this.marketsData.forEach(market => {
                $marketSelect.append(`<option value="${market.name}">${market.name}</option>`);
            });
            
            // Populate RFM dropdown
            const $rfmSelect = $('#visit-rfm');
            $rfmSelect.empty().append('<option value="">Select RFM</option>');
            this.rfmList.forEach(rfm => {
                $rfmSelect.append(`<option value="${rfm}">${rfm}</option>`);
            });
        },
        
        // Toggle location view (Market vs RFM)
        toggleLocationView: function(view) {
            // Update button states
            $('.csfp-toggle-btn').each(function() {
                if ($(this).data('view') === view) {
                    $(this).css({
                        'background': 'var(--csfp-green)',
                        'color': 'var(--csfp-black)',
                        'font-weight': '600'
                    }).addClass('active');
                } else {
                    $(this).css({
                        'background': 'transparent',
                        'color': 'var(--csfp-white)',
                        'font-weight': 'normal'
                    }).removeClass('active');
                }
            });
            
            if (view === 'market') {
                $('#market-location-selector').show();
                $('#rfm-location-selector').hide();
            } else {
                $('#market-location-selector').hide();
                $('#rfm-location-selector').show();
            }
        },
        
        // On RFM selection
        onRfmSelect: function() {
            const selectedRfm = $('#visit-rfm').val();
            if (selectedRfm && this.rfmToMarkets[selectedRfm]) {
                const $marketSelect = $('#visit-rfm-market');
                $marketSelect.empty().append('<option value="">Select Market</option>');
                
                this.rfmToMarkets[selectedRfm].forEach(marketName => {
                    $marketSelect.append(`<option value="${marketName}">${marketName}</option>`);
                });
                
                $('#rfm-market-group').show();
            } else {
                $('#rfm-market-group').hide();
            }
        },
        
        // Search names with autocomplete
        searchNames: function(query) {
            const self = this;
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_autocomplete_persons',
                nonce: csfp_ajax.nonce,
                query: query,
                type: this.selectedType
            }, function(response) {
                if (response.success && response.data.length > 0) {
                    let html = '';
                    response.data.forEach(person => {
                        const details = `${person.city || 'Unknown City'}, ${person.market || 'Unknown Market'}`;
                        html += `
                            <div class="csfp-suggestion-item" onclick="CSFPQuickVisit.selectPerson(${person.id}, '${person.name.replace(/'/g, "\\'")}', '${details.replace(/'/g, "\\'")}')">
                                <div class="csfp-suggestion-name">${person.name}</div>
                                <div class="csfp-suggestion-details">${details}</div>
                            </div>
                        `;
                    });
                    $('#name-suggestions').html(html).show();
                } else {
                    $('#name-suggestions').empty().hide();
                }
            });
        },
        
        // Check if this is a new person
        checkIfNewPerson: function(name) {
            if (name.length > 0) {
                // Show new person fields if no selection made
                if (!this.selectedPersonId) {
                    this.isNewPerson = true;
                    $('#new-person-fields').show();
                    $('#location-fields').show(); // Also show location fields for new person
                }
            } else {
                this.isNewPerson = false;
                $('#new-person-fields').hide();
                $('#location-fields').hide();
            }
        },
        
        // Select existing person from autocomplete
        selectPerson: function(id, name, details) {
            this.selectedPersonId = id;
            this.selectedPersonName = name;
            this.selectedPersonDetails = details;
            this.isNewPerson = false;
            
            $('#person-name-input').val(name);
            $('#selected-name').text(name);
            $('#selected-details').text(details);
            $('#selected-person').show();
            $('#new-person-fields').hide();
            $('#name-suggestions').hide();
            $('#location-fields').show(); // Show location fields after person selection
        },
        
        // Proceed to location selection
        proceedToLocation: function() {
            const nameInput = $('#person-name-input').val();
            
            if (!nameInput) {
                alert('Please enter a name');
                return;
            }
            
            // Check if location is selected
            let locationSelected = false;
            let selectedMarket = '';
            
            // Check which view is active
            if ($('.csfp-toggle-btn.active').data('view') === 'market') {
                selectedMarket = $('#visit-market').val();
                if (selectedMarket) {
                    locationSelected = true;
                    this.selectedMarket = selectedMarket;
                    this.selectedRfm = null;
                }
            } else {
                // RFM view
                const selectedRfm = $('#visit-rfm').val();
                selectedMarket = $('#visit-rfm-market').val();
                if (selectedRfm && selectedMarket) {
                    locationSelected = true;
                    this.selectedRfm = selectedRfm;
                    this.selectedMarket = selectedMarket;
                }
            }
            
            if (!locationSelected) {
                alert('Please select a location (Market or RFM + Market)');
                return;
            }
            
            // If new person, save the details with location
            if (this.isNewPerson || !this.selectedPersonId) {
                this.selectedPersonName = nameInput;
                this.isNewPerson = true;
                this.createNewPerson();
            } else {
                // Existing person selected with location, move to visit form
                $('#step-name').hide();
                $('#step-visit').show();
            }
        },
        
        // Create new person
        createNewPerson: function() {
            const self = this;
            const data = {
                action: this.selectedType === 'Inspector' ? 'csfp_save_inspector' : 'csfp_save_adjuster',
                nonce: csfp_ajax.nonce,
                name: this.selectedPersonName,
                city: this.selectedMarket || '', // Use selected market as city for now
                market: this.selectedMarket || '',
                sentiment: 'Passive'
            };
            
            if (this.selectedType === 'Inspector') {
                data.cat_local = $('#new-cat-local').val() || 'Local';
                data.is_mentor = $('#new-is-mentor').is(':checked') ? 1 : 0;
                data.rfm = this.selectedRfm || '';
            } else {
                data.carrier = $('#new-carrier').val() || '';
            }
            
            $.post(csfp_ajax.ajax_url, data, function(response) {
                if (response.success) {
                    self.selectedPersonId = response.data.id || 'new';
                    $('#step-name').hide();
                    $('#step-visit').show();
                } else {
                    alert('Error creating person: ' + response.data);
                }
            });
        },
        
        // Navigation functions
        backToType: function() {
            $('#step-name').hide();
            $('#step-type').show();
            this.selectedPersonId = null;
            this.selectedPersonName = null;
            $('#person-name-input').val('');
            $('#selected-person').hide();
            $('#new-person-fields').hide();
        },
        
        backToName: function() {
            $('#step-visit').hide();
            $('#step-name').show();
        },
        
        // Switch tabs
        switchTab: function(tab) {
            $('.csfp-tab').removeClass('active');
            $('.csfp-tab-content').removeClass('active');
            
            $(`button:contains('${tab.charAt(0).toUpperCase() + tab.slice(1)}')`).addClass('active');
            $(`#${tab}-tab`).addClass('active');
        },
        
        // Save text visit
        saveTextVisit: function() {
            const self = this;
            if (!this.selectedPersonId) {
                alert('Please select or create a person first');
                return;
            }
            
            const data = {
                action: 'csfp_add_engagement',
                nonce: csfp_ajax.nonce,
                inspector_id: this.selectedPersonId,
                sentiment: $('#visit-sentiment').val(),
                notes: $('#visit-notes').val(),
                follow_up_needed: $('#visit-follow-up').is(':checked') ? 1 : 0,
                market: this.selectedMarket || '',
                rfm: this.selectedRfm || ''
            };
            
            $.post(csfp_ajax.ajax_url, data, function(response) {
                if (response.success) {
                    self.close();
                    if (self.onSaveCallback) self.onSaveCallback();
                    alert('Visit recorded successfully!');
                } else {
                    alert('Error saving visit: ' + response.data);
                }
            });
        },
        
        // Reset form
        reset: function() {
            // Reset all steps
            $('.csfp-step').hide();
            
            // Reset values
            this.selectedType = null;
            this.selectedPersonId = null;
            this.selectedPersonName = null;
            this.selectedPersonDetails = null;
            this.selectedMarket = null;
            this.selectedRfm = null;
            this.isNewPerson = false;
            
            // Clear inputs
            $('#person-name-input').val('');
            $('#new-carrier').val('');
            $('#visit-notes').val('');
            $('#visit-follow-up').prop('checked', false);
            $('#visit-market').val('');
            $('#visit-rfm').val('');
            $('#visit-rfm-market').val('');
            
            // Hide elements
            $('#selected-person').hide();
            $('#new-person-fields').hide();
            $('#location-fields').hide();
            $('#rfm-market-group').hide();
            $('#name-suggestions').empty().hide();
            
            // Reset toggles
            this.toggleLocationView('market');
            
            // Reset tabs
            this.switchTab('text');
        }
    };
    
})(jQuery);