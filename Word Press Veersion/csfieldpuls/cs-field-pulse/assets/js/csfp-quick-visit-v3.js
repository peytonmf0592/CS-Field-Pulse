/**
 * CS Field Pulse Quick Visit Modal V3
 * Inspector and Adjuster forms with exact field schemas matching Excel exports
 */

(function($) {
    'use strict';
    
    // Field definitions for Inspector form (exact order for export)
    const inspectorFields = [
        { key: 'inspector_name', label: 'Inspector Name', type: 'autocomplete', required: true },
        { key: 'cs', label: 'CS', type: 'dropdown', options: ['Gino', 'Kyle', 'Peyton'], required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'sentiment', label: 'Sentiment', type: 'dropdown', options: ['Promoter', 'Passive', 'Detractor'], required: true },
        { key: 'mojo', label: 'Mojo', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { key: 'adjuster_interaction', label: 'Adjuster Interaction', type: 'dropdown', options: ['Great', 'Needs Work', 'Poor'], required: true },
        { key: 'appearance', label: 'Appearance', type: 'dropdown', options: ['Good', 'Fair', 'Poor'], required: true },
        { key: 'branding_compliance', label: 'Branding/Equipment Compliance', type: 'dropdown', options: ['Yes', 'Improper Uniform', 'No Ladder Rack', 'Missing Ladder', 'No Steep Assist', 'Truck Not Branded'], required: true },
        { key: 'punctual', label: 'Punctual', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { key: 'mentor_quality', label: 'Mentor Quality', type: 'dropdown', options: ['Good', 'Fair', 'Bad'], required: true },
        { key: 'takes_scope_sheet', label: 'Takes Scope Sheet On Roof', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { key: 'scope_sheet_quality', label: 'Scope Sheet Quality', type: 'dropdown', options: ['Very Good', 'Fair', 'Bad'], required: true },
        { key: 'communication', label: 'Communication', type: 'dropdown', options: ['Very Good', 'Fair', 'Bad'], required: true },
        { key: 'issues', label: 'Issues', type: 'dropdown', options: ['Late', 'Not Prepping Claims', 'Attitude', 'Damage Calls', 'Not Confirming Claims', 'Roof Comfortability', 'Slow'], required: true },
        { key: 'claim_number', label: 'Claim Number', type: 'text', required: false },
        { key: 'notes', label: 'Notes', type: 'textarea', required: false }
    ];
    
    // Field definitions for Adjuster form (exact order for export)
    const adjusterFields = [
        { key: 'adjuster_name', label: 'Adjuster Name', type: 'autocomplete', required: true },
        { key: 'cs', label: 'CS', type: 'dropdown', options: ['Gino', 'Kyle', 'Peyton'], required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'portal_availability', label: 'Portal Availability', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'portal_requests', label: 'Portal Requests', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'satisfied_inspectors', label: 'Satisfied with Inspectors', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'supported', label: 'Supported', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'trust_seek_now', label: 'Trust in Seek Now', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'rfm_communication', label: 'RFM Communication', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'satisfied_reports', label: 'Satisfied with reports', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'regional_shoutout', label: 'Regional Shoutout', type: 'dropdown', options: [
            'Affolter', 'Brasuel', 'Hillerich', 'Humphries', 'Johnson', 'Morton', 
            'Morris', 'Munda', 'Riley', 'Sanderson', 'Snelling', 'Swett', 
            'VanJoosten', 'Zatulak'
        ], required: true },
        { key: 'inspectors_punctual', label: 'Inspectors Punctual', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'confirmation_texts', label: 'Confirmation Texts', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'], required: true },
        { key: 'scope_sheet_satisfaction', label: 'Scope Sheet Satisfaction', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: true },
        { key: 'solo_service_satisfaction', label: 'Solo Service Satisfaction', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: true },
        { key: 'inspector_feedback', label: 'Inspector Feedback', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: true },
        { key: 'office_feedback', label: 'Office Feeback', type: 'dropdown', options: ['Very Good', 'Good', 'Bad', 'Very Bad'], required: true },
        { key: 'claim_number', label: 'Claim Number', type: 'text', required: false },
        { key: 'notes', label: 'Notes', type: 'textarea', required: false }
    ];
    
    // Quick Visit Modal HTML Template
    const quickVisitModalHTML = `
        <div id="quick-visit-modal" class="csfp-modal">
            <div class="csfp-modal-content" style="max-width: 700px;">
                <button class="csfp-modal-close" onclick="CSFPQuickVisit.close()">&times;</button>
                <h2>Record Visit</h2>
                
                <!-- Form Type Selector -->
                <div class="csfp-form-type-selector">
                    <button type="button" class="csfp-form-type-btn active" data-type="inspector" onclick="CSFPQuickVisit.selectFormType('inspector')">
                        <span class="csfp-type-icon">🔍</span>
                        Inspector Visit
                    </button>
                    <button type="button" class="csfp-form-type-btn" data-type="adjuster" onclick="CSFPQuickVisit.selectFormType('adjuster')">
                        <span class="csfp-type-icon">📋</span>
                        Adjuster Visit
                    </button>
                </div>
                
                <!-- Visit Tabs -->
                <div class="csfp-visit-tabs">
                    <button class="csfp-tab active" onclick="CSFPQuickVisit.switchTab('text')">Text Notes</button>
                    <button class="csfp-tab" onclick="CSFPQuickVisit.switchTab('voice')">Voice Recording</button>
                    <button class="csfp-tab" onclick="CSFPQuickVisit.switchTab('upload')">Upload Audio</button>
                </div>
                
                <!-- Text Tab -->
                <div id="text-tab" class="csfp-tab-content active">
                    <form id="quick-visit-form">
                        <!-- Dynamic fields will be inserted here -->
                        <div id="visit-form-fields"></div>
                        
                        <!-- Follow-up checkbox (not in export) -->
                        <div class="csfp-form-group">
                            <label>
                                <input type="checkbox" id="visit-follow-up"> Follow-up needed
                            </label>
                        </div>
                        
                        <div class="csfp-form-actions">
                            <button type="button" class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveVisit()">Save Visit</button>
                            <button type="button" class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.close()">Cancel</button>
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
                        
                        <div class="csfp-form-group" style="margin-top: 1rem;">
                            <label>
                                <input type="checkbox" id="voice-follow-up"> Follow-up needed
                            </label>
                        </div>
                        <button class="csfp-btn csfp-btn-primary" id="save-voice-btn" style="display: none;" onclick="CSFPQuickVisit.confirmVoiceSave()">Save Voice Visit</button>
                    </div>
                </div>
                
                <!-- Upload Tab -->
                <div id="upload-tab" class="csfp-tab-content">
                    <div class="csfp-form-group">
                        <label>Select Audio File</label>
                        <input type="file" id="audio-file" accept="audio/*" class="csfp-input">
                    </div>
                    <div class="csfp-form-group">
                        <label>
                            <input type="checkbox" id="upload-follow-up"> Follow-up needed
                        </label>
                    </div>
                    <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveUploadVisit()">Upload Audio</button>
                </div>
            </div>
        </div>
    `;
    
    // Quick Visit Manager Object
    window.CSFPQuickVisit = {
        selectedFormType: 'inspector',
        visitData: {},
        onSaveCallback: null,
        mediaRecorder: null,
        audioChunks: [],
        recordedBlob: null,
        transcriptionText: null,
        searchTimeout: null,
        
        // Initialize the modal
        init: function(onSaveCallback) {
            // Add modal to page if not exists
            if ($('#quick-visit-modal').length === 0) {
                $('body').append(quickVisitModalHTML);
            }
            
            // Set callback
            this.onSaveCallback = onSaveCallback;
            
            // Initialize with inspector form
            this.renderFormFields('inspector');
            
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
            
            // Autocomplete for name fields
            $(document).on('input', '#field-inspector_name, #field-adjuster_name', function() {
                const $input = $(this);
                const fieldKey = $input.attr('id').replace('field-', '');
                const query = $input.val();
                const type = fieldKey === 'inspector_name' ? 'Inspector' : 'Adjuster';
                
                clearTimeout(self.searchTimeout);
                
                if (query.length < 1) {
                    $(`#suggestions-${fieldKey}`).empty().hide();
                    return;
                }
                
                self.searchTimeout = setTimeout(() => {
                    self.searchNames(query, type, fieldKey);
                }, 200);
            });
            
            // Click on suggestion
            $(document).on('click', '.csfp-suggestion-item', function() {
                const name = $(this).data('name');
                const fieldKey = $(this).data('field');
                $(`#field-${fieldKey}`).val(name);
                $(`#suggestions-${fieldKey}`).empty().hide();
            });
            
            // Click outside to close suggestions
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.csfp-autocomplete-wrapper').length) {
                    $('.csfp-suggestions-dropdown').hide();
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
        searchNames: function(query, type, fieldKey) {
            const self = this;
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_autocomplete_persons',
                nonce: csfp_ajax.nonce,
                query: query,
                type: type
            }, function(response) {
                if (response.success && response.data.length > 0) {
                    let html = '';
                    response.data.forEach(person => {
                        const details = `${person.city || 'Unknown City'}, ${person.market || 'Unknown Market'}`;
                        html += `
                            <div class="csfp-suggestion-item" data-name="${person.name}" data-field="${fieldKey}">
                                <div class="csfp-suggestion-name">${person.name}</div>
                                <div class="csfp-suggestion-details">${details}</div>
                            </div>
                        `;
                    });
                    $(`#suggestions-${fieldKey}`).html(html).show();
                } else {
                    $(`#suggestions-${fieldKey}`).empty().hide();
                }
            });
        },
        
        // Select form type (Inspector or Adjuster)
        selectFormType: function(type) {
            this.selectedFormType = type;
            
            // Update button states
            $('.csfp-form-type-btn').removeClass('active');
            $(`.csfp-form-type-btn[data-type="${type}"]`).addClass('active');
            
            // Render appropriate fields
            this.renderFormFields(type);
        },
        
        // Render form fields based on type
        renderFormFields: function(type) {
            const fields = type === 'inspector' ? inspectorFields : adjusterFields;
            let html = '';
            
            fields.forEach(field => {
                html += '<div class="csfp-form-group">';
                html += `<label>${field.label}${field.required ? ' *' : ''}</label>`;
                
                switch(field.type) {
                    case 'autocomplete':
                        html += `<div class="csfp-autocomplete-wrapper">`;
                        html += `<input type="text" id="field-${field.key}" class="csfp-input" placeholder="Start typing name..." ${field.required ? 'required' : ''} autocomplete="off">`;
                        html += `<div id="suggestions-${field.key}" class="csfp-suggestions-dropdown"></div>`;
                        html += `</div>`;
                        break;
                        
                    case 'dropdown':
                        html += `<select id="field-${field.key}" class="csfp-select" ${field.required ? 'required' : ''}>`;
                        html += `<option value="">Select ${field.label}</option>`;
                        field.options.forEach(option => {
                            html += `<option value="${option}">${option}</option>`;
                        });
                        html += '</select>';
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
        },
        
        // Open modal
        open: function() {
            $('#quick-visit-modal').addClass('active');
            this.reset();
        },
        
        // Close modal
        close: function() {
            $('#quick-visit-modal').removeClass('active');
            this.reset();
        },
        
        // Switch tabs
        switchTab: function(tab) {
            $('.csfp-tab').removeClass('active');
            $('.csfp-tab-content').removeClass('active');
            
            $(`.csfp-tab:contains('${tab.charAt(0).toUpperCase() + tab.slice(1)}')`).addClass('active');
            $(`#${tab}-tab`).addClass('active');
            
            // If switching to voice tab, ensure form fields are rendered
            if (tab === 'voice') {
                this.renderFormFields(this.selectedFormType);
            }
        },
        
        // Start recording
        startRecording: async function() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };
                
                this.mediaRecorder.onstop = () => {
                    this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(this.recordedBlob);
                    
                    $('#audio-playback').attr('src', audioUrl).show();
                    $('#save-voice-btn').show();
                    
                    // Start transcription
                    this.transcribeAudio();
                };
                
                this.mediaRecorder.start();
                $('#voice-recorder-status').text('Recording...');
                $('#start-recording-btn').hide();
                $('#stop-recording-btn').show();
            } catch (error) {
                alert('Error accessing microphone: ' + error.message);
            }
        },
        
        // Stop recording
        stopRecording: function() {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                
                $('#voice-recorder-status').text('Recording complete');
                $('#stop-recording-btn').hide();
                $('#start-recording-btn').show();
            }
        },
        
        // Transcribe audio
        transcribeAudio: function() {
            const self = this;
            $('#voice-recorder-status').text('Transcribing...');
            
            const formData = new FormData();
            formData.append('action', 'csfp_transcribe_audio');
            formData.append('nonce', csfp_ajax.nonce);
            formData.append('audio_file', this.recordedBlob, 'recording.webm');
            
            $.ajax({
                url: csfp_ajax.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success && response.data.transcription) {
                        self.transcriptionText = response.data.transcription;
                        $('#transcription-text').text(self.transcriptionText);
                        $('#transcription-result').show();
                        
                        // Parse and fill form
                        self.parseTranscriptionToForm(self.transcriptionText);
                        
                        // Show preview of filled fields
                        self.showVoiceFormPreview();
                        
                        $('#voice-recorder-status').text('Transcription complete');
                    } else {
                        $('#voice-recorder-status').text('Transcription failed - you can still save the audio');
                    }
                },
                error: function() {
                    $('#voice-recorder-status').text('Transcription error - you can still save the audio');
                }
            });
        },
        
        // Show voice form preview
        showVoiceFormPreview: function() {
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            let previewHtml = '<div class="csfp-form-preview">';
            
            fields.forEach(field => {
                const value = $(`#field-${field.key}`).val();
                if (value) {
                    previewHtml += `<div class="csfp-preview-item"><strong>${field.label}:</strong> ${value}</div>`;
                }
            });
            
            previewHtml += '</div>';
            $('#voice-form-fields').html(previewHtml);
            $('#voice-form-preview').show();
        },
        
        // Confirm voice save
        confirmVoiceSave: function() {
            // Copy follow-up checkbox value to main form
            $('#visit-follow-up').prop('checked', $('#voice-follow-up').is(':checked'));
            
            // Save with voice data
            this.saveVoiceVisit(this.recordedBlob, this.transcriptionText);
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
                follow_up_needed: $('#visit-follow-up').is(':checked')
            };
            
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
                    alert('Visit recorded successfully!');
                } else {
                    alert('Error saving visit: ' + (response.data || 'Unknown error'));
                }
            }).fail(function() {
                alert('Network error. Please try again.');
            });
        },
        
        // Parse transcription and fill form fields
        parseTranscriptionToForm: function(transcription) {
            const text = transcription.toLowerCase();
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            
            fields.forEach(field => {
                let matchedValue = null;
                
                // Skip non-dropdown fields for auto-fill
                if (field.type !== 'dropdown') {
                    if (field.key === 'claim_number') {
                        // Look for claim number patterns (e.g., numbers with dashes)
                        const claimMatch = transcription.match(/\b\d{2,}-\d{2,}(?:-\d+)?\b/);
                        if (claimMatch) {
                            $(`#field-${field.key}`).val(claimMatch[0]);
                        }
                    } else if (field.key === 'notes') {
                        // Put the entire transcription in notes
                        $(`#field-${field.key}`).val(transcription);
                    }
                    return;
                }
                
                // Try to match dropdown options
                field.options.forEach(option => {
                    const optionLower = option.toLowerCase();
                    
                    // Look for exact matches or mentions
                    if (text.includes(optionLower)) {
                        matchedValue = option;
                    }
                    
                    // Special handling for yes/no fields
                    if (field.options.length === 2 && field.options.includes('Yes') && field.options.includes('No')) {
                        if (text.includes('not') || text.includes("don't") || text.includes("doesn't") || text.includes('no')) {
                            matchedValue = 'No';
                        } else if (text.includes('yes') || text.includes('good') || text.includes('great')) {
                            matchedValue = 'Yes';
                        }
                    }
                    
                    // Special handling for quality/satisfaction fields
                    if (optionLower.includes('very good') && (text.includes('very good') || text.includes('excellent'))) {
                        matchedValue = option;
                    } else if (optionLower.includes('good') && text.includes('good')) {
                        matchedValue = option;
                    } else if (optionLower.includes('bad') && (text.includes('bad') || text.includes('poor'))) {
                        matchedValue = option;
                    }
                    
                    // Sentiment detection
                    if (field.key === 'sentiment') {
                        if (text.includes('promoter') || text.includes('happy') || text.includes('satisfied')) {
                            matchedValue = 'Promoter';
                        } else if (text.includes('detractor') || text.includes('unhappy') || text.includes('dissatisfied')) {
                            matchedValue = 'Detractor';
                        } else if (text.includes('passive') || text.includes('neutral')) {
                            matchedValue = 'Passive';
                        }
                    }
                    
                    // CS person detection
                    if (field.key === 'cs') {
                        if (text.includes('gino')) matchedValue = 'Gino';
                        else if (text.includes('kyle')) matchedValue = 'Kyle';
                        else if (text.includes('peyton')) matchedValue = 'Peyton';
                    }
                });
                
                // Set the matched value if found
                if (matchedValue) {
                    $(`#field-${field.key}`).val(matchedValue);
                }
            });
        },
        
        // Save voice visit with transcription
        saveVoiceVisit: function(audioBlob, transcription) {
            const self = this;
            
            // First, parse transcription to fill form
            if (transcription) {
                this.parseTranscriptionToForm(transcription);
            }
            
            // Validate form (but don't block if some fields are empty from transcription)
            const fields = this.selectedFormType === 'inspector' ? inspectorFields : adjusterFields;
            fields.forEach(field => {
                // Remove required validation for voice transcripts
                $(`#field-${field.key}`).prop('required', false);
            });
            
            // Collect form data
            const visitData = this.collectFormData();
            visitData.transcription = transcription || '';
            visitData.has_voice = true;
            
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('action', 'csfp_save_voice_visit');
            formData.append('nonce', csfp_ajax.nonce);
            formData.append('visit_data', JSON.stringify(visitData));
            if (audioBlob) {
                formData.append('audio_file', audioBlob, 'recording.webm');
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
                        alert('Voice visit recorded successfully!');
                    } else {
                        alert('Error saving visit: ' + (response.data || 'Unknown error'));
                    }
                },
                error: function() {
                    alert('Network error. Please try again.');
                }
            });
        },
        
        // Save upload visit (placeholder)
        saveUploadVisit: function() {
            const fileInput = document.getElementById('audio-file');
            if (!fileInput.files.length) {
                alert('Please select an audio file');
                return;
            }
            alert('Audio upload functionality to be implemented');
        },
        
        // Reset form
        reset: function() {
            // Clear all inputs
            $('#visit-form-fields input').val('');
            $('#visit-form-fields select').val('');
            $('#visit-form-fields textarea').val('');
            $('.csfp-input, .csfp-select, .csfp-textarea').removeClass('error');
            
            // Reset checkboxes
            $('#visit-follow-up, #voice-follow-up, #upload-follow-up').prop('checked', false);
            
            // Reset to inspector form
            this.selectFormType('inspector');
            
            // Set today's date
            const today = new Date().toISOString().split('T')[0];
            $('#field-date').val(today);
            
            // Reset tabs
            this.switchTab('text');
            
            // Clear stored data
            this.visitData = {};
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        if (typeof CSFPQuickVisit !== 'undefined') {
            CSFPQuickVisit.init();
        }
    });
    
})(jQuery);