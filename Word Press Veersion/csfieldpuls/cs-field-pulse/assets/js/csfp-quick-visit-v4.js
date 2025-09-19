/**
 * CS Field Pulse Quick Visit Modal V4
 * Multi-step flow: Type -> Name -> Location -> Form Fields
 */

(function($) {
    'use strict';
    
    // Canonical carriers list (matches Excel data validation)
    const carriers = [
        'Allstate', 'American Family', 'Auto-Owners', 'Chubb', 'CNA', 
        'Farmers', 'GEICO', 'Hartford', 'Liberty Mutual', 'Nationwide',
        'Progressive', 'State Farm', 'Travelers', 'USAA', 'Zurich'
    ];
    
    // Field definitions for Inspector form (exact order for export)
    const inspectorFields = [
        { key: 'cs', label: 'CS', type: 'dropdown', options: ['Gino', 'Kyle', 'Peyton'], required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'sentiment', label: 'Sentiment', type: 'dropdown', options: ['Promoter', 'Passive', 'Detractor'], required: false },
        { key: 'mojo', label: 'Mojo', type: 'dropdown', options: ['Yes', 'No'], required: false },
        { key: 'adjuster_interaction', label: 'Adjuster Interaction', type: 'dropdown', options: ['Great', 'Needs Work', 'Poor'], required: false },
        { key: 'appearance', label: 'Appearance', type: 'dropdown', options: ['Good', 'Fair', 'Poor'], required: false },
        { key: 'branding_compliance', label: 'Branding/Equipment Compliance', type: 'dropdown', options: ['Yes', 'Improper Uniform', 'No Ladder Rack', 'Missing Ladder', 'No Steep Assist', 'Truck Not Branded'], required: false },
        { key: 'punctual', label: 'Punctual', type: 'dropdown', options: ['Yes', 'No'], required: false },
        { key: 'mentor_quality', label: 'Mentor Quality', type: 'dropdown', options: ['Good', 'Fair', 'Bad'], required: false },
        { key: 'takes_scope_sheet', label: 'Takes Scope Sheet On Roof', type: 'dropdown', options: ['Yes', 'No'], required: false },
        { key: 'scope_sheet_quality', label: 'Scope Sheet Quality', type: 'dropdown', options: ['Very Good', 'Fair', 'Bad'], required: false },
        { key: 'communication', label: 'Communication', type: 'dropdown', options: ['Very Good', 'Fair', 'Bad'], required: false },
        { key: 'issues', label: 'Issues', type: 'dropdown', options: ['Late', 'Not Prepping Claims', 'Attitude', 'Damage Calls', 'Not Confirming Claims', 'Roof Comfortability', 'Slow'], required: false },
        { key: 'claim_number', label: 'Claim Number', type: 'text', required: false },
        { key: 'notes', label: 'Notes', type: 'textarea', required: false }
    ];
    
    // Field definitions for Adjuster form (exact order for export)
    const adjusterFields = [
        { key: 'cs', label: 'CS', type: 'dropdown', options: ['Gino', 'Kyle', 'Peyton'], required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'carrier', label: 'Carrier', type: 'searchable-dropdown', options: 'dynamic', required: true },
        { key: 'adjuster', label: 'Adjuster', type: 'searchable-dropdown', options: 'dynamic', required: true },
        { key: 'portal_availability', label: 'Portal Availability', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'portal_requests', label: 'Portal Requests', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'satisfied_inspectors', label: 'Satisfied with Inspectors', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'supported', label: 'Supported', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'trust_seek_now', label: 'Trust in Seek Now', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'rfm_communication', label: 'RFM Communication', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'satisfied_reports', label: 'Satisfied with reports', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'regional_shoutout', label: 'Regional Shoutout', type: 'dropdown', options: [
            'Affolter', 'Brasuel', 'Hillerich', 'Humphries', 'Johnson', 'Morton', 
            'Morris', 'Munda', 'Riley', 'Sanderson', 'Snelling', 'Swett', 
            'VanJoosten', 'Zatulak'
        ], required: false },
        { key: 'inspectors_punctual', label: 'Inspectors Punctual', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'confirmation_texts', label: 'Confirmation Texts', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: false },
        { key: 'scope_sheet_satisfaction', label: 'Scope Sheet Satisfaction', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: false },
        { key: 'solo_service_satisfaction', label: 'Solo Service Satisfaction', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: false },
        { key: 'inspector_feedback', label: 'Inspector Feedback', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: false },
        { key: 'office_feedback', label: 'Office Feeback', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: false },
        { key: 'claim_number', label: 'Claim Number', type: 'text', required: false },
        { key: 'intel', label: 'Intel', type: 'textarea', required: false },
        { key: 'notes', label: 'Notes', type: 'textarea', required: false }
    ];
    
    // Quick Visit Modal HTML Template
    const quickVisitModalHTML = `
        <div id="quick-visit-modal" class="csfp-modal">
            <div class="csfp-modal-content" style="max-width: 700px;">
                <button class="csfp-modal-close" onclick="CSFPQuickVisit.close()">&times;</button>
                <h2>Record Visit</h2>
                
                <!-- Progress indicator -->
                <div class="csfp-progress-bar" style="margin-bottom: 2rem;">
                    <div class="csfp-progress-step active" id="progress-type">Type</div>
                    <div class="csfp-progress-step" id="progress-name">Name</div>
                    <div class="csfp-progress-step" id="progress-location">Location</div>
                    <div class="csfp-progress-step" id="progress-details">Details</div>
                </div>
                
                <!-- Step 1: Select Type -->
                <div id="step-type" class="csfp-step active">
                    <h3>Who are you visiting?</h3>
                    <div class="csfp-type-selector">
                        <button type="button" class="csfp-type-btn" data-type="inspector" onclick="CSFPQuickVisit.selectType('inspector')">
                            <span class="csfp-type-icon">🔍</span>
                            <span>Inspector</span>
                        </button>
                        <button type="button" class="csfp-type-btn" data-type="adjuster" onclick="CSFPQuickVisit.selectType('adjuster')">
                            <span class="csfp-type-icon">📋</span>
                            <span>Adjuster</span>
                        </button>
                    </div>
                    
                    <!-- CAT/Local selector (shown only for Inspector) -->
                    <div id="cat-local-selector" style="display: none; margin-top: 2rem;">
                        <div class="csfp-form-group">
                            <label>Inspector Type *</label>
                            <div class="csfp-cat-local-toggle">
                                <button type="button" class="csfp-cat-local-btn active" data-value="CAT" onclick="CSFPQuickVisit.selectCatLocal('CAT')">CAT</button>
                                <button type="button" class="csfp-cat-local-btn" data-value="Local" onclick="CSFPQuickVisit.selectCatLocal('Local')">Local</button>
                            </div>
                        </div>
                        <div class="csfp-step-actions">
                            <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.proceedFromType()">Continue</button>
                        </div>
                    </div>
                </div>
                
                <!-- Step 2: Enter Name -->
                <div id="step-name" class="csfp-step">
                    <h3>Enter <span id="person-type-label">Person</span> Name</h3>
                    <div class="csfp-form-group">
                        <label>Name *</label>
                        <div class="csfp-autocomplete-wrapper">
                            <input type="text" id="person-name-input" class="csfp-input" placeholder="Start typing name..." autocomplete="off">
                            <div id="name-suggestions" class="csfp-suggestions-dropdown"></div>
                        </div>
                    </div>
                    <div class="csfp-step-actions">
                        <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToType()">Back</button>
                        <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.proceedToLocation()">Continue</button>
                    </div>
                </div>
                
                <!-- Step 3: Select Location -->
                <div id="step-location" class="csfp-step">
                    <h3>Current Location</h3>
                    <p class="csfp-help-text">Where is this visit taking place?</p>
                    
                    <!-- View By Toggle -->
                    <div class="csfp-form-group">
                        <div class="csfp-location-toggle" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <label style="margin: 0;">Select by:</label>
                            <div class="csfp-toggle-buttons" style="display: inline-flex; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;">
                                <button type="button" class="csfp-toggle-btn active" data-view="rfm" onclick="CSFPQuickVisit.toggleLocationView('rfm')">RFM</button>
                                <button type="button" class="csfp-toggle-btn" data-view="market" onclick="CSFPQuickVisit.toggleLocationView('market')">Market</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- RFM Selection (shown by default) -->
                    <div id="rfm-location-selector">
                        <div class="csfp-form-group">
                            <label>RFM *</label>
                            <select id="visit-rfm" class="csfp-select">
                                <option value="">Select RFM</option>
                            </select>
                        </div>
                        <div class="csfp-form-group" id="rfm-market-group" style="display: none;">
                            <label>Market *</label>
                            <select id="visit-rfm-market" class="csfp-select">
                                <option value="">Select Market</option>
                            </select>
                            <p class="csfp-help-text" id="rfm-markets-hint"></p>
                        </div>
                    </div>
                    
                    <!-- Market Selection -->
                    <div id="market-location-selector" style="display: none;">
                        <div class="csfp-form-group">
                            <label>Market *</label>
                            <select id="visit-market" class="csfp-select" required>
                                <option value="">Select Market</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="csfp-step-actions">
                        <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToName()">Back</button>
                        <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.proceedToDetails()">Continue</button>
                    </div>
                </div>
                
                <!-- Step 4: Visit Details -->
                <div id="step-details" class="csfp-step">
                    <h3>Visit Details</h3>
                    
                    <!-- Visit Tabs -->
                    <div class="csfp-visit-tabs">
                        <button class="csfp-tab active" onclick="CSFPQuickVisit.switchTab('text')">Text Notes</button>
                        <button class="csfp-tab" onclick="CSFPQuickVisit.switchTab('voice')">Voice Recording</button>
                        <button class="csfp-tab" onclick="CSFPQuickVisit.switchTab('upload')">Upload Audio</button>
                    </div>
                    
                    <!-- Text Tab -->
                    <div id="text-tab" class="csfp-tab-content active">
                        <form id="quick-visit-form">
                            <div id="visit-form-fields"></div>
                            
                            <!-- Follow-up needed at the END -->
                            <div class="csfp-form-group" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--csfp-glass-border);">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="visit-follow-up" style="width: 20px; height: 20px;">
                                    <span style="font-size: 1.1rem;">Follow-up needed?</span>
                                </label>
                            </div>
                            
                            <div class="csfp-step-actions">
                                <button type="button" class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToLocation()">Back</button>
                                <button type="button" class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveVisit()">Save Visit</button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Voice Tab -->
                    <div id="voice-tab" class="csfp-tab-content">
                        <div class="csfp-recorder-container">
                            <div id="voice-recorder-status">Ready to record</div>
                            <button class="csfp-btn csfp-btn-record" id="start-recording-btn" onclick="CSFPQuickVisit.startRecording()">Start Recording</button>
                            <button class="csfp-btn csfp-btn-stop" id="stop-recording-btn" style="display: none;" onclick="CSFPQuickVisit.stopRecording()">Stop Recording</button>
                            <audio id="audio-playback" controls style="display: none; width: 100%; margin: 1rem 0;"></audio>
                            
                            <!-- Transcription display -->
                            <div id="transcription-result" style="display: none; margin: 1rem 0;">
                                <h4>Transcription:</h4>
                                <div id="transcription-text" class="csfp-glass" style="padding: 1rem; margin: 0.5rem 0; max-height: 150px; overflow-y: auto;"></div>
                            </div>
                            
                            <!-- Auto-filled form preview -->
                            <div id="voice-form-preview" style="display: none; margin: 1rem 0;">
                                <h4>Auto-filled Fields:</h4>
                                <div id="voice-form-fields"></div>
                                <p class="csfp-help-text">Review and modify the auto-filled fields above before saving.</p>
                            </div>
                            
                            <!-- Follow-up needed at the END -->
                            <div class="csfp-form-group" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--csfp-glass-border);">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="voice-follow-up" style="width: 20px; height: 20px;">
                                    <span style="font-size: 1.1rem;">Follow-up needed?</span>
                                </label>
                            </div>
                            
                            <div class="csfp-step-actions">
                                <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToLocation()">Back</button>
                                <button class="csfp-btn csfp-btn-primary" id="save-voice-btn" style="display: none;" onclick="CSFPQuickVisit.confirmVoiceSave()">Save Voice Visit</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upload Tab -->
                    <div id="upload-tab" class="csfp-tab-content">
                        <div class="csfp-form-group">
                            <label>Select Audio File</label>
                            <input type="file" id="audio-file" accept="audio/*" class="csfp-input">
                        </div>
                        
                        <!-- Upload status -->
                        <div id="upload-status" style="display: none; margin: 1rem 0;">
                            <div class="csfp-glass" style="padding: 1rem;">
                                <p id="upload-status-text">Processing audio file...</p>
                                <div class="csfp-progress-indicator" style="display: none;">
                                    <div class="csfp-spinner"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Transcription result -->
                        <div id="upload-transcription" style="display: none; margin: 1rem 0;">
                            <h4>Transcription:</h4>
                            <div id="upload-transcription-text" class="csfp-glass" style="padding: 1rem; max-height: 150px; overflow-y: auto;"></div>
                        </div>
                        
                        <!-- Follow-up needed at the END -->
                        <div class="csfp-form-group" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--csfp-glass-border);">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="upload-follow-up" style="width: 20px; height: 20px;">
                                <span style="font-size: 1.1rem;">Follow-up needed?</span>
                            </label>
                        </div>
                        
                        <div class="csfp-step-actions">
                            <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.backToLocation()">Back</button>
                            <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.processUploadAudio()">Process & Save Audio</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Markets and RFM data
    const marketsData = [
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
    ];
    
    const rfmToMarkets = {
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
    };
    
    const rfmList = ['Affolter', 'Brasuel', 'Hillerich', 'Humphries', 'Johnson', 'Morton', 
                     'Morris', 'Munda', 'Riley', 'Sanderson', 'Snelling', 'Swett', 'VanJoosten', 'Zatulak'];
    
    // Quick Visit Manager Object
    window.CSFPQuickVisit = {
        selectedFormType: null,
        selectedPersonName: null,
        selectedMarket: null,
        selectedRfm: null,
        selectedCatLocal: 'CAT',
        visitData: {},
        onSaveCallback: null,
        searchTimeout: null,
        storedTranscription: null,
        activeTour: null,
        
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
            
            // Quick visit button
            $('#quick-visit-btn').off('click').on('click', function() {
                self.open();
            });
            
            // Carrier change handler
            $(document).on('change', '#field-carrier', function() {
                const carrier = $(this).val();
                self.loadAdjustersByCarrier(carrier);
            });
            
            // Add new adjuster button
            $(document).on('click', '#add-new-adjuster', function() {
                const carrier = $('#field-carrier').val();
                if (!carrier) {
                    alert('Please select a carrier first');
                    return;
                }
                const adjusterName = prompt('Enter new adjuster name:');
                if (adjusterName) {
                    self.addNewAdjuster(carrier, adjusterName);
                }
            });
            
            // RFM change handler - populate markets dropdown
            $(document).on('change', '#visit-rfm', function() {
                const rfm = $(this).val();
                self.populateRFMMarkets(rfm);
            });
            
            // Autocomplete for name input
            $(document).on('input', '#person-name-input', function() {
                const query = $(this).val();
                clearTimeout(self.searchTimeout);
                
                if (query.length < 1) {
                    $('#name-suggestions').empty().hide();
                    return;
                }
                
                self.searchTimeout = setTimeout(() => {
                    self.searchNames(query);
                }, 200);
            });
            
            // Click on suggestion
            $(document).on('click', '.csfp-suggestion-item', function() {
                const name = $(this).data('name');
                $('#person-name-input').val(name);
                self.selectedPersonName = name;
                $('#name-suggestions').empty().hide();
            });
            
            // Click outside to close suggestions
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.csfp-autocomplete-wrapper').length) {
                    $('#name-suggestions').hide();
                }
            });
            
            // Prevent typing in dropdowns
            $(document).on('keydown', '.csfp-select', function(e) {
                // Allow tab, arrow keys, enter, and escape
                if (![9, 37, 38, 39, 40, 13, 27].includes(e.keyCode)) {
                    e.preventDefault();
                }
            });
        },
        
        // Search names for autocomplete
        searchNames: function(query) {
            const self = this;
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_autocomplete_persons',
                nonce: csfp_ajax.nonce,
                query: query,
                type: this.selectedFormType === 'inspector' ? 'Inspector' : 'Adjuster'
            }, function(response) {
                if (response.success && response.data.length > 0) {
                    let html = '';
                    response.data.forEach(person => {
                        const details = `${person.city || 'Unknown City'}, ${person.market || 'Unknown Market'}`;
                        html += `
                            <div class="csfp-suggestion-item" data-name="${person.name}">
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
        
        // Open modal
        open: function() {
            $('#quick-visit-modal').addClass('active');
            this.reset();
            this.showStep('type');
        },
        
        // Close modal
        close: function() {
            $('#quick-visit-modal').removeClass('active');
            this.reset();
        },
        
        // Reset form
        reset: function() {
            this.selectedFormType = null;
            this.selectedPersonName = null;
            this.selectedMarket = null;
            this.selectedRfm = null;
            this.selectedCatLocal = 'CAT';
            this.visitData = {};
            this.storedTranscription = null;
            
            // Clear all inputs
            $('#person-name-input').val('');
            $('#visit-market').val('');
            $('#visit-rfm').val('');
            $('#visit-rfm-market').val('');
            $('#rfm-market-group').hide();
            $('.csfp-input, .csfp-select, .csfp-textarea').val('').removeClass('error');
            $('input[type="checkbox"]').prop('checked', false);
            
            // Reset progress
            $('.csfp-progress-step').removeClass('active completed');
            $('#progress-type').addClass('active');
            
            // Hide all steps
            $('.csfp-step').removeClass('active');
            
            // Hide CAT/Local selector
            $('#cat-local-selector').hide();
            
            // Reset CAT/Local buttons
            $('.csfp-cat-local-btn').removeClass('active');
            $('.csfp-cat-local-btn[data-value="CAT"]').addClass('active');
            
            // Reset type buttons
            $('.csfp-type-btn').removeClass('selected');
            
            // Reset location toggle to RFM (default)
            this.toggleLocationView('rfm');
        },
        
        // Show specific step
        showStep: function(step) {
            $('.csfp-step').removeClass('active');
            $(`#step-${step}`).addClass('active');
            
            // Update progress bar
            $('.csfp-progress-step').removeClass('active');
            const steps = ['type', 'name', 'location', 'details'];
            const currentIndex = steps.indexOf(step);
            
            steps.forEach((s, index) => {
                if (index < currentIndex) {
                    $(`#progress-${s}`).addClass('completed');
                } else if (index === currentIndex) {
                    $(`#progress-${s}`).addClass('active');
                } else {
                    $(`#progress-${s}`).removeClass('completed active');
                }
            });
        },
        
        // Step 1: Select type
        selectType: function(type) {
            this.selectedFormType = type;
            $('#person-type-label').text(type === 'inspector' ? 'Inspector' : 'Adjuster');
            
            // Update button visuals
            $('.csfp-type-btn').removeClass('selected');
            $(`.csfp-type-btn[data-type="${type}"]`).addClass('selected');
            
            // Initialize location dropdowns
            this.initLocationDropdowns();
            
            // For inspector, show CAT/Local selector
            // For adjuster, go directly to name step
            if (type === 'inspector') {
                $('#cat-local-selector').show();
            } else {
                $('#cat-local-selector').hide();
                this.showStep('name');
                $('#person-name-input').focus();
            }
        },
        
        // Select CAT or Local
        selectCatLocal: function(value) {
            this.selectedCatLocal = value;
            $('.csfp-cat-local-btn').removeClass('active');
            $(`.csfp-cat-local-btn[data-value="${value}"]`).addClass('active');
        },
        
        // Proceed from type selection
        proceedFromType: function() {
            if (this.selectedFormType === 'inspector' && !this.selectedCatLocal) {
                alert('Please select CAT or Local');
                return;
            }
            this.showStep('name');
            $('#person-name-input').focus();
        },
        
        // Initialize location dropdowns
        initLocationDropdowns: function() {
            // Populate market dropdown
            const $marketSelect = $('#visit-market');
            $marketSelect.empty().append('<option value="">Select Market</option>');
            marketsData.forEach(market => {
                $marketSelect.append(`<option value="${market.name}">${market.name}</option>`);
            });
            
            // Populate RFM dropdown
            const $rfmSelect = $('#visit-rfm');
            $rfmSelect.empty().append('<option value="">Select RFM</option>');
            rfmList.forEach(rfm => {
                $rfmSelect.append(`<option value="${rfm}">${rfm}</option>`);
            });
        },
        
        // Toggle location view (RFM vs Market)
        toggleLocationView: function(view) {
            $('.csfp-toggle-btn').removeClass('active');
            $(`.csfp-toggle-btn[data-view="${view}"]`).addClass('active');
            
            if (view === 'rfm') {
                $('#rfm-location-selector').show();
                $('#market-location-selector').hide();
            } else {
                $('#market-location-selector').show();
                $('#rfm-location-selector').hide();
            }
        },
        
        
        // Navigation: Back to Type
        backToType: function() {
            this.showStep('type');
        },
        
        // Navigation: Proceed to Location
        proceedToLocation: function() {
            const nameInput = $('#person-name-input').val();
            if (!nameInput) {
                alert('Please enter a name');
                return;
            }
            
            this.selectedPersonName = nameInput;
            this.showStep('location');
        },
        
        // Navigation: Back to Name
        backToName: function() {
            this.showStep('name');
        },
        
        // Navigation: Proceed to Details
        proceedToDetails: function() {
            // Validate location selection
            let locationSelected = false;
            
            if ($('.csfp-toggle-btn.active').data('view') === 'rfm') {
                // RFM view - RFM and market are required
                this.selectedRfm = $('#visit-rfm').val();
                const rfmMarket = $('#visit-rfm-market').val();
                
                if (this.selectedRfm) {
                    // Check if market selection is needed
                    const markets = rfmToMarkets[this.selectedRfm] || [];
                    if (markets.length > 0) {
                        // Market is required when RFM has markets
                        if (rfmMarket) {
                            this.selectedMarket = rfmMarket;
                            locationSelected = true;
                        } else {
                            alert('Please select a market for this RFM');
                            $('#visit-rfm-market').addClass('error').focus();
                            return;
                        }
                    } else {
                        // No markets for this RFM (shouldn't happen with our data)
                        locationSelected = true;
                        this.selectedMarket = null;
                    }
                }
            } else {
                // Market view
                this.selectedMarket = $('#visit-market').val();
                if (this.selectedMarket) {
                    locationSelected = true;
                    this.selectedRfm = null;
                }
            }
            
            if (!locationSelected) {
                alert('Please select a location (RFM or Market)');
                return;
            }
            
            // Render form fields for the selected type
            this.renderFormFields();
            this.showStep('details');
            
            // Auto-populate CS field after step is shown
            this.autoPopulateCSField();
        },
        
        // Navigation: Back to Location
        backToLocation: function() {
            this.showStep('location');
        },
        
        // Render form fields
        renderFormFields: function() {
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            let html = '';
            
            fields.forEach(field => {
                html += '<div class="csfp-form-group">';
                html += `<label>${field.label}${field.required ? ' *' : ''}</label>`;
                
                switch(field.type) {
                    case 'dropdown':
                        html += `<select id="field-${field.key}" class="csfp-select" ${field.required ? 'required' : ''}>`;
                        html += `<option value="">Select ${field.label}</option>`;
                        field.options.forEach(option => {
                            html += `<option value="${option}">${option}</option>`;
                        });
                        html += '</select>';
                        break;
                        
                    case 'searchable-dropdown':
                        if (field.key === 'carrier') {
                            html += `<select id="field-${field.key}" class="csfp-select csfp-searchable" ${field.required ? 'required' : ''}>`;
                            html += `<option value="">Select ${field.label}</option>`;
                            carriers.forEach(carrier => {
                                html += `<option value="${carrier}">${carrier}</option>`;
                            });
                            html += '</select>';
                        } else if (field.key === 'adjuster') {
                            html += `<select id="field-${field.key}" class="csfp-select csfp-searchable" ${field.required ? 'required' : ''}>`;
                            html += `<option value="">Select Carrier first</option>`;
                            html += '</select>';
                            html += '<button type="button" class="csfp-btn csfp-btn-sm" id="add-new-adjuster" style="margin-top: 0.5rem; display: none;">+ Add New Adjuster</button>';
                        }
                        break;
                        
                    case 'date':
                        html += `<input type="date" id="field-${field.key}" class="csfp-input" ${field.required ? 'required' : ''}>`;
                        break;
                        
                    case 'text':
                        html += `<input type="text" id="field-${field.key}" class="csfp-input" placeholder="Enter ${field.label}" ${field.required ? 'required' : ''}>`;
                        break;
                        
                    case 'textarea':
                        html += `<textarea id="field-${field.key}" class="csfp-textarea" rows="4" placeholder="Enter ${field.label}" ${field.required ? 'required' : ''}></textarea>`;
                        break;
                }
                
                html += '</div>';
            });
            
            $('#visit-form-fields').html(html);
            
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            $('#field-date').val(today);
            
            // If we have a stored transcription from audio upload, apply it now
            if (this.storedTranscription) {
                this.parseTranscriptionToForm(this.storedTranscription);
                // Clear the stored transcription after use
                this.storedTranscription = null;
            }
        },
        
        // Load adjusters for selected carrier
        loadAdjustersByCarrier: function(carrier) {
            const adjusterSelect = $('#field-adjuster');
            const addButton = $('#add-new-adjuster');
            
            if (!carrier) {
                adjusterSelect.html('<option value="">Select Carrier first</option>');
                adjusterSelect.prop('disabled', true);
                addButton.hide();
                return;
            }
            
            // Enable adjuster select and show add button
            adjusterSelect.prop('disabled', false);
            addButton.show();
            adjusterSelect.html('<option value="">Loading adjusters...</option>');
            
            // Make AJAX call to get adjusters for this carrier
            $.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'csfp_get_adjusters_by_carrier',
                    nonce: csfp_ajax.nonce,
                    carrier: carrier
                },
                success: function(response) {
                    if (response.success && response.data) {
                        let options = '<option value="">Select Adjuster</option>';
                        response.data.forEach(adjuster => {
                            options += `<option value="${adjuster.name}">${adjuster.name}</option>`;
                        });
                        adjusterSelect.html(options);
                    } else {
                        adjusterSelect.html('<option value="">No adjusters found</option>');
                    }
                },
                error: function() {
                    adjusterSelect.html('<option value="">Error loading adjusters</option>');
                }
            });
        },
        
        // Populate RFM markets dropdown
        populateRFMMarkets: function(rfm) {
            const $marketGroup = $('#rfm-market-group');
            const $marketSelect = $('#visit-rfm-market');
            const $hint = $('#rfm-markets-hint');
            
            if (!rfm) {
                $marketGroup.hide();
                $marketSelect.empty().append('<option value="">Select Market</option>');
                return;
            }
            
            const markets = rfmToMarkets[rfm] || [];
            if (markets.length === 0) {
                $marketGroup.hide();
                return;
            }
            
            // Show market dropdown
            $marketGroup.show();
            
            // Populate markets
            $marketSelect.empty().append('<option value="">Select Market</option>');
            markets.forEach(market => {
                $marketSelect.append(`<option value="${market}">${market}</option>`);
            });
            
            // Auto-select if only one market
            if (markets.length === 1) {
                $marketSelect.val(markets[0]);
                $hint.text('Auto-selected the only market for this RFM').show();
            } else {
                $hint.text(`${rfm} manages ${markets.length} markets`).show();
            }
        },
        
        // Add new adjuster
        addNewAdjuster: function(carrier, adjusterName) {
            const self = this;
            
            $.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'csfp_add_adjuster_to_carrier',
                    nonce: csfp_ajax.nonce,
                    carrier: carrier,
                    adjuster_name: adjusterName
                },
                success: function(response) {
                    if (response.success) {
                        // Reload adjusters list
                        self.loadAdjustersByCarrier(carrier);
                        // Select the new adjuster
                        setTimeout(() => {
                            $('#field-adjuster').val(adjusterName);
                        }, 500);
                    } else {
                        alert('Failed to add adjuster: ' + (response.data || 'Unknown error'));
                    }
                },
                error: function() {
                    alert('Error adding new adjuster');
                }
            });
        },
        
        // Auto-populate CS field with logged-in user
        autoPopulateCSField: function() {
            // Make AJAX call to get current user info
            $.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'csfp_get_current_user',
                    nonce: csfp_ajax.nonce
                },
                success: function(response) {
                    if (response.success && response.data) {
                        const userFirstName = response.data.first_name.toLowerCase();
                        const csField = $('#field-cs');
                        
                        if (csField.length > 0) {
                            // Set the value based on first name
                            if (userFirstName === 'kyle') {
                                csField.val('Kyle');
                            } else if (userFirstName === 'gino') {
                                csField.val('Gino');
                            } else if (userFirstName === 'peyton') {
                                csField.val('Peyton');
                            }
                        }
                    }
                }
            });
        },
        
        // Switch tabs
        switchTab: function(tab) {
            $('.csfp-tab').removeClass('active');
            $('.csfp-tab-content').removeClass('active');
            
            $(`.csfp-tab:contains('${tab.charAt(0).toUpperCase() + tab.slice(1)}')`).addClass('active');
            $(`#${tab}-tab`).addClass('active');
        },
        
        // Validate form
        validateForm: function() {
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            let isValid = true;
            let firstError = null;
            
            fields.forEach(field => {
                if (field.required) {
                    const $field = $(`#field-${field.key}`);
                    const value = $field.val();
                    
                    if (!value || value.trim() === '') {
                        isValid = false;
                        $field.addClass('error');
                        if (!firstError) firstError = field.label;
                    } else {
                        $field.removeClass('error');
                    }
                }
            });
            
            if (!isValid && firstError) {
                alert(`Please fill in the required field: ${firstError}`);
            }
            
            return isValid;
        },
        
        // Collect form data
        collectFormData: function() {
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            const data = {
                type: this.selectedFormType,
                [`${this.selectedFormType}_name`]: this.selectedPersonName,
                market: this.selectedMarket,
                rfm: this.selectedRfm || '',
                follow_up_needed: $('#visit-follow-up').is(':checked')
            };
            
            // Add CAT/Local for inspectors
            if (this.selectedFormType === 'inspector') {
                data.cat_local = this.selectedCatLocal;
            }
            
            fields.forEach(field => {
                const value = $(`#field-${field.key}`).val();
                data[field.key] = value || '';
            });
            
            return data;
        },
        
        // Save visit
        saveVisit: function() {
            if (!this.validateForm()) {
                return;
            }
            
            const self = this;
            const visitData = this.collectFormData();
            
            // Store the data
            this.visitData = visitData;
            
            // Send to server
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_save_quick_visit',
                nonce: csfp_ajax.nonce,
                visit_data: JSON.stringify(visitData)
            }, function(response) {
                if (response.success) {
                    self.close();
                    if (self.onSaveCallback) self.onSaveCallback();
                    // Redirect to visits page with the new visit ID as a parameter
                    const visitsUrl = window.location.origin + '/visits/';
                    window.location.href = visitsUrl + '?new_visit=' + response.data.id;
                } else {
                    alert('Error saving visit: ' + (response.data || 'Unknown error'));
                }
            }).fail(function() {
                alert('Network error. Please try again.');
            });
        },
        
        // Process uploaded audio file
        processUploadAudio: function() {
            const fileInput = document.getElementById('audio-file');
            if (!fileInput.files.length) {
                alert('Please select an audio file');
                return;
            }
            
            const self = this;
            const file = fileInput.files[0];
            
            // Show processing status
            $('#upload-status').show();
            $('#upload-status-text').text('Uploading and processing audio file...');
            $('.csfp-progress-indicator').show();
            
            // Create form data for upload
            const formData = new FormData();
            formData.append('action', 'csfp_transcribe_audio');
            formData.append('nonce', csfp_ajax.nonce);
            formData.append('audio_file', file);
            
            // Send for transcription
            $.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    $('.csfp-progress-indicator').hide();
                    
                    if (response.success && response.data.transcription) {
                        $('#upload-status-text').text('Audio processed successfully!');
                        $('#upload-transcription-text').text(response.data.transcription);
                        $('#upload-transcription').show();
                        
                        // Store transcription for later use when fields are rendered
                        self.storedTranscription = response.data.transcription;
                        
                        // After processing, save the visit
                        setTimeout(() => {
                            self.saveUploadVisit(file, response.data.transcription);
                        }, 1500);
                    } else {
                        $('#upload-status-text').text('Processing failed - saving audio only');
                        setTimeout(() => {
                            self.saveUploadVisit(file, null);
                        }, 1500);
                    }
                },
                error: function() {
                    $('.csfp-progress-indicator').hide();
                    $('#upload-status-text').text('Error processing audio - saving file only');
                    setTimeout(() => {
                        self.saveUploadVisit(file, null);
                    }, 1500);
                }
            });
        },
        
        // Save uploaded audio visit
        saveUploadVisit: function(audioFile, transcription) {
            const self = this;
            
            // Validate form first
            if (!this.validateForm()) {
                $('#upload-status-text').text('Please fill in all required fields');
                return;
            }
            
            // Collect form data
            const visitData = this.collectFormData();
            visitData.has_audio = true;
            visitData.transcription = transcription || '';
            
            // Update follow-up from upload tab
            visitData.follow_up_needed = $('#upload-follow-up').is(':checked');
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('action', 'csfp_save_voice_visit');
            formData.append('nonce', csfp_ajax.nonce);
            formData.append('visit_data', JSON.stringify(visitData));
            if (audioFile) {
                formData.append('audio_file', audioFile);
            }
            
            // Send to server
            $.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        self.close();
                        if (self.onSaveCallback) self.onSaveCallback();
                        // Redirect to visits page with the new visit ID as a parameter
                        const visitsUrl = window.location.origin + '/visits/';
                        window.location.href = visitsUrl + '?new_visit=' + response.data.id;
                    } else {
                        $('#upload-status-text').text('Error saving visit');
                        alert('Error saving visit: ' + (response.data || 'Unknown error'));
                    }
                },
                error: function() {
                    $('#upload-status-text').text('Network error');
                    alert('Network error. Please try again.');
                }
            });
        },
        
        // Parse transcription to form fields with better context understanding
        parseTranscriptionToForm: function(transcription) {
            const text = transcription.toLowerCase();
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            
            // Helper function to check for negatives
            const hasNegative = (text, term) => {
                // Check for negative words before the term (within 5 words)
                const negatives = ['not', "wasn't", "wasn't", "didn't", "didn't", "don't", "don't", 
                                 'no', 'never', 'without', 'missing', 'lacks', 'failed'];
                const words = text.split(/\s+/);
                const termIndex = words.findIndex(w => w.includes(term));
                
                if (termIndex === -1) return false;
                
                // Check previous 5 words for negatives
                for (let i = Math.max(0, termIndex - 5); i < termIndex; i++) {
                    if (negatives.some(neg => words[i].includes(neg))) {
                        return true;
                    }
                }
                return false;
            };
            
            fields.forEach(field => {
                let matchedValue = null;
                
                // Skip non-dropdown fields for auto-fill
                if (field.type !== 'dropdown') {
                    if (field.key === 'claim_number') {
                        const claimMatch = transcription.match(/\b\d{2,}-\d{2,}(?:-\d+)?\b/);
                        if (claimMatch) {
                            $(`#field-${field.key}`).val(claimMatch[0]);
                        }
                    } else if (field.key === 'notes') {
                        $(`#field-${field.key}`).val(transcription);
                    }
                    return;
                }
                
                // Field-specific parsing logic
                switch(field.key) {
                    case 'punctual':
                        if (hasNegative(text, 'punctual') || text.includes('late') || 
                            text.includes('not on time') || text.includes("wasn't punctual")) {
                            matchedValue = 'No';
                        } else if (text.includes('punctual') || text.includes('on time')) {
                            matchedValue = 'Yes';
                        }
                        break;
                        
                    case 'branding_compliance':
                        if (text.includes('no ladder') || text.includes("didn't have ladder") || 
                            text.includes('missing ladder')) {
                            matchedValue = 'Missing Ladder';
                        } else if (text.includes('no ladder rack')) {
                            matchedValue = 'No Ladder Rack';
                        } else if (text.includes('improper uniform') || text.includes('wrong uniform')) {
                            matchedValue = 'Improper Uniform';
                        } else if (text.includes('not branded') || text.includes('truck not branded')) {
                            matchedValue = 'Truck Not Branded';
                        } else if (text.includes('no steep') || text.includes('missing steep')) {
                            matchedValue = 'No Steep Assist';
                        } else if (text.includes('proper') && text.includes('equipment')) {
                            matchedValue = 'Yes';
                        }
                        break;
                        
                    case 'issues':
                        if (text.includes('not prep') || text.includes("didn't prep") || 
                            text.includes('not prepping') || text.includes('no prep')) {
                            matchedValue = 'Not Prepping Claims';
                        } else if (text.includes('late') || text.includes('tardy')) {
                            matchedValue = 'Late';
                        } else if (text.includes('attitude')) {
                            matchedValue = 'Attitude';
                        } else if (text.includes('damage call')) {
                            matchedValue = 'Damage Calls';
                        } else if (text.includes('not confirm') || text.includes("didn't confirm")) {
                            matchedValue = 'Not Confirming Claims';
                        } else if (text.includes('roof') && (text.includes('comfort') || text.includes('scared'))) {
                            matchedValue = 'Roof Comfortability';
                        } else if (text.includes('slow')) {
                            matchedValue = 'Slow';
                        }
                        break;
                        
                    case 'mojo':
                        if (hasNegative(text, 'mojo') || text.includes('bad mojo') || 
                            text.includes('no mojo')) {
                            matchedValue = 'No';
                        } else if (text.includes('good mojo') || text.includes('has mojo')) {
                            matchedValue = 'Yes';
                        }
                        break;
                        
                    case 'takes_scope_sheet':
                        if (hasNegative(text, 'scope') || text.includes("doesn't take") || 
                            text.includes("didn't take") || text.includes('no scope')) {
                            matchedValue = 'No';
                        } else if (text.includes('takes scope') || text.includes('brings scope')) {
                            matchedValue = 'Yes';
                        }
                        break;
                        
                    case 'sentiment':
                        if (text.includes('promoter') || text.includes('excellent') || 
                            text.includes('outstanding')) {
                            matchedValue = 'Promoter';
                        } else if (text.includes('detractor') || text.includes('poor') || 
                                 text.includes('terrible') || text.includes('bad')) {
                            matchedValue = 'Detractor';
                        } else if (text.includes('passive') || text.includes('average') || 
                                 text.includes('okay')) {
                            matchedValue = 'Passive';
                        }
                        break;
                        
                    case 'appearance':
                        if (text.includes('poor appearance') || text.includes('sloppy') || 
                            text.includes('unprofessional')) {
                            matchedValue = 'Poor';
                        } else if (text.includes('fair appearance') || text.includes('okay appearance')) {
                            matchedValue = 'Fair';
                        } else if (text.includes('good appearance') || text.includes('professional') || 
                                 text.includes('clean')) {
                            matchedValue = 'Good';
                        }
                        break;
                        
                    case 'adjuster_interaction':
                        if (text.includes('poor') && text.includes('adjuster')) {
                            matchedValue = 'Poor';
                        } else if (text.includes('needs work') && text.includes('adjuster')) {
                            matchedValue = 'Needs Work';
                        } else if (text.includes('great') && text.includes('adjuster')) {
                            matchedValue = 'Great';
                        }
                        break;
                        
                    default:
                        // Generic Yes/No detection for other fields
                        if (field.options.includes('Yes') && field.options.includes('No')) {
                            const fieldWords = field.label.toLowerCase().split(' ');
                            const fieldMentioned = fieldWords.some(word => text.includes(word));
                            
                            if (fieldMentioned) {
                                if (fieldWords.some(word => hasNegative(text, word))) {
                                    matchedValue = 'No';
                                } else {
                                    matchedValue = 'Yes';
                                }
                            }
                        } else {
                            // Try to match any option directly mentioned
                            field.options.forEach(option => {
                                const optionLower = option.toLowerCase();
                                if (text.includes(optionLower)) {
                                    matchedValue = option;
                                }
                            });
                        }
                        break;
                }
                
                // Set the matched value if found
                if (matchedValue) {
                    $(`#field-${field.key}`).val(matchedValue);
                }
            });
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        if (typeof CSFPQuickVisit !== 'undefined') {
            CSFPQuickVisit.init();
        }
    });
    
})(jQuery);