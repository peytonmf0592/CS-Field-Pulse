<?php
/**
 * Market Tour template
 */

require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-market-tour.php';

// Get current user
$current_user = wp_get_current_user();

// Check for active tour
$active_tour = CSFP_Market_Tour::get_active_tour($current_user->ID);
?>

<div class="csfp-container">
    <?php CSFP_Navigation::render(); ?>
    
    <h1 class="csfp-title">Market Tour</h1>
    
    <?php if ($active_tour): ?>
        <!-- Active Tour Banner -->
        <div class="csfp-tour-banner csfp-glass">
            <div class="csfp-tour-indicator">
                <span class="csfp-tour-status">🔴 Tour Active</span>
                <h3><?php echo esc_html($active_tour->market_name); ?></h3>
                <p>Started: <?php echo date('M j, Y', strtotime($active_tour->start_date)); ?></p>
            </div>
            <div class="csfp-tour-actions">
                <button class="csfp-btn csfp-btn-secondary" onclick="viewTourDashboard(<?php echo $active_tour->id; ?>)">
                    View Dashboard
                </button>
                <button class="csfp-btn csfp-btn-danger" onclick="endTour(<?php echo $active_tour->id; ?>)">
                    End Tour
                </button>
            </div>
        </div>
        
        <!-- Tour Dashboard -->
        <div id="tour-dashboard" data-tour-id="<?php echo $active_tour->id; ?>">
            <!-- Stats Grid -->
            <div class="csfp-stats-grid">
                <div class="csfp-glass csfp-card csfp-stat-card">
                    <div class="csfp-stat-number" id="inspectors-visited">0</div>
                    <div class="csfp-stat-label">Inspectors Visited</div>
                </div>
                <div class="csfp-glass csfp-card csfp-stat-card">
                    <div class="csfp-stat-number" id="adjusters-engaged">0</div>
                    <div class="csfp-stat-label">Adjusters Engaged</div>
                </div>
                <div class="csfp-glass csfp-card csfp-stat-card">
                    <div class="csfp-stat-number" id="follow-ups-needed">0</div>
                    <div class="csfp-stat-label">Follow-ups Needed</div>
                </div>
            </div>
            
            <!-- Recent Engagements -->
            <div class="csfp-glass csfp-card">
                <h2>Recent Tour Engagements</h2>
                <div id="tour-engagements-list" class="csfp-list">
                    <!-- Engagements will be loaded here -->
                </div>
            </div>
        </div>
        
    <?php else: ?>
        <!-- Start New Tour -->
        <div class="csfp-glass csfp-card">
            <h2>Start New Market Tour</h2>
            <form id="start-tour-form" class="csfp-form">
                <div class="csfp-form-group">
                    <label for="market_name">Market Name *</label>
                    <input type="text" id="market_name" name="market_name" required>
                </div>
                
                <div class="csfp-form-row">
                    <div class="csfp-form-group">
                        <label for="region">Region</label>
                        <input type="text" id="region" name="region">
                    </div>
                    
                    <div class="csfp-form-group">
                        <label for="city">City</label>
                        <input type="text" id="city" name="city">
                    </div>
                </div>
                
                <div class="csfp-form-group">
                    <label for="rfm_name">RFM Name</label>
                    <input type="text" id="rfm_name" name="rfm_name">
                </div>
                
                <button type="submit" class="csfp-btn csfp-btn-primary">
                    📍 Start Market Tour
                </button>
            </form>
        </div>
        
        <!-- Past Tours -->
        <div class="csfp-glass csfp-card">
            <h2>Past Tours</h2>
            <div id="past-tours-list" class="csfp-list">
                <?php
                $past_tours = CSFP_Market_Tour::get_all_tours($current_user->ID, 'completed');
                if ($past_tours):
                    foreach ($past_tours as $tour):
                ?>
                    <div class="csfp-list-item">
                        <h3><?php echo esc_html($tour->market_name); ?></h3>
                        <p>
                            <?php echo date('M j, Y', strtotime($tour->start_date)); ?> - 
                            <?php echo date('M j, Y', strtotime($tour->end_date)); ?>
                        </p>
                        <button class="csfp-btn csfp-btn-sm" onclick="viewTourSummary(<?php echo $tour->id; ?>)">
                            View Summary
                        </button>
                    </div>
                <?php 
                    endforeach;
                else: 
                ?>
                    <p>No past tours found.</p>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<!-- End Tour Modal -->
