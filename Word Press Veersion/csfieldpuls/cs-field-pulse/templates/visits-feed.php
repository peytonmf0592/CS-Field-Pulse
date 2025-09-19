<?php
/**
 * Visits Feed template
 */

// Get current user
$current_user = wp_get_current_user();
?>

<div class="csfp-container">
    <?php CSFP_Navigation::render(); ?>
    
    <!-- Clean Page Header -->
    <div class="csfp-page-header">
        <h1 class="csfp-page-title">
            <span class="csfp-hex-icon visits"></span>
            All Visits
        </h1>
    </div>
    <p class="csfp-subtitle" style="text-align: center; margin-bottom: 2rem;">Complete history of all field visits and engagements</p>
    
    <!-- Record Visit Action Button - Separate -->
    <div class="csfp-action-panel" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: center;">
            <button id="quick-visit-btn" class="csfp-btn csfp-btn-primary" style="width: auto; padding: 1rem 2rem;">
                <span style="font-size: 1.2rem;">+</span> RECORD VISIT
            </button>
        </div>
    </div>
    
    <!-- Success Message -->
    <div id="visit-success-message" class="csfp-glass csfp-card" style="display: none; background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,255,136,0.05)); border: 1px solid rgba(0,255,136,0.3); margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 2rem;">✅</span>
            <div>
                <h3 style="margin: 0 0 0.5rem 0; color: var(--csfp-primary);">Visit Recorded Successfully!</h3>
                <p style="margin: 0;">Your visit has been saved. You can review it below or continue recording more visits.</p>
            </div>
        </div>
    </div>
    
    <!-- Filters -->
    <div class="csfp-glass csfp-filters">
        <div class="csfp-filter-group">
            <label class="csfp-filter-label">Date Range</label>
            <select id="filter-date-range" class="csfp-filter-select">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
            </select>
        </div>
        
        <div class="csfp-filter-group">
            <label class="csfp-filter-label">Type</label>
            <select id="filter-type" class="csfp-filter-select">
                <option value="">All Types</option>
                <option value="Inspector">Inspectors Only</option>
                <option value="Adjuster">Adjusters Only</option>
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
            <label class="csfp-filter-label">CS Team Member</label>
            <select id="filter-user" class="csfp-filter-select">
                <option value="">All Team Members</option>
                <?php
                $users = get_users(array('role__in' => array('administrator', 'editor', 'author')));
                foreach ($users as $user) {
                    echo '<option value="' . $user->ID . '">' . esc_html($user->display_name) . '</option>';
                }
                ?>
            </select>
        </div>
        
        <div class="csfp-filter-group">
            <button id="export-visits" class="csfp-btn csfp-btn-secondary">
                📥 Export to CSV
            </button>
        </div>
    </div>
    
    <!-- Stats Summary -->
    <div class="csfp-stats-grid">
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="total-visits-count">0</div>
            <div class="csfp-stat-label">Total Visits</div>
        </div>
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="visits-today">0</div>
            <div class="csfp-stat-label">Visits Today</div>
        </div>
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="follow-ups-needed">0</div>
            <div class="csfp-stat-label">Follow-ups Needed</div>
        </div>
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="voice-visits">0</div>
            <div class="csfp-stat-label">Voice Visits</div>
        </div>
    </div>
    
    <!-- Visits Feed -->
    <div id="visits-feed" class="csfp-visits-feed">
        <!-- Visit items will be loaded here -->
    </div>
    
    <!-- Load More -->
    <div class="csfp-load-more-container" style="text-align: center; margin-top: 2rem;">
        <button id="load-more-visits" class="csfp-btn csfp-btn-secondary" style="display: none;">
            Load More Visits
        </button>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    let currentPage = 1;
    let isLoading = false;
    let hasMoreVisits = true;
    
    // Check for new visit parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const newVisitId = urlParams.get('new_visit');
    
    // Show success message if new visit was just created
    if (newVisitId) {
        $('#visit-success-message').slideDown();
        // Remove the parameter from URL without refreshing
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Auto-hide the message after 5 seconds
        setTimeout(function() {
            $('#visit-success-message').slideUp();
        }, 5000);
    }
    
    // Load visits
    function loadVisits(page = 1, append = false) {
        if (isLoading) return;
        isLoading = true;
        
        const filters = {
            date_range: $('#filter-date-range').val(),
            type: $('#filter-type').val(),
            sentiment: $('#filter-sentiment').val(),
            user_id: $('#filter-user').val(),
            page: page
        };
        
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_get_visits_feed',
            nonce: csfp_ajax.nonce,
            ...filters
        }, function(response) {
            if (response.success) {
                const data = response.data;
                
                // Update stats
                $('#total-visits-count').text(data.stats.total_visits);
                $('#visits-today').text(data.stats.visits_today);
                $('#follow-ups-needed').text(data.stats.follow_ups_needed);
                $('#voice-visits').text(data.stats.voice_visits);
                
                // Render visits
                let html = '';
                if (data.visits.length === 0 && !append) {
                    html = '<div class="csfp-glass csfp-card"><p>No visits found matching your criteria.</p></div>';
                } else {
                    html = data.visits.map(visit => {
                        const date = new Date(visit.engagement_date);
                        const timeAgo = getTimeAgo(date);
                        const sentimentClass = 'csfp-sentiment-' + visit.sentiment.toLowerCase();
                        const profileUrl = '<?php echo get_permalink(get_option('csfp_profile_page_id')); ?>?id=' + visit.inspector_id;
                        
                        let mediaHtml = '';
                        if (visit.has_audio) {
                            mediaHtml = '<span class="csfp-visit-media">🎤 Voice Visit</span>';
                        }
                        if (visit.has_photos) {
                            mediaHtml += '<span class="csfp-visit-media">📷 Photos</span>';
                        }
                        
                        return `
                            <div class="csfp-glass csfp-card csfp-visit-item" style="cursor: pointer;" onclick="window.location.href='${profileUrl}'">
                                <div class="csfp-visit-header">
                                    <div class="csfp-visit-info">
                                        <h3>
                                            <a href="${profileUrl}">${visit.inspector_name}</a>
                                            <span class="csfp-visit-type">${visit.role}</span>
                                        </h3>
                                        <div class="csfp-visit-meta">
                                            <span>By ${visit.user_name}</span>
                                            <span>${timeAgo}</span>
                                            <span class="${sentimentClass}">${visit.sentiment}</span>
                                            ${visit.follow_up_needed ? '<span class="csfp-follow-up-flag">⚠️ Follow-up needed</span>' : ''}
                                        </div>
                                    </div>
                                    <div class="csfp-visit-actions">
                                        ${mediaHtml}
                                    </div>
                                </div>
                                <div class="csfp-visit-content">
                                    <p>${visit.notes}</p>
                                    ${visit.transcription ? '<div class="csfp-transcription"><strong>Transcription:</strong> ' + visit.transcription + '</div>' : ''}
                                </div>
                                ${visit.tour_name ? '<div class="csfp-visit-tour">Part of tour: ' + visit.tour_name + '</div>' : ''}
                            </div>
                        `;
                    }).join('');
                }
                
                if (append) {
                    $('#visits-feed').append(html);
                } else {
                    $('#visits-feed').html(html);
                }
                
                // Show/hide load more button
                hasMoreVisits = data.has_more;
                if (hasMoreVisits) {
                    $('#load-more-visits').show();
                } else {
                    $('#load-more-visits').hide();
                }
                
                currentPage = page;
                isLoading = false;
            }
        });
    }
    
    // Get time ago string
    function getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        
        return date.toLocaleDateString();
    }
    
    // Initial load
    loadVisits();
    
    // Filter changes
    $('#filter-date-range, #filter-type, #filter-sentiment, #filter-user').on('change', function() {
        currentPage = 1;
        loadVisits(1, false);
    });
    
    // Load more
    $('#load-more-visits').on('click', function() {
        loadVisits(currentPage + 1, true);
    });
    
    // Export visits
    $('#export-visits').on('click', function() {
        const filters = {
            date_range: $('#filter-date-range').val(),
            type: $('#filter-type').val(),
            sentiment: $('#filter-sentiment').val(),
            user_id: $('#filter-user').val()
        };
        
        const params = new URLSearchParams({
            action: 'csfp_export_visits',
            nonce: csfp_ajax.nonce,
            ...filters
        });
        
        window.location.href = csfp_ajax.ajax_url + '?' + params.toString();
    });
    
    // Initialize Quick Visit Modal
    if (typeof CSFPQuickVisit !== 'undefined') {
        CSFPQuickVisit.init(function() {
            // Reload visits after saving
            loadVisits(1, false);
        });
    }
});
</script>