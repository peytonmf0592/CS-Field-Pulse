/**
 * CS Field Pulse Main JavaScript
 */

(function($) {
    'use strict';
    
    // Global settings for Chart.js
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#ffffff';
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
    
    // Add glassmorphism effect on scroll
    $(window).on('scroll', function() {
        const scrolled = $(window).scrollTop();
        if (scrolled > 50) {
            $('.csfp-container').addClass('scrolled');
        } else {
            $('.csfp-container').removeClass('scrolled');
        }
    });
    
    // Animate cards on page load
    $(document).ready(function() {
        $('.csfp-card').each(function(index) {
            $(this).css({
                'opacity': '0',
                'transform': 'translateY(20px)'
            });
            
            setTimeout(() => {
                $(this).css({
                    'opacity': '1',
                    'transform': 'translateY(0)',
                    'transition': 'all 0.5s ease'
                });
            }, index * 100);
        });
    });
    
    // Add hover effect to clickable cards
    $('.csfp-list-item').on('mouseenter', function() {
        $(this).find('.csfp-avatar').css('transform', 'scale(1.1)');
    }).on('mouseleave', function() {
        $(this).find('.csfp-avatar').css('transform', 'scale(1)');
    });
    
    // Mobile menu toggle (if needed)
    $('.csfp-mobile-menu-toggle').on('click', function() {
        $('.csfp-filters').toggleClass('mobile-open');
    });
    
    // Filter animations
    $('.csfp-filter-select').on('focus', function() {
        $(this).parent('.csfp-filter-group').addClass('focused');
    }).on('blur', function() {
        $(this).parent('.csfp-filter-group').removeClass('focused');
    });
    
    // Create enhanced loading spinner
    function createLoadingSpinner() {
        if (!$('.csfp-loading-spinner').length) {
            const spinnerHtml = `
                <div class="csfp-loading-spinner">
                    <div class="csfp-loading-spinner-content">
                        <div class="csfp-loading-spinner-icon">
                            <div class="csfp-loading-spinner-circle"></div>
                            <div class="csfp-loading-spinner-circle"></div>
                            <div class="csfp-loading-spinner-circle"></div>
                        </div>
                        <div class="csfp-loading-spinner-text">Loading...</div>
                    </div>
                </div>
            `;
            $('body').append(spinnerHtml);
        }
    }
    
    // Show/hide loading spinner
    window.showLoadingSpinner = function(text = 'Loading...') {
        createLoadingSpinner();
        $('.csfp-loading-spinner-text').text(text);
        $('.csfp-loading-spinner').addClass('active');
    };
    
    window.hideLoadingSpinner = function() {
        $('.csfp-loading-spinner').removeClass('active');
    };
    
    // Loading state for AJAX requests
    let activeRequests = 0;
    $(document).ajaxStart(function() {
        activeRequests++;
        if (activeRequests === 1) {
            $('body').addClass('csfp-loading');
            // Show enhanced spinner for longer operations
            setTimeout(() => {
                if (activeRequests > 0) {
                    showLoadingSpinner('Processing...');
                }
            }, 500);
        }
    }).ajaxStop(function() {
        activeRequests--;
        if (activeRequests === 0) {
            $('body').removeClass('csfp-loading');
            hideLoadingSpinner();
        }
    });
    
    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 800);
        }
    });
    
    // Particles are now handled by csfp-particles.js for better consistency
    
    // AGGRESSIVE mobile button style enforcement
    function forceMobileButtonStyles() {
        // Comprehensive mobile detection
        const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                        window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        ('ontouchstart' in window) ||
                        (navigator.maxTouchPoints > 0);
        
        if (isMobile) {
            // Inject critical styles directly into head as a fallback
            if (!document.getElementById('csfp-mobile-critical-styles')) {
                const style = document.createElement('style');
                style.id = 'csfp-mobile-critical-styles';
                style.innerHTML = `
                    #quick-visit-btn {
                        background: #20E37B !important;
                        background-color: #20E37B !important;
                        color: #000 !important;
                        width: 100% !important;
                        padding: 1.25rem !important;
                        font-size: 17px !important;
                        font-weight: 700 !important;
                        min-height: 56px !important;
                        border-radius: 12px !important;
                        -webkit-appearance: none !important;
                    }
                    #start-market-tour-btn {
                        background: rgba(255, 255, 255, 0.08) !important;
                        background-color: rgba(255, 255, 255, 0.08) !important;
                        color: #fff !important;
                        width: 100% !important;
                        padding: 0.875rem !important;
                        font-size: 15px !important;
                        min-height: 46px !important;
                        border-radius: 10px !important;
                        border: 1px solid rgba(255, 255, 255, 0.15) !important;
                        -webkit-appearance: none !important;
                    }
                    .csfp-action-panel {
                        background: linear-gradient(135deg, rgba(32, 227, 123, 0.1) 0%, rgba(32, 227, 123, 0.02) 100%) !important;
                        border: 1px solid rgba(32, 227, 123, 0.2) !important;
                        padding: 1rem !important;
                        margin: 0.75rem 1rem 1rem 1rem !important;
                    }
                `;
                document.head.appendChild(style);
            }
            // Remove debug indicator in production - comment out for debugging only
            // if (!document.getElementById('mobile-style-debug')) {
            //     const debug = document.createElement('div');
            //     debug.id = 'mobile-style-debug';
            //     debug.style.cssText = 'position:fixed;bottom:0;right:0;background:red;color:white;padding:5px;z-index:9999;font-size:10px;pointer-events:none;';
            //     debug.textContent = 'Mobile styles v' + Date.now();
            //     document.body.appendChild(debug);
            // }
            
            // Force styles with setAttribute for maximum override
            const recordBtn = document.getElementById('quick-visit-btn');
            if (recordBtn) {
                recordBtn.setAttribute('style', 'background: #20E37B !important; color: #000 !important; padding: 1.25rem !important; font-size: 17px !important; font-weight: 700 !important; border: none !important; border-radius: 12px !important; width: 100% !important; min-height: 56px !important; box-shadow: 0 4px 16px rgba(32, 227, 123, 0.35) !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.5rem !important; -webkit-appearance: none !important;');
                
                // Also set individual properties as backup
                recordBtn.style.setProperty('background', '#20E37B', 'important');
                recordBtn.style.setProperty('color', '#000', 'important');
                recordBtn.style.setProperty('width', '100%', 'important');
                recordBtn.style.setProperty('padding', '1.25rem', 'important');
                recordBtn.style.setProperty('font-size', '17px', 'important');
                recordBtn.style.setProperty('font-weight', '700', 'important');
            }
            
            const marketBtn = document.getElementById('start-market-tour-btn');
            if (marketBtn) {
                marketBtn.setAttribute('style', 'background: rgba(255, 255, 255, 0.08) !important; color: #fff !important; padding: 0.875rem !important; font-size: 15px !important; font-weight: 600 !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; border-radius: 10px !important; width: 100% !important; min-height: 46px !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.4rem !important; -webkit-appearance: none !important;');
                
                marketBtn.style.setProperty('background', 'rgba(255, 255, 255, 0.08)', 'important');
                marketBtn.style.setProperty('color', '#fff', 'important');
                marketBtn.style.setProperty('width', '100%', 'important');
                marketBtn.style.setProperty('padding', '0.875rem', 'important');
                marketBtn.style.setProperty('font-size', '15px', 'important');
            }
            
            const actionPanel = document.querySelector('.csfp-action-panel');
            if (actionPanel) {
                actionPanel.setAttribute('style', 'background: linear-gradient(135deg, rgba(32, 227, 123, 0.1) 0%, rgba(32, 227, 123, 0.02) 100%) !important; border: 1px solid rgba(32, 227, 123, 0.2) !important; border-radius: 12px !important; padding: 1rem !important; margin: 0.75rem 1rem 1rem 1rem !important; box-shadow: 0 4px 20px rgba(32, 227, 123, 0.15) !important; -webkit-backdrop-filter: blur(10px) !important; backdrop-filter: blur(10px) !important; display: block !important;');
                
                const buttonContainer = actionPanel.querySelector('div');
                if (buttonContainer) {
                    buttonContainer.setAttribute('style', 'display: flex !important; flex-direction: column !important; gap: 0.75rem !important; width: 100% !important;');
                }
            }
        }
    }
    
    // Use MutationObserver with debouncing to prevent performance issues
    let observerTimeout;
    const observer = new MutationObserver(function(mutations) {
        // Debounce to prevent excessive calls
        clearTimeout(observerTimeout);
        observerTimeout = setTimeout(() => {
            forceMobileButtonStyles();
        }, 50);
    });
    
    // Start observing when DOM is ready
    $(document).ready(function() {
        forceMobileButtonStyles();
        
        // Only observe the action panel and its children to reduce overhead
        const actionPanel = document.querySelector('.csfp-action-panel');
        if (actionPanel) {
            observer.observe(actionPanel, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
        
        // Apply styles a few times after load, then stop
        let counter = 0;
        const interval = setInterval(function() {
            forceMobileButtonStyles();
            counter++;
            if (counter > 10) clearInterval(interval); // Reduced from 50 to 10
        }, 200); // Increased interval from 100ms to 200ms
    });
    
    // Also force on these events with proper timing
    window.addEventListener('load', forceMobileButtonStyles);
    window.addEventListener('resize', forceMobileButtonStyles);
    window.addEventListener('orientationchange', forceMobileButtonStyles);
    document.addEventListener('DOMContentLoaded', forceMobileButtonStyles);
    
    // Wait for elements to exist before applying styles
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceMobileButtonStyles);
    } else {
        // DOM is already loaded, apply styles after a short delay to ensure elements exist
        setTimeout(forceMobileButtonStyles, 100);
    }
    
    // Global map variables
    window.csfpMap = null;
    window.csfpMarkers = [];
    window.csfpInfoWindows = [];
    window.csfpHeatmap = null;
    
})(jQuery);

