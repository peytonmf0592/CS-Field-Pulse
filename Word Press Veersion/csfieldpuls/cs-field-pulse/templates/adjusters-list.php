<?php
/**
 * Adjusters list template
 */
?>

<div class="csfp-container">
    <?php CSFP_Navigation::render(); ?>
    
    <!-- Clean Page Header -->
    <div class="csfp-page-header">
        <h1 class="csfp-page-title">
            <span class="csfp-hex-icon adjusters"></span>
            Adjusters
        </h1>
    </div>
    
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
            <label class="csfp-filter-label">Carrier</label>
            <select id="filter-carrier" class="csfp-filter-select">
                <option value="">All Carriers</option>
                <?php
                $carriers = CSFP_Database::get_all_carriers();
                foreach ($carriers as $carrier) {
                    echo '<option value="' . esc_attr($carrier) . '">' . esc_html($carrier) . '</option>';
                }
                ?>
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
            <button id="add-adjuster-btn" class="csfp-btn">
                <span>+</span> Add Adjuster
            </button>
        </div>
    </div>
    
    <!-- List -->
    <div id="adjusters-list" class="csfp-list">
        <!-- Adjuster items will be loaded here -->
    </div>
    
    <!-- Pagination -->
    <div id="pagination-container" class="csfp-pagination">
        <!-- Pagination will be loaded here -->
    </div>
    
    <!-- Add/Edit Modal -->
    <div id="adjuster-modal" class="csfp-modal">
        <div class="csfp-modal-content">
            <button class="csfp-modal-close">&times;</button>
            <h2 id="modal-title">Add Adjuster</h2>
            
            <form id="adjuster-form">
                <input type="hidden" id="adjuster-id" value="">
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Name *</label>
                    <input type="text" id="adjuster-name" class="csfp-form-input" required>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">City *</label>
                    <input type="text" id="adjuster-city" class="csfp-form-input" required>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Market</label>
                    <input type="text" id="adjuster-market" class="csfp-form-input">
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Carrier</label>
                    <input type="text" id="adjuster-carrier" class="csfp-form-input">
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Initial Sentiment</label>
                    <select id="adjuster-sentiment" class="csfp-filter-select">
                        <option value="Passive">Passive</option>
                        <option value="Promoter">Promoter</option>
                        <option value="Detractor">Detractor</option>
                    </select>
                </div>
                
                <div class="csfp-form-group">
                    <label class="csfp-form-label">Personal Notes</label>
                    <textarea id="adjuster-notes" class="csfp-form-textarea"></textarea>
                </div>
                
                <button type="submit" class="csfp-btn">Save Adjuster</button>
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
                    <input type="hidden" id="quick-adjuster-id">
                    <input type="hidden" id="quick-adjuster-type">
                    
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
                        <h4>Transcription</h4>
                        <div id="transcription-text" class="csfp-glass" style="padding: 1rem; margin: 1rem 0; max-height: 200px; overflow-y: auto;"></div>
                        
                        <div class="csfp-form-group">
                            <label for="ai-sentiment">AI Suggested Sentiment</label>
                            <select id="ai-sentiment">
                                <option value="Promoter">Promoter</option>
                                <option value="Passive">Passive</option>
                                <option value="Detractor">Detractor</option>
                            </select>
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
    
    // Load adjusters
    function loadAdjusters(page = 1) {
        currentPage = page;
        const filters = {
            city: $('#filter-city').val(),
            carrier: $('#filter-carrier').val(),
            sentiment: $('#filter-sentiment').val()
        };
        
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_filter_adjusters',
            nonce: csfp_ajax.nonce,
            page: currentPage,
            per_page: perPage,
            ...filters
        }, function(response) {
            if (response.success) {
                const data = response.data;
                const adjusters = data.items || [];
                let html = '';
                
                if (adjusters.length === 0) {
                    html = '<div class="csfp-glass csfp-card"><p>No adjusters found matching your criteria.</p></div>';
                } else {
                    html = adjusters.map(adjuster => {
                        const initials = adjuster.name.split(' ').map(n => n[0]).join('').toUpperCase();
                        const sentimentClass = 'csfp-sentiment-' + adjuster.sentiment.toLowerCase();
                        const profileUrl = '<?php echo get_permalink(get_option('csfp_profile_page_id')); ?>?id=' + adjuster.id;
                        
                        return `
                            <div class="csfp-glass csfp-card csfp-list-item" onclick="handleCardClick(event, ${adjuster.id})" style="cursor: pointer;">
                                <div class="csfp-avatar">${initials}</div>
                                <div class="csfp-item-content">
                                    <div class="csfp-item-name">${adjuster.name}</div>
                                    <div class="csfp-item-details">
                                        <span>${adjuster.carrier || 'N/A'}</span>
                                        <span>${adjuster.city || 'N/A'}</span>
                                        <span>${adjuster.market || 'N/A'}</span>
                                    </div>
                                </div>
                                <div class="csfp-item-meta">
                                    <span class="csfp-sentiment ${sentimentClass}">${adjuster.sentiment}</span>
                                    <small style="opacity: 0.6;">Last visit: ${adjuster.updated_at ? new Date(adjuster.updated_at).toLocaleDateString() : 'Never'}</small>
                                </div>
                                <div class="csfp-item-actions">
                                    <a href="${profileUrl}" class="csfp-btn csfp-btn-sm csfp-btn-secondary" onclick="event.stopPropagation();">View Profile</a>
                                    <button class="csfp-btn csfp-btn-sm csfp-btn-secondary" onclick="event.stopPropagation(); openQuickVisit(${adjuster.id}, '${adjuster.name.replace(/'/g, "\\'")}', 'Adjuster')">
                                        + Visit
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
                
                $('#adjusters-list').html(html);
                
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
            paginationHtml += `<button class="csfp-btn csfp-btn-sm" onclick="loadAdjustersPage(${currentPage - 1})">← Previous</button>`;
        }
        
        // Page numbers
        paginationHtml += '<div class="csfp-page-numbers">';
        
        // Show first page
        if (currentPage > 3) {
            paginationHtml += `<button class="csfp-page-num" onclick="loadAdjustersPage(1)">1</button>`;
            if (currentPage > 4) {
                paginationHtml += '<span class="csfp-page-dots">...</span>';
            }
        }
        
        // Show pages around current
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationHtml += `<button class="csfp-page-num ${i === currentPage ? 'active' : ''}" onclick="loadAdjustersPage(${i})">${i}</button>`;
        }
        
        // Show last page
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                paginationHtml += '<span class="csfp-page-dots">...</span>';
            }
            paginationHtml += `<button class="csfp-page-num" onclick="loadAdjustersPage(${totalPages})">${totalPages}</button>`;
        }
        
        paginationHtml += '</div>';
        
        // Next button
        if (currentPage < totalPages) {
            paginationHtml += `<button class="csfp-btn csfp-btn-sm" onclick="loadAdjustersPage(${currentPage + 1})">Next →</button>`;
        }
        
        // Page info
        paginationHtml += `<div class="csfp-page-info">${((currentPage - 1) * perPage + 1)}-${Math.min(currentPage * perPage, totalItems)} of ${totalItems}</div>`;
        
        paginationHtml += '</div>';
        
        $('#pagination-container').html(paginationHtml);
    }
    
    // Global function to load specific page
    window.loadAdjustersPage = function(page) {
        loadAdjusters(page);
        // Scroll to top of list
        $('html, body').animate({
            scrollTop: $('#adjusters-list').offset().top - 100
        }, 300);
    }
    
    // Initial load
    loadAdjusters();
    
    // Filter changes
    $('#filter-city, #filter-carrier, #filter-sentiment').on('change', loadAdjusters);
    
    // Add adjuster button
    $('#add-adjuster-btn').on('click', function() {
        $('#modal-title').text('Add Adjuster');
        $('#adjuster-form')[0].reset();
        $('#adjuster-id').val('');
        $('#adjuster-modal').addClass('active');
    });
    
    // Define closeModal function globally
    window.closeModal = function() {
        $('#adjuster-modal').removeClass('active');
    };
    
    // Close modal
    $('.csfp-modal-close').on('click', closeModal);
    
    // Submit form
    $('#adjuster-form').on('submit', function(e) {
        e.preventDefault();
        
        const data = {
            action: 'csfp_save_adjuster',
            nonce: csfp_ajax.nonce,
            id: $('#adjuster-id').val(),
            name: $('#adjuster-name').val(),
            city: $('#adjuster-city').val(),
            market: $('#adjuster-market').val(),
            carrier: $('#adjuster-carrier').val(),
            sentiment: $('#adjuster-sentiment').val(),
            personal_notes: $('#adjuster-notes').val()
        };
        
        $.post(csfp_ajax.ajax_url, data, function(response) {
            if (response.success) {
                closeModal();
                loadAdjusters();
                alert('Adjuster saved successfully!');
            } else {
                alert('Error saving adjuster: ' + response.data);
            }
        });
    });
    
    // Quick Visit Form
    $('#quick-visit-form').on('submit', function(e) {
        e.preventDefault();
        
        const data = {
            action: 'csfp_add_engagement',
            nonce: csfp_ajax.nonce,
            adjuster_id: $('#quick-adjuster-id').val(),
            sentiment: $('#visit-sentiment').val(),
            notes: $('#visit-notes').val(),
            follow_up_needed: $('#visit-follow-up').is(':checked')
        };
        
        $.post(csfp_ajax.ajax_url, data, function(response) {
            if (response.success) {
                closeQuickVisit();
                loadAdjusters();
                // Redirect to visits page
                window.location.href = '<?php echo get_permalink(get_option('csfp_visits_page_id')); ?>?new_visit=1';
            } else {
                alert('Error saving visit: ' + response.data);
            }
        });
    });
});

// Quick Visit Functions
let visitRecorder = null;
let currentTranscription = null;

function openQuickVisit(adjusterId, name, type) {
    jQuery('#quick-visit-modal').addClass('active').show();
    jQuery('#quick-visit-name').text(name);
    jQuery('#quick-adjuster-id').val(adjusterId);
    jQuery('#quick-adjuster-type').val(type);
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
            jQuery('#transcription-text').text(currentTranscription.transcription);
            jQuery('#ai-sentiment').val(currentTranscription.sentiment);
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
        adjuster_id: jQuery('#quick-adjuster-id').val(),
        sentiment: jQuery('#ai-sentiment').val(),
        notes: currentTranscription.summary || currentTranscription.transcription,
        follow_up_needed: currentTranscription.follow_up_needed || false,
        transcription: currentTranscription.transcription,
        audio_url: currentTranscription.audio_url
    };
    
    jQuery.post(csfp_ajax.ajax_url, data, function(response) {
        if (response.success) {
            closeQuickVisit();
            loadAdjusters();
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

// Handle card click to navigate to profile
function handleCardClick(event, adjusterId) {
    // Only navigate if the click was on the card itself, not on buttons
    if (!event.target.closest('.csfp-btn')) {
        const profileUrl = '<?php echo get_permalink(get_option('csfp_profile_page_id')); ?>?id=' + adjusterId;
        window.location.href = profileUrl;
    }
}
</script>