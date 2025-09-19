/**
 * CS Field Pulse - iOS Dashboard Fixes
 * Handles scroll trapping, map guard, and popover positioning
 */

(function($) {
    'use strict';
    
    window.CSFPDashboardFix = {
        isIOS: false,
        isMobile: false,
        
        init: function() {
            // Detect environment
            this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            this.isMobile = window.innerWidth <= 640;
            
            if (!this.isMobile) return;
            
            this.fixActionToolbar();
            this.addMapGuard();
            this.fixScrollTraps();
            this.enhancePopovers();
            this.addMarketTourButton();
        },
        
        // Fix action toolbar to ensure all buttons are visible
        fixActionToolbar: function() {
            // Find the action buttons container
            const $actionContainer = $('.csfp-glass.csfp-card').filter(function() {
                return $(this).find('#csfp-export-visits, #quick-visit-btn').length > 0;
            });
            
            if ($actionContainer.length) {
                // Check if Market Tour button needs to be added
                const $buttonsDiv = $actionContainer.find('> div:last-child');
                if ($buttonsDiv.find('#start-market-tour-btn').length === 0) {
                    // Add the Market Tour button if it doesn't exist
                    const marketTourBtn = '<button id="start-market-tour-btn" class="csfp-btn csfp-btn-secondary"><span style="margin-right: 0.5rem;">🗺️</span> Start Market Tour</button>';
                    $buttonsDiv.append(marketTourBtn);
                }
            }
        },
        
        // Add Market Tour button functionality
        addMarketTourButton: function() {
            $(document).on('click', '#start-market-tour-btn', function(e) {
                e.preventDefault();
                // Trigger the market tour modal if it exists
                if (typeof CSFPMarketTour !== 'undefined' && CSFPMarketTour.open) {
                    CSFPMarketTour.open();
                } else if ($('#market-tour-modal').length) {
                    $('#market-tour-modal').addClass('active');
                } else {
                    // Fallback: Create and open a basic market tour modal
                    const modalHtml = `
                        <div id="market-tour-modal" class="csfp-modal active">
                            <div class="csfp-modal-overlay"></div>
                            <div class="csfp-modal-content">
                                <div class="csfp-modal-header">
                                    <h2>Start Market Tour</h2>
                                    <button class="csfp-modal-close">&times;</button>
                                </div>
                                <div class="csfp-modal-body">
                                    <p>Market Tour functionality will be available soon.</p>
                                </div>
                            </div>
                        </div>
                    `;
                    $('body').append(modalHtml);
                }
            });
        },
        
        // Add map guard to prevent scroll capture
        addMapGuard: function() {
            const $mapContainer = $('.csfp-map-container-compact, #map-container').first();
            const $map = $('#csfp-map, #map').first();
            
            if ($mapContainer.length && $map.length) {
                // Add guard overlay if it doesn't exist
                if (!$mapContainer.find('.csfp-map-guard').length) {
                    const guardHtml = '<div class="csfp-map-guard">Tap to interact with map</div>';
                    $mapContainer.css('position', 'relative').append(guardHtml);
                    
                    // Handle guard click
                    $mapContainer.on('click', '.csfp-map-guard', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $(this).addClass('hidden');
                        $map.addClass('interactive');
                        
                        // Re-enable guard when scrolling the page
                        const reenableGuard = function() {
                            $('.csfp-map-guard').removeClass('hidden');
                            $map.removeClass('interactive');
                            $(window).off('scroll.mapguard');
                        };
                        
                        // Wait a bit before listening to scroll
                        setTimeout(() => {
                            $(window).on('scroll.mapguard', reenableGuard);
                        }, 500);
                    });
                }
                
                // Update map initialization to use cooperative gestures
                if (window.google && window.google.maps && window.mapInstance) {
                    window.mapInstance.setOptions({
                        gestureHandling: 'cooperative'
                    });
                }
            }
        },
        
        // Fix scroll traps in nested containers
        fixScrollTraps: function() {
            // Remove overflow from dashboard containers
            $('.csfp-dashboard-compact, .csfp-dashboard-main, .csfp-dashboard-sidebar').css({
                'overflow': 'visible',
                'height': 'auto'
            });
            
            // Add iOS momentum scrolling to activity list
            $('.csfp-activity-scroll').css({
                '-webkit-overflow-scrolling': 'touch',
                'overscroll-behavior': 'contain'
            });
            
            // Prevent body scroll when touching inside scrollable areas
            $('.csfp-activity-scroll').on('touchmove', function(e) {
                const el = $(this)[0];
                const scrollTop = el.scrollTop;
                const scrollHeight = el.scrollHeight;
                const height = el.offsetHeight;
                const delta = e.originalEvent.touches[0].clientY - (this.lastY || e.originalEvent.touches[0].clientY);
                this.lastY = e.originalEvent.touches[0].clientY;
                
                if ((delta > 0 && scrollTop === 0) || (delta < 0 && scrollTop === scrollHeight - height)) {
                    e.preventDefault();
                }
            });
            
            // Reset on touch end
            $('.csfp-activity-scroll').on('touchend', function() {
                this.lastY = null;
            });
        },
        
        // Enhanced popover positioning
        enhancePopovers: function() {
            const self = this;
            
            // Override search popover positioning if it exists
            if (window.CSFPQuickSearch) {
                const originalShow = window.CSFPQuickSearch.showResults;
                
                window.CSFPQuickSearch.showResults = function(results) {
                    // Call original
                    if (originalShow) {
                        originalShow.call(this, results);
                    }
                    
                    // Ensure proper positioning
                    self.positionPopover($('#' + this.portalId), $('#' + this.inputId));
                };
            }
            
            // Generic popover positioning function
            this.positionPopover = function($popover, $anchor) {
                if (!$popover.length || !$anchor.length) return;
                
                // Always append to body
                if ($popover.parent()[0] !== document.body) {
                    $popover.appendTo('body');
                }
                
                const rect = $anchor[0].getBoundingClientRect();
                
                $popover.css({
                    'position': 'fixed',
                    'left': rect.left + 'px',
                    'top': (rect.bottom + 6) + 'px',
                    'min-width': rect.width + 'px',
                    'z-index': getComputedStyle(document.documentElement).getPropertyValue('--z-popover') || 9999
                });
                
                // Adjust if popover goes off screen
                const popRect = $popover[0].getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                if (popRect.bottom > viewportHeight) {
                    const newTop = Math.max(10, rect.top - popRect.height - 6);
                    $popover.css('top', newTop + 'px');
                }
            };
            
            // Listen for Visual Viewport changes (keyboard)
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', function() {
                    $('.csfp-popover:visible, .csfp-search-portal:visible').each(function() {
                        const $popover = $(this);
                        const anchorId = $popover.data('anchor');
                        if (anchorId) {
                            self.positionPopover($popover, $('#' + anchorId));
                        }
                    });
                });
            }
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPDashboardFix.init();
        
        // Re-initialize on orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                CSFPDashboardFix.init();
            }, 100);
        });
        
        // Initialize map with cooperative gestures if not already done
        if (window.initCSFPMap) {
            const originalInitMap = window.initCSFPMap;
            window.initCSFPMap = function() {
                originalInitMap();
                
                // Add cooperative gestures to map
                setTimeout(() => {
                    if (window.mapInstance && window.google && window.google.maps) {
                        window.mapInstance.setOptions({
                            gestureHandling: 'cooperative'
                        });
                    }
                }, 500);
            };
        }
    });
    
})(jQuery);