// Initialize Google Map (make it global for callback)
window.initCSFPMap = function() {
    // Check if map container exists
    const mapElement = document.getElementById('csfp-map');
    if (!mapElement) return;
    
    // Map options
    const mapOptions = {
        zoom: 4,
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#0a0a0a"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#00ff88"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#000000"}, {"weight": 2}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#001a0d"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#1a1a1a"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#666666"}]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#00ff88"}, {"weight": 0.5}]
            },
            {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#00ff88"}, {"weight": 1}]
            }
        ]
    };
    
    // Create map
    window.csfpMap = new google.maps.Map(mapElement, mapOptions);
    
    // Initialize arrays for markers and info windows
    window.csfpMarkers = [];
    window.csfpInfoWindows = [];
    
    // Load map data
    loadMapData();
}

function loadMapData(market = '') {
    if (!window.csfpMap) return;
    
    // Clear existing markers and heatmap
    clearMarkers();
    
    jQuery.post(csfp_ajax.ajax_url, {
        action: 'csfp_get_map_data',
        nonce: csfp_ajax.nonce,
        market: market
    }, function(response) {
        if (response.success) {
            const locations = response.data;
            const bounds = new google.maps.LatLngBounds();
            const heatmapData = [];
            
            locations.forEach(location => {
                if (!location.coords) return;
                
                const position = {
                    lat: location.coords.lat,
                    lng: location.coords.lng
                };
                
                // Calculate sentiment weight for heatmap
                const sentimentCounts = location.sentiment_counts;
                const total = sentimentCounts.Promoter + sentimentCounts.Passive + sentimentCounts.Detractor;
                
                if (total > 0) {
                    // Weight based on total activity and sentiment
                    const promoterWeight = sentimentCounts.Promoter * 3;
                    const passiveWeight = sentimentCounts.Passive * 1;
                    const detractorWeight = sentimentCounts.Detractor * -2;
                    const weight = Math.max(1, (promoterWeight + passiveWeight + detractorWeight) / total);
                    
                    // Add weighted points to heatmap data
                    for (let i = 0; i < total; i++) {
                        heatmapData.push({
                            location: new google.maps.LatLng(position.lat, position.lng),
                            weight: weight
                        });
                    }
                }
                
                // Create subtle marker for details
                const marker = new google.maps.Marker({
                    position: position,
                    map: window.csfpMap,
                    title: location.city + ', ' + location.market,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 4,
                        fillColor: '#ff6600',
                        fillOpacity: 0.6,
                        strokeColor: '#ff6600',
                        strokeWeight: 1
                    }
                });
                
                // Create info window content
                const infoContent = createInfoWindowContent(location);
                
                const infoWindow = new google.maps.InfoWindow({
                    content: infoContent
                });
                
                // Add click listener
                marker.addListener('click', () => {
                    // Close all other info windows
                    window.csfpInfoWindows.forEach(iw => iw.close());
                    infoWindow.open(window.csfpMap, marker);
                });
                
                window.csfpMarkers.push(marker);
                window.csfpInfoWindows.push(infoWindow);
                bounds.extend(position);
            });
            
            // Create or update heatmap
            if (window.csfpHeatmap) {
                window.csfpHeatmap.setMap(null);
            }
            
            window.csfpHeatmap = new google.maps.visualization.HeatmapLayer({
                data: heatmapData,
                map: window.csfpMap,
                radius: 50,
                gradient: [
                    'rgba(0, 0, 0, 0)',
                    'rgba(255, 68, 68, 0.2)',
                    'rgba(255, 68, 68, 0.4)',
                    'rgba(255, 204, 0, 0.6)',
                    'rgba(255, 204, 0, 0.8)',
                    'rgba(0, 255, 136, 0.9)',
                    'rgba(0, 255, 136, 1)'
                ]
            });
            
            // Fit map to markers
            if (locations.length > 0) {
                window.csfpMap.fitBounds(bounds);
                
                // Ensure we don't zoom in too much for single markers
                google.maps.event.addListenerOnce(window.csfpMap, 'bounds_changed', function() {
                    if (window.csfpMap.getZoom() > 8) {
                        window.csfpMap.setZoom(8);
                    }
                });
                
                // If only one location, set a reasonable zoom
                if (locations.length === 1) {
                    window.csfpMap.setZoom(6);
                    window.csfpMap.setCenter(locations[0].coords);
                }
            } else {
                // No locations, show full US
                window.csfpMap.setCenter({ lat: 39.8283, lng: -98.5795 });
                window.csfpMap.setZoom(4);
            }
        }
    });
}

