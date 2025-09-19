<?php
/**
 * Dashboard template
 */

// Get current user
$current_user = wp_get_current_user();
$user_location = get_user_meta($current_user->ID, 'csfp_location', true);
?>

<div class="csfp-container">
    <!-- Welcome message at the very top -->
    <div class="csfp-welcome-top">
        Welcome, <?php echo esc_html($current_user->display_name); ?>
    </div>
    
    <?php CSFP_Navigation::render(); ?>
    
    <!-- Action Buttons Section FIRST -->
    <style>
        @media screen and (max-width: 768px) {
            .csfp-action-panel {
                background: linear-gradient(135deg, rgba(32, 227, 123, 0.1) 0%, rgba(32, 227, 123, 0.02) 100%) !important;
                border: 1px solid rgba(32, 227, 123, 0.2) !important;
                border-radius: 12px !important;
                margin: 0.75rem 1rem 1rem 1rem !important;
            }
            .csfp-action-buttons {
                display: flex !important;
                flex-direction: column !important;
                gap: 0.75rem !important;
            }
            #quick-visit-btn {
                width: 100% !important;
                padding: 1.25rem !important;
                font-size: 17px !important;
                background: #20E37B !important;
                color: #000 !important;
                border: none !important;
                border-radius: 12px !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                min-height: 56px !important;
                box-shadow: 0 4px 16px rgba(32, 227, 123, 0.35) !important;
            }
            #start-market-tour-btn {
                width: 100% !important;
                padding: 0.875rem !important;
                font-size: 15px !important;
                background: rgba(255, 255, 255, 0.08) !important;
                color: #fff !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 10px !important;
                font-weight: 600 !important;
                min-height: 46px !important;
            }
        }
    </style>
    <div class="csfp-glass csfp-card csfp-action-panel" style="padding: 1rem;">
        <!-- Main action buttons -->
        <div class="csfp-action-buttons" style="display: flex; gap: 0.75rem; justify-content: center;">
            <button id="quick-visit-btn" class="csfp-btn csfp-btn-primary">
                <span style="font-size: 1.3rem;">+</span> Record Visit
            </button>
            <button id="start-market-tour-btn" class="csfp-btn csfp-btn-secondary">
                <span style="margin-right: 0.4rem;">🚗</span> Start Market Tour
            </button>
        </div>
    </div>
    
    <!-- Clean Page Header -->
    <div class="csfp-page-header">
        <h1 class="csfp-page-title">
            <span class="csfp-hex-icon dashboard"></span>
            Dashboard
        </h1>
    </div>
    
    <!-- Quick Search -->
    <div id="csfp-quick-search-container"></div>
    
    <!-- View Controls Section -->
    <div class="csfp-glass csfp-card" style="display: flex; align-items: center; gap: 1.5rem; padding: 0.875rem; margin: 0 1rem 0.75rem 1rem; box-sizing: border-box; max-width: calc(100% - 2rem); margin-left: auto; margin-right: auto;">
        <!-- View By Toggle -->
        <div class="csfp-view-toggle" style="display: flex; align-items: center; gap: 0.5rem;">
            <label class="csfp-filter-label" style="margin: 0;">View by:</label>
            <div class="csfp-toggle-buttons" style="display: flex; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px;">
                <button type="button" class="csfp-toggle-btn active" data-view="market" style="padding: 0.5rem 1rem; background: var(--csfp-green); color: var(--csfp-black); border: none; border-radius: 5px 0 0 5px; cursor: pointer; font-weight: 600;">Market</button>
                <button type="button" class="csfp-toggle-btn" data-view="rfm" style="padding: 0.5rem 1rem; background: transparent; color: var(--csfp-white); border: none; border-radius: 0 5px 5px 0; cursor: pointer;">RFM</button>
            </div>
        </div>
        
        <!-- RFM Selector (hidden by default) -->
        <div id="rfm-selector" style="display: none;">
            <label class="csfp-filter-label">RFM</label>
            <select id="csfp-rfm-filter" class="csfp-filter-select">
                <option value="">Select RFM</option>
            </select>
        </div>
        
        <!-- Market Selector -->
        <div id="market-selector">
            <label class="csfp-filter-label">Market</label>
            <select id="csfp-market-filter" class="csfp-filter-select">
                <option value="">National (All Markets)</option>
            </select>
        </div>
    </div>
    
    <!-- Stats Grid -->
    <div id="stats-section" class="csfp-stats-grid">
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="total-inspectors">0</div>
            <div class="csfp-stat-label">Total Inspectors</div>
        </div>
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="total-adjusters">0</div>
            <div class="csfp-stat-label">Total Adjusters</div>
        </div>
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="total-visits">0</div>
            <div class="csfp-stat-label">Total Engagements</div>
        </div>
        <div class="csfp-glass csfp-card csfp-stat-card">
            <div class="csfp-stat-number" id="visits-this-month">0</div>
            <div class="csfp-stat-label">This Month</div>
        </div>
    </div>
    
    <!-- New Compact Dashboard Layout -->
    <div class="csfp-dashboard-compact">
        <!-- Left Half: Charts and Map -->
        <div class="csfp-dashboard-main">
            <!-- Charts Row -->
            <div class="csfp-charts-row-compact">
                <div class="csfp-glass csfp-chart-container-compact">
                    <h3>Inspector Sentiment</h3>
                    <div class="csfp-chart-wrapper-compact">
                        <canvas id="inspector-sentiment-chart"></canvas>
                    </div>
                </div>
                
                <div class="csfp-glass csfp-chart-container-compact">
                    <h3>Adjuster Sentiment</h3>
                    <div class="csfp-chart-wrapper-compact">
                        <canvas id="adjuster-sentiment-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Map Below Charts -->
            <div class="csfp-glass csfp-card csfp-map-container-compact">
                <h3>Field Coverage Map</h3>
                <div id="csfp-map" class="csfp-map-compact">
                    <!-- Map will be loaded here -->
                </div>
            </div>
        </div>
        
        <!-- Right Half: Recent Activity -->
        <div class="csfp-dashboard-sidebar">
            <div class="csfp-glass csfp-card csfp-recent-activity-compact">
                <h3>Recent Activity</h3>
                <div id="recent-activity-list" class="csfp-activity-scroll">
                    <!-- Activity items will be loaded here -->
                </div>
                <div class="csfp-activity-pagination" style="display: none;">
                    <button id="load-more-activity" class="csfp-btn csfp-btn-secondary" style="width: 100%; margin-top: 1rem;">
                        Load More
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Initialize map function for global access
window.initCSFPMap = function() {
    if (typeof loadMapData === 'function') {
        loadMapData(jQuery('#csfp-market-filter').val());
    }
};

