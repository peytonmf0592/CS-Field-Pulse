/**
 * CS Field Pulse Quick Visit Modal
 * Reusable component for recording visits from any page
 */

(function($) {
    'use strict';
    
    // Quick Visit Modal HTML Template
    const quickVisitModalHTML = `
        <div id="quick-visit-modal" class="csfp-modal">
            <div class="csfp-modal-content" style="max-width: 700px;">
                <button class="csfp-modal-close" onclick="CSFPQuickVisit.close()">&times;</button>
                <h2>Record Visit</h2>
                
                <!-- Person Search -->
                <div class="csfp-form-group">
                    <label>Search or Add Person</label>
                    <input type="text" id="person-search" class="csfp-input" placeholder="Start typing name..." autocomplete="off">
                    <div id="search-results" class="csfp-search-results"></div>
                </div>
                
                <!-- Selected Person Info -->
                <div id="selected-person" class="csfp-glass" style="padding: 1rem; margin: 1rem 0; display: none;">
                    <h4 id="selected-name"></h4>
                    <p id="selected-details" style="margin: 0; opacity: 0.8;"></p>
                </div>
                
                <!-- Visit Form -->
                <div id="visit-form" style="display: none;">
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
                    </div>
                    
                    <!-- Voice Tab -->
                    <div id="voice-tab" class="csfp-tab-content">
                        <div class="csfp-voice-recorder">
                            <button id="record-toggle" class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.toggleRecording()">
                                <span class="record-icon">●</span> <span class="record-text">Start Recording</span>
                            </button>
                            <div id="recording-timer" style="margin: 1rem 0; font-size: 1.5rem; font-weight: bold; color: var(--csfp-green); display: none;">00:00</div>
                            <div id="recording-status" style="margin: 1rem 0;"></div>
                            <audio id="recording-preview" controls style="display: none; width: 100%; margin: 1rem 0;"></audio>
                            <button id="transcribe-btn" class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.transcribeRecording()" style="display: none;">Transcribe & Analyze</button>
                            <div id="transcription-result" style="display: none; margin: 1rem 0;">
                                <h4>AI Analysis</h4>
                                
                                <!-- Summary -->
                                <div class="csfp-glass" style="padding: 1rem; margin-bottom: 1rem;">
                                    <h5 style="color: var(--csfp-green); margin-bottom: 0.5rem;">Summary</h5>
                                    <p id="ai-summary" style="margin: 0;"></p>
                                </div>
                                
                                <!-- Key Points -->
                                <div class="csfp-glass" style="padding: 1rem; margin-bottom: 1rem;">
                                    <h5 style="color: var(--csfp-green); margin-bottom: 0.5rem;">Key Points</h5>
                                    <ul id="ai-key-points" style="margin: 0; padding-left: 1.5rem;"></ul>
                                </div>
                                
                                <!-- Action Items -->
                                <div id="ai-action-items-container" class="csfp-glass" style="padding: 1rem; margin-bottom: 1rem; display: none;">
                                    <h5 style="color: var(--csfp-green); margin-bottom: 0.5rem;">Action Items</h5>
                                    <ul id="ai-action-items" style="margin: 0; padding-left: 1.5rem;"></ul>
                                </div>
                                
                                <div class="csfp-form-group">
                                    <label>AI Detected Sentiment</label>
                                    <select id="ai-sentiment" class="csfp-select">
                                        <option value="Promoter">Promoter</option>
                                        <option value="Passive">Passive</option>
                                        <option value="Detractor">Detractor</option>
                                    </select>
                                </div>
                                
                                <!-- Full Transcript (Collapsible) -->
                                <details class="csfp-glass" style="margin-bottom: 1rem;">
                                    <summary style="cursor: pointer; padding: 0.5rem 0;">View Full Transcript</summary>
                                    <div class="csfp-chat-transcript" style="margin-top: 1rem;">
                                        <div id="ai-chat-messages" class="csfp-chat-messages"></div>
                                    </div>
                                </details>
                                
                                <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveVoiceVisit()">Save Visit</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upload Tab -->
                    <div id="upload-tab" class="csfp-tab-content">
                        <div class="csfp-form-group">
                            <label>Upload Audio File</label>
                            <input type="file" id="audio-upload" accept="audio/*" class="csfp-input">
                            <small style="opacity: 0.7;">Supported formats: MP3, WAV, M4A, WebM</small>
                        </div>
                        
                        <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.uploadAndTranscribe()">Upload & Transcribe</button>
                        
                        <div id="upload-result" style="display: none; margin: 1rem 0;">
                            <h4>AI Analysis</h4>
                            
                            <!-- Summary -->
                            <div class="csfp-glass" style="padding: 1rem; margin-bottom: 1rem;">
                                <h5 style="color: var(--csfp-green); margin-bottom: 0.5rem;">Summary</h5>
                                <p id="upload-summary" style="margin: 0;"></p>
                            </div>
                            
                            <!-- Key Points -->
                            <div class="csfp-glass" style="padding: 1rem; margin-bottom: 1rem;">
                                <h5 style="color: var(--csfp-green); margin-bottom: 0.5rem;">Key Points</h5>
                                <ul id="upload-key-points" style="margin: 0; padding-left: 1.5rem;"></ul>
                            </div>
                            
                            <!-- Action Items -->
                            <div id="upload-action-items-container" class="csfp-glass" style="padding: 1rem; margin-bottom: 1rem; display: none;">
                                <h5 style="color: var(--csfp-green); margin-bottom: 0.5rem;">Action Items</h5>
                                <ul id="upload-action-items" style="margin: 0; padding-left: 1.5rem;"></ul>
                            </div>
                            
                            <div class="csfp-form-group">
                                <label>AI Detected Sentiment</label>
                                <select id="upload-sentiment" class="csfp-select">
                                    <option value="Promoter">Promoter</option>
                                    <option value="Passive">Passive</option>
                                    <option value="Detractor">Detractor</option>
                                </select>
                            </div>
                            
                            <!-- Full Transcript (Collapsible) -->
                            <details class="csfp-glass" style="margin-bottom: 1rem;">
                                <summary style="cursor: pointer; padding: 0.5rem 0;">View Full Transcript</summary>
                                <div class="csfp-chat-transcript" style="margin-top: 1rem;">
                                    <div id="upload-chat-messages" class="csfp-chat-messages"></div>
                                </div>
                            </details>
                            
                            <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveUploadVisit()">Save Visit</button>
                        </div>
                    </div>
                </div>
                
                <!-- Add New Person Form -->
                <div id="add-person-form" style="display: none;">
                    <h3>Add New <span id="person-type">Inspector</span></h3>
                    
                    <div class="csfp-form-group">
                        <label>Type</label>
                        <select id="new-person-type" class="csfp-select" onchange="CSFPQuickVisit.togglePersonFields()">
                            <option value="Inspector">Inspector</option>
                            <option value="Adjuster">Adjuster</option>
                        </select>
                    </div>
                    
                    <div class="csfp-form-group">
                        <label>Name</label>
                        <input type="text" id="new-person-name" class="csfp-input" required>
                    </div>
                    
                    <div class="csfp-form-group">
                        <label>City</label>
                        <input type="text" id="new-person-city" class="csfp-input">
                    </div>
                    
                    <div class="csfp-form-group">
                        <label>Market</label>
                        <input type="text" id="new-person-market" class="csfp-input">
                    </div>
                    
                    <!-- Inspector Fields -->
                    <div id="inspector-fields">
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
                    
                    <button class="csfp-btn csfp-btn-primary" onclick="CSFPQuickVisit.saveNewPerson()">Add & Continue</button>
                    <button class="csfp-btn csfp-btn-secondary" onclick="CSFPQuickVisit.cancelAddPerson()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    // Quick Visit Manager Object
    window.CSFPQuickVisit = {
        selectedPersonId: null,
        selectedPersonType: null,
        selectedPersonName: null,
        currentTranscription: null,
        isRecording: false,
        recordingStartTime: null,
        recordingInterval: null,
        mediaRecorder: null,
        audioChunks: [],
        recordedBlob: null,
        searchTimeout: null,
        onSaveCallback: null,
        
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
            
            // Person search
            $('#person-search').off('input').on('input', function() {
                const query = $(this).val();
                clearTimeout(self.searchTimeout);
                
                if (query.length < 2) {
                    $('#search-results').empty();
                    return;
                }
                
                self.searchTimeout = setTimeout(() => {
                    self.searchPersons(query);
                }, 300);
            });
            
            // Quick visit button
            $('#quick-visit-btn').off('click').on('click', function() {
                self.open();
            });
        },
        
        // Open modal
        open: function() {
            $('#quick-visit-modal').addClass('active');
            $('#person-search').focus();
        },
        
        // Close modal
        close: function() {
            $('#quick-visit-modal').removeClass('active');
            this.reset();
        },
        
        // Search persons
        searchPersons: function(query) {
            const self = this;
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_search_persons',
                nonce: csfp_ajax.nonce,
                query: query
            }, function(response) {
                if (response.success) {
                    const results = response.data;
                    let html = '';
                    
                    if (results.length > 0) {
                        html = results.map(person => `
                            <div class="csfp-search-result" onclick="CSFPQuickVisit.selectPerson(${person.id}, '${person.name}', '${person.role}', '${person.city || ''}', '${person.market || ''}')">
                                <strong>${person.name}</strong>
                                <small>${person.role} - ${person.city || 'Unknown'}, ${person.market || 'Unknown'}</small>
                            </div>
                        `).join('');
                    } else {
                        html = `
                            <div class="csfp-search-result" onclick="CSFPQuickVisit.showAddPersonForm()">
                                <strong>+ Add New Person</strong>
                                <small>Create a new inspector or adjuster profile</small>
                            </div>
                        `;
                    }
                    
                    $('#search-results').html(html);
                }
            });
        },
        
        // Select person
        selectPerson: function(id, name, role, city, market) {
            this.selectedPersonId = id;
            this.selectedPersonType = role;
            this.selectedPersonName = name;
            
            $('#selected-name').text(name);
            $('#selected-details').text(`${role} - ${city}, ${market}`);
            $('#selected-person').show();
            $('#search-results').empty();
            $('#person-search').val('');
            $('#visit-form').show();
            $('#add-person-form').hide();
        },
        
        // Show add person form
        showAddPersonForm: function() {
            $('#search-results').empty();
            $('#person-search').val('');
            $('#visit-form').hide();
            $('#add-person-form').show();
        },
        
        // Toggle person fields
        togglePersonFields: function() {
            const type = $('#new-person-type').val();
            if (type === 'Inspector') {
                $('#inspector-fields').show();
                $('#adjuster-fields').hide();
            } else {
                $('#inspector-fields').hide();
                $('#adjuster-fields').show();
            }
        },
        
        // Save new person
        saveNewPerson: function() {
            const self = this;
            const type = $('#new-person-type').val();
            const data = {
                action: type === 'Inspector' ? 'csfp_save_inspector' : 'csfp_save_adjuster',
                nonce: csfp_ajax.nonce,
                name: $('#new-person-name').val(),
                city: $('#new-person-city').val(),
                market: $('#new-person-market').val(),
                sentiment: 'Passive'
            };
            
            if (type === 'Inspector') {
                data.cat_local = $('#new-cat-local').val();
                data.is_mentor = $('#new-is-mentor').is(':checked') ? 1 : 0;
                data.rfm = '';
            } else {
                data.carrier = $('#new-carrier').val();
            }
            
            $.post(csfp_ajax.ajax_url, data, function(response) {
                if (response.success) {
                    const newId = response.data.id || 'new';
                    self.selectPerson(newId, data.name, type, data.city, data.market);
                } else {
                    alert('Error creating person: ' + response.data);
                }
            });
        },
        
        // Cancel add person
        cancelAddPerson: function() {
            $('#add-person-form').hide();
            $('#person-search').focus();
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
                alert('Please select a person first');
                return;
            }
            
            const data = {
                action: 'csfp_add_engagement',
                nonce: csfp_ajax.nonce,
                inspector_id: this.selectedPersonId,
                sentiment: $('#visit-sentiment').val(),
                notes: $('#visit-notes').val(),
                follow_up_needed: $('#visit-follow-up').is(':checked') ? 1 : 0
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
        
        // Toggle recording
        toggleRecording: async function() {
            const self = this;
            if (!this.isRecording) {
                // Start recording
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioChunks = [];
                    
                    this.mediaRecorder.ondataavailable = (event) => {
                        self.audioChunks.push(event.data);
                    };
                    
                    this.mediaRecorder.onstop = () => {
                        self.recordedBlob = new Blob(self.audioChunks, { type: 'audio/webm' });
                        const audioUrl = URL.createObjectURL(self.recordedBlob);
                        $('#recording-preview').attr('src', audioUrl).show();
                        $('#transcribe-btn').show();
                        
                        // Stop all tracks
                        stream.getTracks().forEach(track => track.stop());
                    };
                    
                    this.mediaRecorder.start();
                    this.isRecording = true;
                    this.recordingStartTime = Date.now();
                    
                    // Update UI
                    $('#record-toggle').removeClass('csfp-btn-primary').addClass('csfp-btn-danger');
                    $('#record-toggle .record-icon').text('■');
                    $('#record-toggle .record-text').text('Stop Recording');
                    $('#recording-status').text('Recording...').css('color', '#ff4444');
                    $('#recording-timer').show();
                    
                    // Start timer
                    this.recordingInterval = setInterval(() => self.updateRecordingTimer(), 100);
                    
                } catch (error) {
                    alert('Failed to start recording: ' + error.message);
                    console.error('Recording error:', error);
                }
            } else {
                // Stop recording
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                    this.isRecording = false;
                    
                    // Update UI
                    $('#record-toggle').removeClass('csfp-btn-danger').addClass('csfp-btn-primary');
                    $('#record-toggle .record-icon').text('●');
                    $('#record-toggle .record-text').text('Start Recording');
                    $('#recording-status').text('Recording complete').css('color', '#00ff88');
                    
                    // Stop timer
                    clearInterval(this.recordingInterval);
                }
            }
        },
        
        // Update recording timer
        updateRecordingTimer: function() {
            if (this.recordingStartTime) {
                const elapsed = Date.now() - this.recordingStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                $('#recording-timer').text(
                    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
                );
            }
        },
        
        // Transcribe recording
        transcribeRecording: async function() {
            const self = this;
            if (!this.recordedBlob) {
                alert('No recording to transcribe');
                return;
            }
            
            $('#transcribe-btn').prop('disabled', true).text('Transcribing...');
            
            const formData = new FormData();
            formData.append('action', 'csfp_transcribe_visit');
            formData.append('nonce', csfp_ajax.nonce);
            formData.append('audio', this.recordedBlob, 'recording.webm');
            if (this.selectedPersonId) {
                formData.append('inspector_id', this.selectedPersonId);
            }
            
            try {
                const response = await $.ajax({
                    url: csfp_ajax.ajax_url,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                });
                
                if (response.success) {
                    self.currentTranscription = response.data;
                    
                    // Display summary
                    $('#ai-summary').text(self.currentTranscription.summary || 'No summary available');
                    
                    // Display key points
                    const keyPointsHtml = (self.currentTranscription.key_points || []).map(point => 
                        `<li>${point}</li>`
                    ).join('');
                    $('#ai-key-points').html(keyPointsHtml || '<li>No key points identified</li>');
                    
                    // Display action items if any
                    if (self.currentTranscription.action_items && self.currentTranscription.action_items.length > 0) {
                        const actionItemsHtml = self.currentTranscription.action_items.map(item => 
                            `<li>${item}</li>`
                        ).join('');
                        $('#ai-action-items').html(actionItemsHtml);
                        $('#ai-action-items-container').show();
                    } else {
                        $('#ai-action-items-container').hide();
                    }
                    
                    // Display formatted transcript as chat
                    if (self.currentTranscription.formatted_transcript && Array.isArray(self.currentTranscription.formatted_transcript)) {
                        const chatHtml = self.currentTranscription.formatted_transcript.map(msg => {
                            const speakerClass = msg.speaker.includes(self.selectedPersonName || 'Inspector') ? 'csfp-chat-other' : 'csfp-chat-user';
                            return `
                                <div class="csfp-chat-message ${speakerClass}">
                                    <div class="csfp-chat-speaker">${msg.speaker}</div>
                                    <div class="csfp-chat-bubble">${msg.text}</div>
                                </div>
                            `;
                        }).join('');
                        $('#ai-chat-messages').html(chatHtml);
                    } else {
                        // Fallback to raw transcript
                        $('#ai-chat-messages').html(`<div class="csfp-chat-message"><div class="csfp-chat-bubble">${self.currentTranscription.transcription}</div></div>`);
                    }
                    
                    $('#ai-sentiment').val(self.currentTranscription.sentiment);
                    $('#transcription-result').show();
                    $('#transcribe-btn').hide();
                } else {
                    throw new Error(response.data || 'Transcription failed');
                }
            } catch (error) {
                alert('Failed to transcribe: ' + error.message);
                $('#transcribe-btn').prop('disabled', false).text('Transcribe & Analyze');
            }
        },
        
        // Save voice visit
        saveVoiceVisit: function() {
            const self = this;
            if (!this.selectedPersonId || !this.currentTranscription) {
                alert('Please complete the recording first');
                return;
            }
            
            const data = {
                action: 'csfp_add_engagement',
                nonce: csfp_ajax.nonce,
                inspector_id: this.selectedPersonId,
                sentiment: $('#ai-sentiment').val(),
                notes: this.currentTranscription.summary || this.currentTranscription.transcription,
                transcription: this.currentTranscription.transcription,
                follow_up_needed: this.currentTranscription.follow_up_needed ? 1 : 0
            };
            
            $.post(csfp_ajax.ajax_url, data, function(response) {
                if (response.success) {
                    self.close();
                    if (self.onSaveCallback) self.onSaveCallback();
                    alert('Voice visit recorded successfully!');
                } else {
                    alert('Error saving visit: ' + response.data);
                }
            });
        },
        
        // Upload and transcribe
        uploadAndTranscribe: async function() {
            const self = this;
            const fileInput = $('#audio-upload')[0];
            if (!fileInput.files[0]) {
                alert('Please select an audio file');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'csfp_transcribe_visit');
            formData.append('nonce', csfp_ajax.nonce);
            formData.append('audio', fileInput.files[0]);
            if (this.selectedPersonId) {
                formData.append('inspector_id', this.selectedPersonId);
            }
            
            try {
                const response = await $.ajax({
                    url: csfp_ajax.ajax_url,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                });
                
                if (response.success) {
                    self.currentTranscription = response.data;
                    
                    // Display summary
                    $('#upload-summary').text(self.currentTranscription.summary || 'No summary available');
                    
                    // Display key points
                    const keyPointsHtml = (self.currentTranscription.key_points || []).map(point => 
                        `<li>${point}</li>`
                    ).join('');
                    $('#upload-key-points').html(keyPointsHtml || '<li>No key points identified</li>');
                    
                    // Display action items if any
                    if (self.currentTranscription.action_items && self.currentTranscription.action_items.length > 0) {
                        const actionItemsHtml = self.currentTranscription.action_items.map(item => 
                            `<li>${item}</li>`
                        ).join('');
                        $('#upload-action-items').html(actionItemsHtml);
                        $('#upload-action-items-container').show();
                    } else {
                        $('#upload-action-items-container').hide();
                    }
                    
                    // Display formatted transcript as chat
                    if (self.currentTranscription.formatted_transcript && Array.isArray(self.currentTranscription.formatted_transcript)) {
                        const chatHtml = self.currentTranscription.formatted_transcript.map(msg => {
                            const speakerClass = msg.speaker.includes(self.selectedPersonName || 'Inspector') ? 'csfp-chat-other' : 'csfp-chat-user';
                            return `
                                <div class="csfp-chat-message ${speakerClass}">
                                    <div class="csfp-chat-speaker">${msg.speaker}</div>
                                    <div class="csfp-chat-bubble">${msg.text}</div>
                                </div>
                            `;
                        }).join('');
                        $('#upload-chat-messages').html(chatHtml);
                    } else {
                        // Fallback to raw transcript
                        $('#upload-chat-messages').html(`<div class="csfp-chat-message"><div class="csfp-chat-bubble">${self.currentTranscription.transcription}</div></div>`);
                    }
                    
                    $('#upload-sentiment').val(self.currentTranscription.sentiment);
                    $('#upload-result').show();
                } else {
                    throw new Error(response.data || 'Transcription failed');
                }
            } catch (error) {
                alert('Failed to transcribe: ' + error.message);
            }
        },
        
        // Save upload visit
        saveUploadVisit: function() {
            const self = this;
            if (!this.selectedPersonId || !this.currentTranscription) {
                alert('Please complete the upload first');
                return;
            }
            
            const data = {
                action: 'csfp_add_engagement',
                nonce: csfp_ajax.nonce,
                inspector_id: this.selectedPersonId,
                sentiment: $('#upload-sentiment').val(),
                notes: this.currentTranscription.summary || this.currentTranscription.transcription,
                transcription: this.currentTranscription.transcription,
                follow_up_needed: this.currentTranscription.follow_up_needed ? 1 : 0
            };
            
            $.post(csfp_ajax.ajax_url, data, function(response) {
                if (response.success) {
                    self.close();
                    if (self.onSaveCallback) self.onSaveCallback();
                    alert('Visit from upload recorded successfully!');
                } else {
                    alert('Error saving visit: ' + response.data);
                }
            });
        },
        
        // Reset form
        reset: function() {
            $('#person-search').val('');
            $('#search-results').empty();
            $('#selected-person').hide();
            $('#visit-form').hide();
            $('#add-person-form').hide();
            $('#visit-notes').val('');
            $('#visit-follow-up').prop('checked', false);
            this.selectedPersonId = null;
            this.selectedPersonType = null;
            this.currentTranscription = null;
            
            // Reset tabs
            this.switchTab('text');
            
            // Reset recording UI
            $('#recording-status').text('');
            $('#recording-preview').hide();
            $('#transcribe-btn').hide();
            $('#transcription-result').hide();
            $('#recording-timer').hide().text('00:00');
            
            // Reset recording variables
            this.isRecording = false;
            this.recordingStartTime = null;
            this.recordedBlob = null;
            this.audioChunks = [];
            if (this.recordingInterval) {
                clearInterval(this.recordingInterval);
            }
            
            // Reset button state
            $('#record-toggle').removeClass('csfp-btn-danger').addClass('csfp-btn-primary');
            $('#record-toggle .record-icon').text('●');
            $('#record-toggle .record-text').text('Start Recording');
            
            // Reset upload UI
            $('#audio-upload').val('');
            $('#upload-result').hide();
        }
    };
    
})(jQuery);