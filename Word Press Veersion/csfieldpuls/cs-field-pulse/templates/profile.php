<?php
/**
 * Profile template
 */

// Get inspector/adjuster data
$id = intval($_GET['id']);
$inspector = CSFP_Database::get_inspector($id);

if (!$inspector) {
    echo '<div class="csfp-container"><p>Profile not found.</p></div>';
    return;
}

// Get engagements
$engagements = CSFP_Database::get_engagements($id);

// Get sentiment changes
$sentiment_changes = CSFP_Database::get_sentiment_changes($id);

// Get media
global $wpdb;
$media = $wpdb->get_results($wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}csfp_media WHERE inspector_id = %d ORDER BY uploaded_at DESC",
    $id
));

// Check for active tour
$current_user = wp_get_current_user();
require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';
$active_tour = CSFP_Market_Tour::get_active_tour($current_user->ID);

// Get latest sentiment change info
$latest_change = !empty($sentiment_changes) ? $sentiment_changes[0] : null;
?>

<div class="csfp-container">
    <?php CSFP_Navigation::render(); ?>
    
    <!-- Profile Header -->
    <div class="csfp-glass csfp-profile-header">
        <div class="csfp-profile-avatar">
            <?php 
            $initials = implode('', array_map(function($name) {
                return strtoupper($name[0]);
            }, explode(' ', $inspector->name)));
            echo esc_html($initials);
            ?>
        </div>
        <div class="csfp-profile-info">
            <h1 class="csfp-title" data-page="profile"><?php echo esc_html($inspector->name); ?></h1>
            <div class="csfp-profile-meta">
                <span><?php echo esc_html($inspector->role); ?></span>
                <span><?php echo esc_html($inspector->city); ?></span>
                <span><?php echo esc_html($inspector->market); ?></span>
                <?php if ($inspector->role === 'Inspector'): ?>
                    <span><?php echo esc_html($inspector->cat_local); ?></span>
                    <?php if ($inspector->is_mentor): ?>
                        <span class="csfp-badge">Mentor</span>
                    <?php endif; ?>
                <?php else: ?>
                    <span><?php echo esc_html($inspector->carrier); ?></span>
                <?php endif; ?>
            </div>
        </div>
        <div class="csfp-profile-actions">
            <div class="csfp-sentiment csfp-sentiment-<?php echo strtolower($inspector->sentiment); ?>">
                <?php echo esc_html($inspector->sentiment); ?>
            </div>
            <button class="csfp-btn csfp-btn-secondary" onclick="openSentimentModal()">
                Change Sentiment
            </button>
            <button class="csfp-btn csfp-btn-secondary" onclick="openEditModal()">
                Edit Profile
            </button>
        </div>
    </div>
    
    <?php if ($latest_change): ?>
        <div class="csfp-glass csfp-card" style="margin-bottom: 1rem;">
            <p style="opacity: 0.8; margin: 0;">
                Sentiment changed from <?php echo esc_html($latest_change->old_sentiment); ?> 
                to <?php echo esc_html($latest_change->new_sentiment); ?> 
                by <?php echo esc_html($latest_change->user_name); ?> 
                on <?php echo date('M j, Y', strtotime($latest_change->changed_at)); ?>
                <?php if ($latest_change->reason): ?>
                    - "<?php echo esc_html($latest_change->reason); ?>"
                <?php endif; ?>
            </p>
        </div>
    <?php endif; ?>
    
    <!-- Quick Actions -->
    <div class="csfp-glass csfp-card">
        <h2>Quick Actions</h2>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="csfp-btn csfp-btn-primary" onclick="openEngagementModal()">
                + Log Engagement
            </button>
            <button class="csfp-btn csfp-btn-secondary" onclick="openMediaModal()">
                📷 Upload Media
            </button>
            <button class="csfp-btn csfp-btn-danger" onclick="deleteProfile()">
                Delete Profile
            </button>
        </div>
    </div>
    
    <!-- Personal Notes -->
    <?php if ($inspector->personal_notes): ?>
        <div class="csfp-glass csfp-card">
            <h2>Personal Notes</h2>
            <p><?php echo nl2br(esc_html($inspector->personal_notes)); ?></p>
        </div>
    <?php endif; ?>
    
    <!-- Media Gallery -->
    <?php if ($media): ?>
        <div class="csfp-glass csfp-card">
            <h2>Media Gallery</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                <?php foreach ($media as $item): ?>
                    <div class="csfp-media-item">
                        <?php if ($item->media_type === 'photo'): ?>
                            <img src="<?php echo esc_url($item->media_url); ?>" alt="Photo" style="width: 100%; border-radius: 8px;">
                        <?php else: ?>
                            <audio controls style="width: 100%;">
                                <source src="<?php echo esc_url($item->media_url); ?>" type="audio/mpeg">
                            </audio>
                        <?php endif; ?>
                        <?php if ($item->caption): ?>
                            <p style="margin-top: 0.5rem; font-size: 0.875rem;"><?php echo esc_html($item->caption); ?></p>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>
    
    <!-- Engagement History -->
    <div class="csfp-glass csfp-card">
        <h2>Timeline</h2>
        <div class="csfp-timeline">
            <?php
            // Combine engagements and sentiment changes
            $timeline = array();
            
            foreach ($engagements as $engagement) {
                $timeline[] = array(
                    'type' => 'engagement',
                    'date' => $engagement->engagement_date,
                    'data' => $engagement
                );
            }
            
            foreach ($sentiment_changes as $change) {
                $timeline[] = array(
                    'type' => 'sentiment_change',
                    'date' => $change->changed_at,
                    'data' => $change
                );
            }
            
            // Sort by date
            usort($timeline, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            if (empty($timeline)) {
                echo '<p>No activity recorded yet.</p>';
            } else {
                foreach ($timeline as $item) {
                    echo '<div class="csfp-glass csfp-timeline-item">';
                    
                    if ($item['type'] === 'engagement') {
                        $eng = $item['data'];
                        echo '<h4>Engagement by ' . esc_html($eng->user_name) . '</h4>';
                        echo '<div class="csfp-meta">';
                        echo '<span class="csfp-sentiment csfp-sentiment-' . strtolower($eng->sentiment) . '">' . esc_html($eng->sentiment) . '</span>';
                        echo '<span>' . date('M j, Y g:i A', strtotime($eng->engagement_date)) . '</span>';
                        if ($eng->follow_up_needed) {
                            echo '<span style="color: var(--csfp-red);">Follow-up needed</span>';
                        }
                        echo '</div>';
                        if ($eng->notes) {
                            echo '<p>' . nl2br(esc_html($eng->notes)) . '</p>';
                        }
                    } else {
                        $change = $item['data'];
                        echo '<h4>Sentiment Changed</h4>';
                        echo '<div class="csfp-meta">';
                        echo '<span>' . esc_html($change->old_sentiment) . ' → ' . esc_html($change->new_sentiment) . '</span>';
                        echo '<span>by ' . esc_html($change->user_name) . '</span>';
                        echo '<span>' . date('M j, Y g:i A', strtotime($change->changed_at)) . '</span>';
                        echo '</div>';
                        if ($change->reason) {
                            echo '<p>Reason: ' . esc_html($change->reason) . '</p>';
                        }
                    }
                    
                    echo '</div>';
                }
            }
            ?>
        </div>
    </div>
</div>

<!-- Edit Profile Modal -->
<div id="edit-profile-modal" class="csfp-modal">
    <div class="csfp-modal-content csfp-glass">
        <h2>Edit Profile</h2>
        <form id="edit-profile-form" class="csfp-form">
            <input type="hidden" name="id" value="<?php echo $inspector->id; ?>">
            
            <div class="csfp-form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" value="<?php echo esc_attr($inspector->name); ?>" required>
            </div>
            
            <div class="csfp-form-row">
                <div class="csfp-form-group">
                    <label for="city">City</label>
                    <input type="text" id="city" name="city" value="<?php echo esc_attr($inspector->city); ?>">
                </div>
                
                <div class="csfp-form-group">
                    <label for="market">Market</label>
                    <input type="text" id="market" name="market" value="<?php echo esc_attr($inspector->market); ?>">
                </div>
            </div>
            
            <?php if ($inspector->role === 'Inspector'): ?>
                <div class="csfp-form-row">
                    <div class="csfp-form-group">
                        <label for="rfm">RFM</label>
                        <input type="text" id="rfm" name="rfm" value="<?php echo esc_attr($inspector->rfm); ?>">
                    </div>
                    
                    <div class="csfp-form-group">
                        <label for="cat_local">Type</label>
                        <select id="cat_local" name="cat_local">
                            <option value="CAT" <?php selected($inspector->cat_local, 'CAT'); ?>>CAT</option>
                            <option value="Local" <?php selected($inspector->cat_local, 'Local'); ?>>Local</option>
                            <option value="Mentor" <?php selected($inspector->cat_local, 'Mentor'); ?>>Mentor</option>
                        </select>
                    </div>
                </div>
                
                <div class="csfp-form-group">
                    <label>
                        <input type="checkbox" name="is_mentor" value="1" <?php checked($inspector->is_mentor, 1); ?>>
                        Is Mentor
                    </label>
                </div>
            <?php else: ?>
                <div class="csfp-form-group">
                    <label for="carrier">Carrier</label>
                    <input type="text" id="carrier" name="carrier" value="<?php echo esc_attr($inspector->carrier); ?>">
                </div>
            <?php endif; ?>
            
            <div class="csfp-form-group">
                <label for="sentiment">Sentiment</label>
                <select id="sentiment" name="sentiment">
                    <option value="Promoter" <?php selected($inspector->sentiment, 'Promoter'); ?>>Promoter</option>
                    <option value="Passive" <?php selected($inspector->sentiment, 'Passive'); ?>>Passive</option>
                    <option value="Detractor" <?php selected($inspector->sentiment, 'Detractor'); ?>>Detractor</option>
                </select>
            </div>
            
            <div class="csfp-form-group">
                <label for="personal_notes">Personal Notes</label>
                <textarea id="personal_notes" name="personal_notes" rows="4"><?php echo esc_textarea($inspector->personal_notes); ?></textarea>
            </div>
            
            <div class="csfp-modal-actions">
                <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="csfp-btn csfp-btn-primary">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- Change Sentiment Modal -->
<div id="change-sentiment-modal" class="csfp-modal">
    <div class="csfp-modal-content csfp-glass">
        <h2>Change Sentiment</h2>
        <form id="change-sentiment-form" class="csfp-form">
            <input type="hidden" name="inspector_id" value="<?php echo $inspector->id; ?>">
            
            <div class="csfp-form-group">
                <label>Current Sentiment</label>
                <div class="csfp-sentiment csfp-sentiment-<?php echo strtolower($inspector->sentiment); ?>">
                    <?php echo esc_html($inspector->sentiment); ?>
                </div>
            </div>
            
            <div class="csfp-form-group">
                <label for="new_sentiment">New Sentiment</label>
                <select id="new_sentiment" name="new_sentiment" required>
                    <option value="">Select Sentiment</option>
                    <option value="Promoter" <?php echo $inspector->sentiment === 'Promoter' ? 'disabled' : ''; ?>>Promoter</option>
                    <option value="Passive" <?php echo $inspector->sentiment === 'Passive' ? 'disabled' : ''; ?>>Passive</option>
                    <option value="Detractor" <?php echo $inspector->sentiment === 'Detractor' ? 'disabled' : ''; ?>>Detractor</option>
                </select>
            </div>
            
            <div class="csfp-form-group">
                <label for="reason">Reason for Change (Optional)</label>
                <textarea id="reason" name="reason" rows="3"></textarea>
            </div>
            
            <div class="csfp-modal-actions">
                <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeSentimentModal()">Cancel</button>
                <button type="submit" class="csfp-btn csfp-btn-primary">Update Sentiment</button>
            </div>
        </form>
    </div>
</div>

<!-- Add Engagement Modal -->
<div id="add-engagement-modal" class="csfp-modal">
    <div class="csfp-modal-content csfp-glass">
        <h2>Log Engagement</h2>
        <form id="add-engagement-form" class="csfp-form">
            <input type="hidden" name="inspector_id" value="<?php echo $inspector->id; ?>">
            <?php if ($active_tour): ?>
                <input type="hidden" name="tour_id" value="<?php echo $active_tour->id; ?>">
                <div class="csfp-form-group" style="background: rgba(0, 255, 136, 0.1); padding: 1rem; border-radius: 8px;">
                    <p style="margin: 0;">🔴 This engagement will be linked to your active tour: <strong><?php echo esc_html($active_tour->market_name); ?></strong></p>
                </div>
            <?php endif; ?>
            
            <div class="csfp-form-group">
                <label for="engagement_sentiment">Sentiment</label>
                <select id="engagement_sentiment" name="sentiment" required>
                    <option value="Promoter">Promoter</option>
                    <option value="Passive">Passive</option>
                    <option value="Detractor">Detractor</option>
                </select>
            </div>
            
            <div class="csfp-form-group">
                <label for="notes">Notes</label>
                <textarea id="notes" name="notes" rows="4" required></textarea>
            </div>
            
            <div class="csfp-form-group">
                <label>
                    <input type="checkbox" name="follow_up_needed" value="1">
                    Follow-up Needed
                </label>
            </div>
            
            <?php if ($active_tour): ?>
                <div class="csfp-form-group">
                    <label>Common Issues</label>
                    <div class="csfp-checkbox-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <label><input type="checkbox" name="common_issues[]" value="Vehicle not branded"> Vehicle not branded</label>
                        <label><input type="checkbox" name="common_issues[]" value="No scope sheet on roof"> No scope sheet on roof</label>
                        <label><input type="checkbox" name="common_issues[]" value="Attitude issues"> Attitude issues</label>
                        <label><input type="checkbox" name="common_issues[]" value="Late arrival"> Late arrival</label>
                        <label><input type="checkbox" name="common_issues[]" value="Missing equipment"> Missing equipment</label>
                        <label><input type="checkbox" name="common_issues[]" value="Uniform compliance"> Uniform compliance</label>
                    </div>
                </div>
                
                <div class="csfp-form-group">
                    <label for="competitor_intel">Competitor Intelligence</label>
                    <textarea id="competitor_intel" name="competitor_intel" rows="2"></textarea>
                </div>
                
                <div class="csfp-form-group">
                    <label for="market_dynamics">Market Dynamics</label>
                    <textarea id="market_dynamics" name="market_dynamics" rows="2"></textarea>
                </div>
            <?php endif; ?>
            
            <div class="csfp-modal-actions">
                <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeEngagementModal()">Cancel</button>
                <button type="submit" class="csfp-btn csfp-btn-primary">Save Engagement</button>
            </div>
        </form>
    </div>
</div>

<!-- Media Upload Modal -->
<div id="media-upload-modal" class="csfp-modal">
    <div class="csfp-modal-content csfp-glass">
        <button class="csfp-modal-close" onclick="closeMediaModal()">×</button>
        <h2>Upload Media</h2>
        
        <div class="csfp-media-tabs">
            <button class="csfp-tab active" onclick="switchMediaTab('file')">📁 Upload File</button>
            <button class="csfp-tab" onclick="switchMediaTab('voice')">🎤 Record Voice</button>
        </div>
        
        <!-- File Upload Tab -->
        <div id="file-upload-tab" class="csfp-tab-content active">
            <form id="file-upload-form" class="csfp-form">
                <div class="csfp-form-group">
                    <label for="media-file">Select File</label>
                    <input type="file" id="media-file" name="file" accept="image/*,audio/*" required>
                    <p class="csfp-help-text">Supported formats: Images (JPG, PNG) and Audio (MP3, WAV, WEBM)</p>
                </div>
                
                <div class="csfp-form-group">
                    <label for="media-caption">Caption</label>
                    <input type="text" id="media-caption" name="caption" placeholder="Optional caption">
                </div>
                
                <div class="csfp-modal-actions">
                    <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeMediaModal()">Cancel</button>
                    <button type="submit" class="csfp-btn csfp-btn-primary">Upload</button>
                </div>
            </form>
        </div>
        
        <!-- Voice Recording Tab -->
        <div id="voice-recording-tab" class="csfp-tab-content" style="display: none;">
            <div class="csfp-voice-recorder">
                <div class="csfp-recording-controls">
                    <button id="start-recording" class="csfp-btn csfp-btn-primary" onclick="startVoiceRecording()">
                        🔴 Start Recording
                    </button>
                    <button id="stop-recording" class="csfp-btn csfp-btn-danger" onclick="stopVoiceRecording()" disabled>
                        ⏹️ Stop Recording
                    </button>
                </div>
                
                <div class="csfp-recording-info">
                    <div id="recording-status">Ready to record</div>
                    <div id="recording-timer">00:00</div>
                </div>
                
                <div id="voice-preview" class="csfp-voice-preview"></div>
                
                <div class="csfp-form-group">
                    <label for="voice-caption">Caption</label>
                    <input type="text" id="voice-caption" placeholder="Optional caption">
                </div>
                
                <div class="csfp-modal-actions">
                    <button type="button" class="csfp-btn csfp-btn-secondary" onclick="closeMediaModal()">Cancel</button>
                    <button id="upload-recording" class="csfp-btn csfp-btn-primary" onclick="uploadVoiceRecording()" disabled>
                        Upload Recording
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Edit profile form
    $('#edit-profile-form').on('submit', function(e) {
        e.preventDefault();
        
        var action = '<?php echo $inspector->role === 'Inspector' ? 'csfp_save_inspector' : 'csfp_save_adjuster'; ?>';
        
        $.post(csfp_ajax.ajax_url, {
            action: action,
            nonce: csfp_ajax.nonce,
            ...$(this).serializeArray().reduce((obj, item) => {
                obj[item.name] = item.value;
                return obj;
            }, {})
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Failed to save: ' + response.data);
            }
        });
    });
    
    // Change sentiment form
    $('#change-sentiment-form').on('submit', function(e) {
        e.preventDefault();
        
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_update_sentiment',
            nonce: csfp_ajax.nonce,
            ...$(this).serializeArray().reduce((obj, item) => {
                obj[item.name] = item.value;
                return obj;
            }, {})
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Failed to update sentiment: ' + response.data);
            }
        });
    });
    
    // Add engagement form
    $('#add-engagement-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = {};
        $(this).serializeArray().forEach(function(item) {
            if (item.name === 'common_issues[]') {
                if (!formData.common_issues) formData.common_issues = [];
                formData.common_issues.push(item.value);
            } else {
                formData[item.name] = item.value;
            }
        });
        
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_add_engagement',
            nonce: csfp_ajax.nonce,
            ...formData
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Failed to add engagement: ' + response.data);
            }
        });
    });
    
    // File upload form
    $('#file-upload-form').on('submit', function(e) {
        e.preventDefault();
        
        const file = $('#media-file')[0].files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('action', 'csfp_upload_media');
        formData.append('nonce', csfp_ajax.nonce);
        formData.append('inspector_id', <?php echo $inspector->id; ?>);
        formData.append('media_type', file.type.startsWith('image') ? 'photo' : 'voice_memo');
        formData.append('file', file);
        formData.append('caption', $('#media-caption').val());
        
        $.ajax({
            url: csfp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('Failed to upload file: ' + response.data);
                }
            }
        });
    });
});