jQuery(document).ready(function($) {
    let inspectorChart = null;
    let adjusterChart = null;
    let allActivities = [];
    let displayedActivities = 10;
    const activityIncrement = 10;
    
    // Touch tracking for charts
    let touchStartTime = 0;
    let isTouchHold = false;
    const TOUCH_HOLD_THRESHOLD = 300; // milliseconds - if touch is longer than this, it's a hold not a tap
    
    // Market and RFM data
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
    
    // Initialize market dropdown with ordered markets
    function initializeMarketDropdown(filterByRfm = null) {
        const $marketSelect = $('#csfp-market-filter');
        const currentValue = $marketSelect.val();
        $marketSelect.empty();
        
        if (!filterByRfm) {
            $marketSelect.append('<option value="">National (All Markets)</option>');
        }
        
        let marketsToShow = marketsData;
        if (filterByRfm && rfmToMarkets[filterByRfm]) {
            marketsToShow = marketsData.filter(m => rfmToMarkets[filterByRfm].includes(m.name));
        }
        
        marketsToShow.forEach(market => {
            const displayName = filterByRfm ? market.name : `${market.name} - ${market.rfm || 'No RFM'}`;
            $marketSelect.append(`<option value="${market.slug}">${displayName}</option>`);
        });
        
        // Restore previous value if it exists
        if (currentValue && $marketSelect.find(`option[value="${currentValue}"]`).length) {
            $marketSelect.val(currentValue);
        }
    }
    
    // Initialize RFM dropdown
    function initializeRfmDropdown() {
        const $rfmSelect = $('#csfp-rfm-filter');
        $rfmSelect.empty();
        $rfmSelect.append('<option value="">Select RFM</option>');
        
        rfmList.forEach(rfm => {
            $rfmSelect.append(`<option value="${rfm}">${rfm}</option>`);
        });
    }
    
    // Handle view toggle
    $('.csfp-toggle-btn').on('click', function() {
        const view = $(this).data('view');
        
        // Update button states
        $('.csfp-toggle-btn').removeClass('active')
            .css({
                'background': 'transparent',
                'color': 'var(--csfp-white)',
                'font-weight': 'normal'
            });
        $(this).addClass('active')
            .css({
                'background': 'var(--csfp-green)',
                'color': 'var(--csfp-black)',
                'font-weight': '600'
            });
        
        if (view === 'market') {
            $('#rfm-selector').hide();
            $('#market-selector label').text('Market');
            initializeMarketDropdown();
        } else {
            $('#rfm-selector').show();
            $('#market-selector label').text('Market');
            initializeRfmDropdown();
            // Clear market filter when switching to RFM view
            $('#csfp-market-filter').empty()
                .append('<option value="">Select RFM first</option>');
        }
    });
    
    // Handle RFM selection
    $('#csfp-rfm-filter').on('change', function() {
        const selectedRfm = $(this).val();
        if (selectedRfm) {
            initializeMarketDropdown(selectedRfm);
        } else {
            $('#csfp-market-filter').empty()
                .append('<option value="">Select RFM first</option>');
        }
    });
    
    // Initialize dropdowns on load
    initializeMarketDropdown();
    initializeRfmDropdown();
    
    // Chart configuration - responsive for mobile
    const isMobile = window.innerWidth <= 640;
    const chartConfig = {
        type: 'doughnut',
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: isMobile ? 1.2 : 1.5,
            cutout: isMobile ? '45%' : '50%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: isMobile ? 15 : 20,
                        font: {
                            size: isMobile ? 16 : 15,
                            weight: '600',
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        },
                        usePointStyle: true,
                        pointStyle: 'rect',
                        boxWidth: isMobile ? 24 : 20,
                        boxHeight: isMobile ? 20 : 16,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].borderColor[i],
                                    lineWidth: 2,
                                    hidden: false,
                                    index: i,
                                    fontColor: label === 'Promoter' ? '#00ff88' : 
                                              label === 'Passive' ? '#ffcc00' : '#ff4444'
                                };
                            });
                        }
                    },
                    onHover: function(event, legendItem) {
                        event.native.target.style.cursor = legendItem ? 'pointer' : 'default';
                    }
                },
                tooltip: {
                    enabled: true,
                    position: 'nearest',
                    // Position tooltip above touch point on mobile
                    yAlign: isMobile ? 'bottom' : 'center',
                    xAlign: 'center',
                    // Add offset to keep tooltip away from finger
                    caretPadding: isMobile ? 20 : 10,
                    displayColors: true,
                    // Increase padding on mobile for better readability
                    padding: isMobile ? 12 : 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(32, 227, 123, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    titleFont: {
                        size: isMobile ? 14 : 12,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: isMobile ? 13 : 11
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        },
                        afterLabel: function() {
                            return isMobile ? '' : 'Click to view';
                        }
                    }
                }
            },
            // Better interaction for mobile
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'xy'
            },
            onHover: (event, activeElements) => {
                if (!isMobile) {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                }
            }
        }
    };
    
    // Load dashboard data
    function loadDashboardData(market = '') {
        $.post(csfp_ajax.ajax_url, {
            action: 'csfp_get_dashboard_data',
            nonce: csfp_ajax.nonce,
            market: market
        }, function(response) {
            if (response.success) {
                const data = response.data;
                
                // Update stats
                const totalInspectors = data.inspector_stats.Promoter + 
                                      data.inspector_stats.Passive + 
                                      data.inspector_stats.Detractor;
                const totalAdjusters = data.adjuster_stats.Promoter + 
                                     data.adjuster_stats.Passive + 
                                     data.adjuster_stats.Detractor;
                
                $('#total-inspectors').text(totalInspectors);
                $('#total-adjusters').text(totalAdjusters);
                $('#total-visits').text(data.total_visits);
                $('#visits-this-month').text(data.visits_this_month);
                
                // Update inspector chart
                if (inspectorChart) {
                    inspectorChart.destroy();
                }
                
                const inspectorCtx = document.getElementById('inspector-sentiment-chart').getContext('2d');
                inspectorChart = new Chart(inspectorCtx, {
                    ...chartConfig,
                    data: {
                        labels: ['Promoter', 'Passive', 'Detractor'],
                        datasets: [{
                            data: [
                                data.inspector_stats.Promoter,
                                data.inspector_stats.Passive,
                                data.inspector_stats.Detractor
                            ],
                            backgroundColor: [
                                'rgba(0, 255, 136, 0.8)',
                                'rgba(255, 204, 0, 0.8)',
                                'rgba(255, 68, 68, 0.8)'
                            ],
                            borderColor: [
                                'rgba(0, 255, 136, 1)',
                                'rgba(255, 204, 0, 1)',
                                'rgba(255, 68, 68, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        ...chartConfig.options,
                        onClick: (event, elements) => {
                            // Only navigate if it was a quick tap, not a touch-hold
                            if (elements.length > 0 && !isTouchHold) {
                                const index = elements[0].index;
                                const sentiment = ['Promoter', 'Passive', 'Detractor'][index];
                                const inspectorsPageId = <?php echo get_option('csfp_inspectors_page_id'); ?>;
                                const baseUrl = '<?php echo home_url(); ?>';
                                window.location.href = baseUrl + '/?page_id=' + inspectorsPageId + '&sentiment=' + sentiment;
                            }
                            isTouchHold = false; // Reset flag
                        },
                        onHover: (event, activeElements) => {
                            // Track touch events
                            const canvas = event.native.target;
                            if (!canvas.hasAttribute('data-touch-tracked')) {
                                canvas.setAttribute('data-touch-tracked', 'true');
                                
                                // Track touch start
                                canvas.addEventListener('touchstart', function(e) {
                                    touchStartTime = Date.now();
                                    isTouchHold = false;
                                }, { passive: true });
                                
                                // Track touch end
                                canvas.addEventListener('touchend', function(e) {
                                    const touchDuration = Date.now() - touchStartTime;
                                    isTouchHold = touchDuration > TOUCH_HOLD_THRESHOLD;
                                }, { passive: true });
                            }
                            
                            // Original hover behavior for desktop
                            if (!('ontouchstart' in window)) {
                                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                            }
                        }
                    }
                });
                
                // Update adjuster chart
                if (adjusterChart) {
                    adjusterChart.destroy();
                }
                
                const adjusterCtx = document.getElementById('adjuster-sentiment-chart').getContext('2d');
                adjusterChart = new Chart(adjusterCtx, {
                    ...chartConfig,
                    data: {
                        labels: ['Promoter', 'Passive', 'Detractor'],
                        datasets: [{
                            data: [
                                data.adjuster_stats.Promoter,
                                data.adjuster_stats.Passive,
                                data.adjuster_stats.Detractor
                            ],
                            backgroundColor: [
                                'rgba(0, 255, 136, 0.8)',
                                'rgba(255, 204, 0, 0.8)',
                                'rgba(255, 68, 68, 0.8)'
                            ],
                            borderColor: [
                                'rgba(0, 255, 136, 1)',
                                'rgba(255, 204, 0, 1)',
                                'rgba(255, 68, 68, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        ...chartConfig.options,
                        onClick: (event, elements) => {
                            // Only navigate if it was a quick tap, not a touch-hold
                            if (elements.length > 0 && !isTouchHold) {
                                const index = elements[0].index;
                                const sentiment = ['Promoter', 'Passive', 'Detractor'][index];
                                const adjustersPageId = <?php echo get_option('csfp_adjusters_page_id'); ?>;
                                const baseUrl = '<?php echo home_url(); ?>';
                                window.location.href = baseUrl + '/?page_id=' + adjustersPageId + '&sentiment=' + sentiment;
                            }
                            isTouchHold = false; // Reset flag
                        },
                        onHover: (event, activeElements) => {
                            // Track touch events
                            const canvas = event.native.target;
                            if (!canvas.hasAttribute('data-touch-tracked')) {
                                canvas.setAttribute('data-touch-tracked', 'true');
                                
                                // Track touch start
                                canvas.addEventListener('touchstart', function(e) {
                                    touchStartTime = Date.now();
                                    isTouchHold = false;
                                }, { passive: true });
                                
                                // Track touch end
                                canvas.addEventListener('touchend', function(e) {
                                    const touchDuration = Date.now() - touchStartTime;
                                    isTouchHold = touchDuration > TOUCH_HOLD_THRESHOLD;
                                }, { passive: true });
                            }
                            
                            // Original hover behavior for desktop
                            if (!('ontouchstart' in window)) {
                                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                            }
                        }
                    }
                });
                
                // Store all activities and display initial set
                allActivities = data.recent_activity;
                displayedActivities = Math.min(10, allActivities.length);
                updateActivityDisplay();
                
                // Trigger event for other scripts
                $(document).trigger('csfp:dashboard:loaded');
            }
        });
    }
    
    // Update activity display
    function updateActivityDisplay() {
        const activitiesToShow = allActivities.slice(0, displayedActivities);
        const activityHtml = activitiesToShow.map(item => {
            const sentimentClass = 'csfp-sentiment-' + item.sentiment.toLowerCase();
            const date = new Date(item.engagement_date);
            const timeAgo = getTimeAgo(date);
            const profileType = item.role === 'Inspector' ? 'inspectors' : 'adjusters';
            const profileUrl = `/${profileType}/${item.inspector_id || item.id}`;
            
            return `
                <div class="csfp-activity-item" 
                     role="link" 
                     tabindex="0"
                     data-href="${profileUrl}"
                     data-inspector-id="${item.inspector_id || item.id}"
                     data-role="${item.role}">
                    <div class="csfp-activity-header">
                        <div class="csfp-activity-name">${item.inspector_name}</div>
                        <span class="csfp-activity-time">${timeAgo}</span>
                    </div>
                    <div class="csfp-activity-meta">
                        <span class="csfp-activity-user">${item.user_name}</span>
                        <span class="csfp-sentiment ${sentimentClass}">${item.sentiment}</span>
                    </div>
                    ${item.notes ? `<p class="csfp-activity-notes">${truncateText(item.notes, 100)}</p>` : ''}
                </div>
            `;
        }).join('');
        
        $('#recent-activity-list').html(activityHtml || '<p>No recent activity</p>');
        
        // Add click and keyboard handlers for activity items
        $('.csfp-activity-item').off('click keydown').on('click keydown', function(e) {
            // Handle click or Enter/Space keys
            if (e.type === 'click' || (e.type === 'keydown' && (e.keyCode === 13 || e.keyCode === 32))) {
                e.preventDefault();
                const inspectorId = $(this).data('inspector-id');
                const role = $(this).data('role');
                if (inspectorId) {
                    // Navigate to profile page with inspector/adjuster ID
                    const profilePageId = <?php echo get_option('csfp_profile_page_id'); ?>;
                    const baseUrl = '<?php echo home_url(); ?>';
                    window.location.href = baseUrl + '/?page_id=' + profilePageId + '&id=' + inspectorId;
                }
            }
        });
        
        // Show/hide load more button
        if (displayedActivities < allActivities.length) {
            $('.csfp-activity-pagination').show();
        } else {
            $('.csfp-activity-pagination').hide();
        }
    }
    
    // Initial load
    loadDashboardData();
    
    // Helper functions
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
            }
        }
        return 'just now';
    }
    
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // Market filter change
    $('#csfp-market-filter').on('change', function() {
        const marketSlug = $(this).val();
        // Convert slug to market name for API
        let marketName = '';
        if (marketSlug) {
            const marketObj = marketsData.find(m => m.slug === marketSlug);
            marketName = marketObj ? marketObj.name : '';
        }
        loadDashboardData(marketName);
        // Also update map if it exists
        if (typeof loadMapData === 'function') {
            loadMapData(marketName);
        }
    });
    
    // Load more activities
    $('#load-more-activity').on('click', function() {
        displayedActivities = Math.min(displayedActivities + activityIncrement, allActivities.length);
        updateActivityDisplay();
        
        // Scroll to the last newly added item
        const activityItems = $('.csfp-activity-item');
        if (activityItems.length > displayedActivities - activityIncrement) {
            const targetItem = activityItems.eq(displayedActivities - activityIncrement);
            $('.csfp-activity-scroll').animate({
                scrollTop: targetItem.position().top + $('.csfp-activity-scroll').scrollTop() - 20
            }, 500);
        }
    });
    
    // Initialize Quick Visit Modal
    if (typeof CSFPQuickVisit !== 'undefined') {
        CSFPQuickVisit.init(function() {
            // Reload dashboard after saving
            loadDashboardData($('#csfp-market-filter').val());
        });
    }
});
</script>