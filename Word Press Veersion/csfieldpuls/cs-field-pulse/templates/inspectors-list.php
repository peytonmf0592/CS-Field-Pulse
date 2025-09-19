<?php
/**
 * Inspectors list template
 */
?>

<div class="csfp-container">
    <?php CSFP_Navigation::render(); ?>
    
    <!-- Clean Page Header -->
    <div class="csfp-page-header">
        <h1 class="csfp-page-title">
            <span class="csfp-hex-icon inspectors"></span>
            Inspectors
        </h1>
    </div>
    
    <!-- Quick Presets -->
    <div id="csfp-quick-presets-container"></div>
    
    <!-- Filters -->
    <div class="csfp-glass csfp-filters">
        <div class="csfp-filter-group">
            <label class="csfp-filter-label">City</label>
            <select id="filter-city" class="csfp-filter-select">
                <option value="">All Cities</option>
                <?php
                $cities = CSFP_Database::get_all_cities();
                foreach ($cities as $city) {
                    echo '<option value="' . esc_attr($city) . '">' . esc_html($city) . '</option>';
                }
                ?>
            </select>
        </div>
        
        <div class="csfp-filter-group">
            <label class="csfp-filter-label">Role</label>
            <select id="filter-role" class="csfp-filter-select">
                <option value="">All Roles</option>
                <option value="CAT">CAT</option>
                <option value="Local">Local</option>
            </select>
        </div>
        
        <div class="csfp-filter-group">
            <label class="csfp-filter-label">Sentiment</label>
            <select id="filter-sentiment" class="csfp-filter-select">
                <option value="">All Sentiments</option>
                <option value="Promoter">Promoter</option>
                <option value="Passive">Passive</option>
                <option value="Detractor">Detractor</option>
            </select>
        </div>
        
        <div class="csfp-filter-group">
            <button id="add-inspector-btn" class="csfp-btn">
                <span>+</span> Add Inspector
            </button>
        </div>
    </div>
    
    <!-- List -->
    <div id="inspectors-list" class="csfp-list">
        <!-- Inspector items will be loaded here -->
    </div>
    
    <!-- Pagination -->
    <div id="pagination-container" class="csfp-pagination">
        <!-- Pagination will be loaded here -->
    </div>
    
    <!-- Add/Edit Modal -->
    <div id="inspector-modal" class="csfp-modal">
        <div class="csfp-modal-content">
            <button class="csfp-modal-close">&times;</button>
            <h2 id="modal-title">Add Inspector</h2>
            
            <form id="inspector-form">
                <input type="hidden" id="inspector-id" value="">
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Name *</label>
                    <input type="text" id="inspector-name" class="csfp-form-input" required>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">City *</label>
                    <input type="text" id="inspector-city" class="csfp-form-input" required>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Market</label>
                    <input type="text" id="inspector-market" class="csfp-form-input">
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">RFM</label>
                    <input type="text" id="inspector-rfm" class="csfp-form-input">
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Type</label>
                    <select id="inspector-cat-local" class="csfp-filter-select">
                        <option value="">Select...</option>
                        <option value="CAT">CAT</option>
                        <option value="Local">Local</option>
                    </select>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">
                        <input type="checkbox" id="inspector-mentor"> Is Mentor
                    </label>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Initial Sentiment</label>
                    <select id="inspector-sentiment" class="csfp-filter-select">
                        <option value="Passive">Passive</option>
                        <option value="Promoter">Promoter</option>
                        <option value="Detractor">Detractor</option>
                    </select>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Personal Notes</label>
                    <textarea id="inspector-notes" class="csfp-form-textarea"></textarea>
                </div>
                
                <button type="submit" class="csfp-btn">Save Inspector</button>
                <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeModal()">Cancel</button>
            </form>
        </div>
    </div>
    
    <!-- Quick Visit Modal -->
    <div id="quick-visit-modal" class="csfp-modal">
        <div class="csfp-modal-content csfp-glass">
            <button class="csfp-modal-close" onclick="closeQuickVisit()">×</button>
            <h2>Add Visit - <span id="quick-visit-name"></span></h2>
            
            <div class="csfp-visit-tabs">
                <button class="csfp-tab active" onclick="switchVisitTab('text')">📝 Text Entry</button>
                <button class="csfp-tab" onclick="switchVisitTab('voice')">🎤 Voice Recording</button>
            </div>
            
            <!-- Text Entry Tab -->
            <div id="text-entry-tab" class="csfp-tab-content active">
                <form id="quick-visit-form" class="csfp-form">
                    <input type="hidden" id="quick-inspector-id">
                    <input type="hidden" id="quick-inspector-type">
                    
                    <div class="csfp-form-group">
                        <label for="visit-sentiment">Sentiment *</label>
                        <select id="visit-sentiment" required>
                            <option value="">Select sentiment...</option>
                            <option value="Promoter">Promoter</option>
                            <option value="Passive">Passive</option>
                            <option value="Detractor">Detractor</option>
                        </select>
                    </div>
                    
                    <div class="csfp-form-group">
                        <label for="visit-notes">Visit Notes *</label>
                        <textarea id="visit-notes" rows="4" required placeholder="Describe the visit details..."></textarea>
                    </div>
                    
                    <div class="csfp-form-group">
                        <label for="visit-file">Or Upload Notes File</label>
                        <input type="file" id="visit-file" accept=".txt,.doc,.docx,.pdf" />
                        <p class="csfp-help-text">Supported: TXT, DOC, DOCX, PDF</p>
                    </div>
                    
                    <div class="csfp-form-group">
                        <label>
                            <input type="checkbox" id="visit-follow-up"> Follow-up needed
                        </label>
                    </div>
                    
                    <div class="csfp-modal-actions">
                        <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeQuickVisit()">Cancel</button>
                        <button type="submit" class="csfp-btn csfp-btn-primary">Save Visit</button>
                    </div>
                </form>
            </div>
            
            <!-- Voice Recording Tab -->
            <div id="voice-entry-tab" class="csfp-tab-content" style="display: none;">
                <div class="csfp-voice-visit">
                    <div class="csfp-recording-controls">
                        <button id="start-visit-recording" class="csfp-btn csfp-btn-primary" onclick="startVisitRecording()">
                            🔴 Start Recording
                        </button>
                        <button id="stop-visit-recording" class="csfp-btn csfp-btn-danger" onclick="stopVisitRecording()" disabled>
                            ⏹️ Stop Recording
                        </button>
                    </div>
                    
                    <div class="csfp-recording-info">
                        <div id="visit-recording-status">Ready to record</div>
                        <div id="visit-recording-timer">00:00</div>
                        <p class="csfp-help-text">Record your visit details. This will be transcribed and summarized automatically.</p>
                    </div>
                    
                    <div id="visit-voice-preview" class="csfp-voice-preview"></div>
                    
                    <div id="visit-transcription" style="display: none;">
                        <h4>Visit Analysis</h4>
                        
                        <!-- Formatted Transcript -->
                        <div id="formatted-transcript" class="csfp-chat-transcript" style="display: none;">
                            <h5>Conversation</h5>
                            <div id="transcript-messages" class="csfp-chat-messages"></div>
                        </div>
                        
                        <!-- Summary Section -->
                        <div id="visit-summary" class="csfp-glass" style="padding: 1rem; margin: 1rem 0;">
                            <h5>Executive Summary</h5>
                            <p id="summary-text"></p>
                            
                            <div id="key-points" style="display: none;">
                                <h6>Key Points:</h6>
                                <ul id="key-points-list"></ul>
                            </div>
                            
                            <div id="action-items" style="display: none;">
                                <h6>Action Items:</h6>
                                <ul id="action-items-list"></ul>
                            </div>
                        </div>
                        
                        <!-- Raw Transcript (collapsible) -->
                        <details class="csfp-glass" style="padding: 1rem; margin: 1rem 0;">
                            <summary style="cursor: pointer;">View Raw Transcript</summary>
                            <div id="transcription-text" style="margin-top: 1rem; max-height: 200px; overflow-y: auto;"></div>
                        </details>
                        
                        <div class="csfp-form-group">
                            <label for="ai-sentiment">AI Suggested Sentiment</label>
                            <select id="ai-sentiment">
                                <option value="Promoter">Promoter</option>
                                <option value="Passive">Passive</option>
                                <option value="Detractor">Detractor</option>
                            </select>
                        </div>
                        
                        <div class="csfp-form-group">
                            <label>
                                <input type="checkbox" id="ai-follow-up"> Follow-up Recommended
                            </label>
                        </div>
                    </div>
                    
                    <div class="csfp-modal-actions">
                        <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeQuickVisit()">Cancel</button>
                        <button id="transcribe-recording" class="csfp-btn csfp-btn-primary" onclick="transcribeVisitRecording()" disabled>
                            Transcribe & Analyze
                        </button>
                        <button id="save-voice-visit" class="csfp-btn csfp-btn-primary" onclick="saveVoiceVisit()" style="display: none;">
                            Save Visit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    let currentPage = 1;
    const perPage = 20;
    
    // Check for sentiment parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sentimentParam = urlParams.get('sentiment');
    if (sentimentParam) {
        $('#filter-sentiment').val(sentimentParam);
    }
    
    // Load inspectors
    function loadInspectors(page = 1) {
        currentPage = page;
        const filters = {
            city: $('#filter-city').val(),
            cat_local: $('#filter-role').val(),
            sentiment: $('#filter-sentiment').val()
        };
        
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_filter_inspectors',
            nonce: csfp_ajax.nonce,
            page: currentPage,
            per_page: perPage,
            ...filters
        }, function(response) {
            if (response.success) {
                const data = response.data;
                const inspectors = data.items || [];
                let html = '';
                
                if (inspectors.length === 0) {
                    html = '<div class="csfp-glass csfp-card"><p>No inspectors found matching your criteria.</p></div>';
                } else {
                    html = inspectors.map(inspector => {
                        const initials = inspector.name.split(' ').map(n => n[0]).join('').toUpperCase();
                        const sentimentClass = 'csfp-sentiment-' + inspector.sentiment.toLowerCase();
                        const profileUrl = '<?php echo get_permalink(get_option('csfp_profile_page_id')); ?>?id=' + inspector.id;
                        
                        return `
                            <div class="csfp-glass csfp-card csfp-list-item" onclick="handleCardClick(event, '${profileUrl}')">
                                <div class="csfp-avatar">${initials}</div>
                                <div class="csfp-item-content">
                                    <div class="csfp-item-name">${inspector.name}</div>
                                    <div class="csfp-item-details">
                                        <span>${inspector.cat_local || 'N/A'}</span>
                                        <span>${inspector.city || 'N/A'}</span>
                                        ${inspector.is_mentor ? '<span>👨‍🏫 Mentor</span>' : ''}
                                    </div>
                                </div>
                                <div class="csfp-item-meta">
                                    <span class="csfp-sentiment ${sentimentClass}">${inspector.sentiment}</span>
                                    <small style="opacity: 0.6;">Last visit: ${inspector.updated_at ? new Date(inspector.updated_at).toLocaleDateString() : 'Never'}</small>
                                </div>
                                <div class="csfp-item-actions">
                                    <a href="${profileUrl}" class="csfp-btn csfp-btn-sm csfp-btn-secondary">View Profile</a>
                                    <button class="csfp-btn csfp-btn-sm csfp-btn-secondary" onclick="openQuickVisit(${inspector.id}, '${inspector.name.replace(/'/g, "\\'")}', 'Inspector'); event.stopPropagation();">
                                        + Visit
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
                
                $('#inspectors-list').html(html);
                
                // Update pagination
                updatePagination(data.page, data.total_pages, data.total);
            }
        });
    }
    
    // Update pagination UI
    function updatePagination(currentPage, totalPages, totalItems) {
        if (totalPages <= 1) {
            $('#pagination-container').html('');
            return;
        }
        
        let paginationHtml = '<div class="csfp-pagination-inner">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHtml += `<button class="csfp-btn csfp-btn-sm" onclick="loadInspectorsPage(${currentPage - 1})">← Previous</button>`;
        }
        
        // Page numbers
        paginationHtml += '<div class="csfp-page-numbers">';
        
        // Show first page
        if (currentPage > 3) {
            paginationHtml += `<button class="csfp-page-num" onclick="loadInspectorsPage(1)">1</button>`;
            if (currentPage > 4) {
                paginationHtml += '<span class="csfp-page-dots">...</span>';
            }
        }
        
        // Show pages around current
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationHtml += `<button class="csfp-page-num ${i === currentPage ? 'active' : ''}" onclick="loadInspectorsPage(${i})">${i}</button>`;
        }
        
        // Show last page
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                paginationHtml += '<span class="csfp-page-dots">...</span>';
            }
            paginationHtml += `<button class="csfp-page-num" onclick="loadInspectorsPage(${totalPages})">${totalPages}</button>`;
        }
        
        paginationHtml += '</div>';
        
        // Next button
        if (currentPage < totalPages) {
            paginationHtml += `<button class="csfp-btn csfp-btn-sm" onclick="loadInspectorsPage(${currentPage + 1})">Next →</button>`;
        }
        
        // Page info
        paginationHtml += `<div class="csfp-page-info">${((currentPage - 1) * perPage + 1)}-${Math.min(currentPage * perPage, totalItems)} of ${totalItems}</div>`;
        
        paginationHtml += '</div>';
        
        $('#pagination-container').html(paginationHtml);
    }
    
    // Global function to load specific page
    window.loadInspectorsPage = function(page) {
        loadInspectors(page);
        // Scroll to top of list
        $('html, body').animate({
            scrollTop: $('#inspectors-list').offset().top - 100
        }, 300);
    }
    
    // Initial load
    loadInspectors();
    
    // Filter changes
    $('#filter-city, #filter-role, #filter-sentiment').on('change', loadInspectors);
    
    // Add inspector button
    $('#add-inspector-btn').on('click', function() {
        $('#modal-title').text('Add Inspector');
        $('#inspector-form')[0].reset();
        $('#inspector-id').val('');
        $('#inspector-modal').addClass('active');
    });
    
    // Define closeModal function globally
    window.closeModal = function() {
        $('#inspector-modal').removeClass('active');
    };
    
    // Close modal
    $('.csfp-modal-close').on('click', closeModal);
    
    // Submit form
    $('#inspector-form').on('submit', function(e) {
        e.preventDefault();
        
        const data = {
            action: 'csfp_save_inspector',
            nonce: csfp_ajax.nonce,
            id: $('#inspector-id').val(),
            name: $('#inspector-name').val(),
            city: $('#inspector-city').val(),
            market: $('#inspector-market').val(),
            rfm: $('#inspector-rfm').val(),
            cat_local: $('#inspector-cat-local').val(),
            is_mentor: $('#inspector-mentor').is(':checked') ? 1 : 0,
            sentiment: $('#inspector-sentiment').val(),
            personal_notes: $('#inspector-notes').val()
        };
        
        $.post(csfp_ajax.ajax_url, data, function(response) {
            if (response.success) {
                closeModal();
                loadInspectors();
                alert('Inspector saved successfully!');
            } else {
                alert('Error saving inspector: ' + response.data);
            }
        });
    });
    
    // Quick Visit Form
    $('#quick-visit-form').on('submit', function(e) {
        e.preventDefault();
        
        const data = {
            action: 'csfp_add_engagement',
            nonce: csfp_ajax.nonce,
            inspector_id: $('#quick-inspector-id').val(),
            sentiment: $('#visit-sentiment').val(),
            notes: $('#visit-notes').val(),
            follow_up_needed: $('#visit-follow-up').is(':checked')
        };
        
        $.post(csfp_ajax.ajax_url, data, function(response) {
            if (response.success) {
                closeQuickVisit();
                loadInspectors();
                // Redirect to visits page
                window.location.href = '<?php echo get_permalink(get_option('csfp_visits_page_id')); ?>?new_visit=1';
            } else {
                alert('Error saving visit: ' + response.data);
            }
        });
    });
});

// Handle card click
function handleCardClick(event, url) {
    // Check if the click was on a button or link
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.closest('button') || event.target.closest('a')) {
        return;
    }
    window.location.href = url;
}

// Quick Visit Functions
let visitRecorder = null;
let currentTranscription = null;

function openQuickVisit(inspectorId, name, type) {
    jQuery('#quick-visit-modal').addClass('active').show();
    jQuery('#quick-visit-name').text(name);
    jQuery('#quick-inspector-id').val(inspectorId);
    jQuery('#quick-inspector-type').val(type);
    switchVisitTab('text');
}

function closeQuickVisit() {
    jQuery('#quick-visit-modal').removeClass('active').hide();
    jQuery('#quick-visit-form')[0].reset();
    if (visitRecorder) {
        visitRecorder.reset();
    }
    currentTranscription = null;
    jQuery('#visit-transcription').hide();
    jQuery('#save-voice-visit').hide();
}

function switchVisitTab(tab) {
    jQuery('.csfp-visit-tabs .csfp-tab').removeClass('active');
    jQuery('.csfp-visit-tabs .csfp-tab:contains("' + (tab === 'text' ? 'Text Entry' : 'Voice Recording') + '")').addClass('active');
    
    jQuery('.csfp-tab-content').hide();
    jQuery('#' + (tab === 'text' ? 'text-entry-tab' : 'voice-entry-tab')).show();
}

async function startVisitRecording() {
    // Load voice recorder if needed
    if (!window.CSFPVoiceRecorder) {
        await loadVoiceRecorder();
    }
    
    if (!visitRecorder) {
        visitRecorder = new CSFPVoiceRecorder();
    }
    
    visitRecorder.startRecording();
    updateVisitRecordingUI('recording');
}

function stopVisitRecording() {
    if (visitRecorder) {
        visitRecorder.stopRecording();
        updateVisitRecordingUI('stopped');
    }
}

function updateVisitRecordingUI(state) {
    const startBtn = document.getElementById('start-visit-recording');
    const stopBtn = document.getElementById('stop-visit-recording');
    const transcribeBtn = document.getElementById('transcribe-recording');
    const statusElement = document.getElementById('visit-recording-status');
    
    switch (state) {
        case 'recording':
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;
            if (transcribeBtn) transcribeBtn.disabled = true;
            if (statusElement) {
                statusElement.textContent = 'Recording...';
                statusElement.className = 'csfp-recording-active';
            }
            break;
            
        case 'stopped':
            if (startBtn) startBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = true;
            if (transcribeBtn) transcribeBtn.disabled = false;
            if (statusElement) {
                statusElement.textContent = 'Recording complete';
                statusElement.className = 'csfp-recording-complete';
            }
            break;
    }
}

async function transcribeVisitRecording() {
    if (!visitRecorder || !visitRecorder.currentBlob) {
        alert('No recording to transcribe');
        return;
    }
    
    const transcribeBtn = document.getElementById('transcribe-recording');
    transcribeBtn.disabled = true;
    transcribeBtn.textContent = 'Transcribing...';
    
    try {
        // Send to AI for transcription
        const formData = new FormData();
        formData.append('action', 'csfp_transcribe_visit');
        formData.append('nonce', csfp_ajax.nonce);
        formData.append('audio', visitRecorder.currentBlob, 'visit_recording.webm');
        
        const response = await jQuery.ajax({
            url: csfp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false
        });
        
        if (response.success) {
            currentTranscription = response.data;
            
            // Display raw transcript
            jQuery('#transcription-text').text(currentTranscription.transcription);
            
            // Display formatted transcript if available
            if (currentTranscription.formatted_transcript && currentTranscription.formatted_transcript.length > 0) {
                let chatHtml = '';
                currentTranscription.formatted_transcript.forEach(msg => {
                    const isUser = msg.speaker && msg.speaker.includes(jQuery('#quick-visit-name').text());
                    chatHtml += `
                        <div class="csfp-chat-message ${isUser ? 'csfp-chat-other' : 'csfp-chat-user'}">
                            <div class="csfp-chat-speaker">${msg.speaker}</div>
                            <div class="csfp-chat-bubble">${msg.text}</div>
                            ${msg.timestamp ? `<div class="csfp-chat-time">${msg.timestamp}</div>` : ''}
                        </div>
                    `;
                });
                jQuery('#transcript-messages').html(chatHtml);
                jQuery('#formatted-transcript').show();
            }
            
            // Display summary
            jQuery('#summary-text').text(currentTranscription.summary);
            
            // Display key points
            if (currentTranscription.key_points && currentTranscription.key_points.length > 0) {
                let keyPointsHtml = '';
                currentTranscription.key_points.forEach(point => {
                    keyPointsHtml += `<li>${point}</li>`;
                });
                jQuery('#key-points-list').html(keyPointsHtml);
                jQuery('#key-points').show();
            }
            
            // Display action items
            if (currentTranscription.action_items && currentTranscription.action_items.length > 0) {
                let actionItemsHtml = '';
                currentTranscription.action_items.forEach(item => {
                    actionItemsHtml += `<li>${item}</li>`;
                });
                jQuery('#action-items-list').html(actionItemsHtml);
                jQuery('#action-items').show();
            }
            
            // Set sentiment and follow-up
            jQuery('#ai-sentiment').val(currentTranscription.sentiment);
            jQuery('#ai-follow-up').prop('checked', currentTranscription.follow_up_needed);
            
            jQuery('#visit-transcription').show();
            jQuery('#save-voice-visit').show();
            transcribeBtn.style.display = 'none';
        } else {
            throw new Error(response.data || 'Transcription failed');
        }
    } catch (error) {
        alert('Failed to transcribe: ' + error.message);
        transcribeBtn.disabled = false;
        transcribeBtn.textContent = 'Transcribe & Analyze';
    }
}

async function saveVoiceVisit() {
    if (!currentTranscription) {
        alert('No transcription available');
        return;
    }
    
    const data = {
        action: 'csfp_add_engagement',
        nonce: csfp_ajax.nonce,
        inspector_id: jQuery('#quick-inspector-id').val(),
        sentiment: jQuery('#ai-sentiment').val(),
        notes: currentTranscription.summary || currentTranscription.transcription,
        follow_up_needed: jQuery('#ai-follow-up').is(':checked'),
        transcription: JSON.stringify({
            raw: currentTranscription.transcription,
            formatted: currentTranscription.formatted_transcript,
            key_points: currentTranscription.key_points,
            action_items: currentTranscription.action_items
        }),
        audio_url: currentTranscription.audio_url
    };
    
    jQuery.post(csfp_ajax.ajax_url, data, function(response) {
        if (response.success) {
            closeQuickVisit();
            loadInspectors();
            alert('Voice visit saved successfully!');
        } else {
            alert('Error saving visit: ' + response.data);
        }
    });
}

function loadVoiceRecorder() {
    return new Promise((resolve) => {
        if (window.CSFPVoiceRecorder) {
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = '<?php echo CSFP_PLUGIN_URL; ?>assets/js/csfp-voice-recorder.js';
            script.onload = resolve;
            document.head.appendChild(script);
        }
    });
}
</script>