function openEditModal() {
    jQuery('#edit-profile-modal').addClass('active').show();
}

function closeEditModal() {
    jQuery('#edit-profile-modal').removeClass('active').hide();
}

function openSentimentModal() {
    jQuery('#change-sentiment-modal').addClass('active').show();
}

function closeSentimentModal() {
    jQuery('#change-sentiment-modal').removeClass('active').hide();
}

function openEngagementModal() {
    jQuery('#add-engagement-modal').addClass('active').show();
}

function closeEngagementModal() {
    jQuery('#add-engagement-modal').removeClass('active').hide();
}

function deleteProfile() {
    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
        jQuery.post(csfp_ajax.ajax_url, {
            action: 'csfp_delete_inspector',
            nonce: csfp_ajax.nonce,
            id: <?php echo $inspector->id; ?>
        }, function(response) {
            if (response.success) {
                window.location.href = '<?php echo home_url($inspector->role === 'Inspector' ? '/csfp-inspectors' : '/csfp-adjusters'); ?>';
            } else {
                alert('Failed to delete: ' + response.data);
            }
        });
    }
}

// Media Modal Functions
function openMediaModal() {
    jQuery('#media-upload-modal').addClass('active').show();
}

function closeMediaModal() {
    jQuery('#media-upload-modal').removeClass('active').hide();
    resetMediaModal();
}