<div id="end-tour-modal" class="csfp-modal" style="display: none;">
    <div class="csfp-modal-content csfp-glass">
        <h2>End Market Tour</h2>
        <p>Are you sure you want to end this tour?</p>
        
        <div class="csfp-form-group">
            <label>
                <input type="checkbox" id="generate-summaries" checked>
                Generate tour summaries
            </label>
        </div>
        
        <div class="csfp-modal-actions">
            <button class="csfp-btn csfp-btn-secondary" onclick="closeEndTourModal()">Cancel</button>
            <button class="csfp-btn csfp-btn-primary" onclick="confirmEndTour()">End Tour</button>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Load tour stats if active
    <?php if ($active_tour): ?>
    loadTourStats(<?php echo $active_tour->id; ?>);
    <?php endif; ?>
    
    // Start tour form
    $('#start-tour-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_start_tour',
            nonce: csfp_ajax.nonce,
            ...$(this).serializeArray().reduce((obj, item) => {
                obj[item.name] = item.value;
                return obj;
            }, {})
        }, function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert('Failed to start tour: ' + response.data);
            }
        });
    });
});

function loadTourStats(tourId) {
    jQuery.post(csfp_ajax.ajax_url, {
        action: 'csfp_get_tour_stats',
        nonce: csfp_ajax.nonce,
        tour_id: tourId
    }, function(response) {
        if (response.success) {
            // Update stats
            jQuery('#inspectors-visited').text(response.data.stats.inspectors_visited);
            jQuery('#adjusters-engaged').text(response.data.stats.adjusters_engaged);
            jQuery('#follow-ups-needed').text(response.data.stats.follow_ups_needed);
            
            // Update engagements list
            var html = '';
            response.data.engagements.forEach(function(engagement) {
                html += '<div class="csfp-list-item">';
                html += '<h4>' + engagement.inspector_name + '</h4>';
                html += '<p>' + engagement.notes + '</p>';
                html += '<div class="csfp-meta">';
                html += '<span class="csfp-sentiment csfp-sentiment-' + engagement.sentiment.toLowerCase() + '">' + engagement.sentiment + '</span>';
                html += '<span>' + engagement.user_name + '</span>';
                html += '<span>' + new Date(engagement.engagement_date).toLocaleDateString() + '</span>';
                html += '</div>';
                html += '</div>';
            });
            
            jQuery('#tour-engagements-list').html(html || '<p>No engagements yet.</p>');
        }
    });
}

function endTour(tourId) {
    jQuery('#end-tour-modal').show().data('tour-id', tourId);
}

function closeEndTourModal() {
    jQuery('#end-tour-modal').hide();
}

function confirmEndTour() {
    var tourId = jQuery('#end-tour-modal').data('tour-id');
    var generateSummaries = jQuery('#generate-summaries').is(':checked');
    
    jQuery.post(csfp_ajax.ajax_url, {
        action: 'csfp_end_tour',
        nonce: csfp_ajax.nonce,
        tour_id: tourId,
        generate_summaries: generateSummaries ? 1 : 0
    }, function(response) {
        if (response.success) {
            location.reload();
        } else {
            alert('Failed to end tour: ' + response.data);
        }
    });
}

function viewTourDashboard(tourId) {
    // Scroll to dashboard
    jQuery('html, body').animate({
        scrollTop: jQuery('#tour-dashboard').offset().top - 100
    }, 500);
}

function viewTourSummary(tourId) {
    // TODO: Implement tour summary view
    alert('Tour summary view coming soon!');
}
</script>