function createInfoWindowContent(location) {
    // Calculate time since last visit
    let lastVisitText = '';
    if (location.last_visit) {
        const lastVisit = new Date(location.last_visit);
        const daysAgo = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24));
        lastVisitText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
    }
    
    let inspectorsList = '';
    if (location.inspectors.length > 0) {
        inspectorsList = '<div class="csfp-map-section"><strong>Inspectors:</strong><ul>';
        location.inspectors.forEach(inspector => {
            const sentimentClass = 'csfp-sentiment-' + inspector.sentiment.toLowerCase();
            const visits = inspector.visits || 0;
            inspectorsList += `<li>${inspector.name} <span class="${sentimentClass}">(${inspector.sentiment})</span> - ${visits} visits</li>`;
        });
        inspectorsList += '</ul></div>';
    }
    
    let adjustersList = '';
    if (location.adjusters.length > 0) {
        adjustersList = '<div class="csfp-map-section"><strong>Adjusters:</strong><ul>';
        location.adjusters.forEach(adjuster => {
            const sentimentClass = 'csfp-sentiment-' + adjuster.sentiment.toLowerCase();
            const visits = adjuster.visits || 0;
            adjustersList += `<li>${adjuster.name} <span class="${sentimentClass}">(${adjuster.sentiment})</span> - ${visits} visits</li>`;
        });
        adjustersList += '</ul></div>';
    }
    
    return `
        <div class="csfp-map-info">
            <h3>${location.city}, ${location.market}</h3>
            ${location.total_visits ? `<p><strong>${location.total_visits} visits</strong> • Last visit: ${lastVisitText}</p>` : ''}
            <div class="csfp-map-stats">
                <span class="csfp-sentiment-promoter">Promoters: ${location.sentiment_counts.Promoter}</span>
                <span class="csfp-sentiment-passive">Passive: ${location.sentiment_counts.Passive}</span>
                <span class="csfp-sentiment-detractor">Detractors: ${location.sentiment_counts.Detractor}</span>
            </div>
            ${inspectorsList}
            ${adjustersList}
        </div>
    `;
}

function clearMarkers() {
    window.csfpMarkers.forEach(marker => marker.setMap(null));
    window.csfpMarkers = [];
    window.csfpInfoWindows = [];
    
    if (window.csfpHeatmap) {
        window.csfpHeatmap.setMap(null);
        window.csfpHeatmap = null;
    }
}