function resetMediaModal() {
    // Reset file upload form
    jQuery('#file-upload-form')[0].reset();
    
    // Reset voice recorder if exists
    if (window.voiceRecorder) {
        window.voiceRecorder.reset();
    }
    
    // Switch back to file tab
    switchMediaTab('file');
}

function switchMediaTab(tab) {
    // Update tab buttons
    jQuery('.csfp-media-tabs .csfp-tab').removeClass('active');
    jQuery('.csfp-media-tabs .csfp-tab:contains("' + (tab === 'file' ? 'Upload File' : 'Record Voice') + '")').addClass('active');
    
    // Show/hide tab content
    jQuery('.csfp-tab-content').hide();
    jQuery('#' + (tab === 'file' ? 'file-upload-tab' : 'voice-recording-tab')).show();
}

// Voice Recording Functions
let voiceRecorder = null;

// Load voice recorder script if needed
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

async function startVoiceRecording() {
    await loadVoiceRecorder();
    
    if (!voiceRecorder) {
        voiceRecorder = new CSFPVoiceRecorder();
        window.voiceRecorder = voiceRecorder;
    }
    
    voiceRecorder.startRecording();
}

function stopVoiceRecording() {
    if (voiceRecorder) {
        voiceRecorder.stopRecording();
    }
}

async function uploadVoiceRecording() {
    if (!voiceRecorder || !voiceRecorder.currentBlob) {
        alert('No recording to upload');
        return;
    }
    
    try {
        const caption = jQuery('#voice-caption').val();
        const result = await voiceRecorder.uploadRecording(<?php echo $inspector->id; ?>, caption);
        location.reload();
    } catch (error) {
        alert('Failed to upload recording: ' + error.message);
    }
}
</script>