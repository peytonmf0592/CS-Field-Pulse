/**
 * CS Field Pulse - Mobile Map Optimization
 * Fixes map sizing and scroll capture issues on mobile
 */

(function($) {
    'use strict';
    
    window.CSFPMobileMap = {
        map: null,
        guard: null,
        container: null,
        
        init: function() {
            // The actual map element ID from dashboard.php is 'csfp-map'
            this.container = document.getElementById('csfp-map');
            if (!this.container) return;
            
            // Only apply mobile fixes on mobile
            if (window.innerWidth > 640) return;
            
            this.setupMapWrapper();
            this.addMapGuard();
            this.enhanceMapInit();
        },
        
        /**
         * Setup map wrapper for proper sizing
         */
        setupMapWrapper: function() {
            const $container = $(this.container);
            
            // Ensure container has proper wrapper
            if (!$container.parent().hasClass('csfp-map-wrap')) {
                $container.wrap('<div class="csfp-map-wrap"></div>');
            }
            
            const $wrapper = $container.parent('.csfp-map-wrap');
            
            // Set mobile-optimized dimensions
            $wrapper.css({
                'position': 'relative',
                'width': '100%',
                'height': '320px',
                'border-radius': '12px',
                'overflow': 'hidden',
                'margin': '1rem 0'
            });
            
            $container.css({
                'width': '100%',
                'height': '100%'
            });
        },
        
        /**
         * Add interactive guard overlay
         */
        addMapGuard: function() {
            const $wrapper = $(this.container).parent('.csfp-map-wrap');
            
            // Check if guard already exists
            if ($wrapper.find('.csfp-map-guard').length > 0) return;
            
            // Create guard button
            this.guard = $(`
                <button class="csfp-map-guard" aria-label="Tap to interact with map">
                    <span class="csfp-map-guard-text">Tap to interact with map</span>
                </button>
            `);
            
            // Add guard to wrapper
            $wrapper.append(this.guard);
            
            // Style the guard
            this.guard.css({
                'position': 'absolute',
                'inset': '0',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'background': 'rgba(0, 0, 0, 0.15)',
                'color': '#fff',
                'font-weight': '600',
                'font-size': '14px',
                'border': 'none',
                'border-radius': '12px',
                'cursor': 'pointer',
                'z-index': '2',
                'backdrop-filter': 'blur(2px)',
                '-webkit-backdrop-filter': 'blur(2px)'
            });
            
            // Handle guard interaction
            this.setupGuardBehavior();
        },
        
        /**
         * Setup guard click and scroll behavior
         */
        setupGuardBehavior: function() {
            const self = this;
            
            // Click to enable map
            this.guard.on('click touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Hide guard
                $(this).fadeOut(200);
                
                // Enable map gestures
                if (self.map && self.map.setOptions) {
                    self.map.setOptions({ 
                        gestureHandling: 'greedy',
                        zoomControl: true,
                        scrollwheel: true
                    });
                }
                
                // Add class for styling
                $(self.container).addClass('interactive');
                
                // Setup scroll listener to re-enable guard
                self.setupScrollListener();
            });
        },
        
        /**
         * Re-enable guard when scrolling away
         */
        setupScrollListener: function() {
            const self = this;
            let scrollTimeout;
            
            const checkMapVisibility = function() {
                if (!self.container) return;
                
                const rect = self.container.getBoundingClientRect();
                const isOffscreen = rect.bottom < -50 || rect.top > window.innerHeight + 50;
                
                if (isOffscreen && self.guard.is(':hidden')) {
                    // Re-enable guard
                    self.guard.fadeIn(200);
                    
                    // Disable map gestures
                    if (self.map && self.map.setOptions) {
                        self.map.setOptions({ 
                            gestureHandling: 'cooperative',
                            scrollwheel: false
                        });
                    }
                    
                    // Remove interactive class
                    $(self.container).removeClass('interactive');
                    
                    // Remove this scroll listener
                    $(window).off('scroll.mapguard');
                }
            };
            
            // Debounced scroll handler
            $(window).on('scroll.mapguard', function() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(checkMapVisibility, 100);
            });
        },
        
        /**
         * Enhance map initialization
         */
        enhanceMapInit: function() {
            const self = this;
            
            // Override or enhance existing map init
            const originalInitMap = window.initCSFPMap || window.initMap;
            
            window.initCSFPMap = window.initMap = function() {
                // Call original if exists
                if (originalInitMap && originalInitMap !== window.initCSFPMap) {
                    originalInitMap();
                }
                
                // Wait for map instance
                setTimeout(() => {
                    self.configureMap();
                }, 500);
            };
            
            // If map already exists, configure it
            if (window.mapInstance || window.map) {
                this.configureMap();
            }
        },
        
        /**
         * Configure map for mobile
         */
        configureMap: function() {
            // Find map instance - use csfpMap which is the correct instance
            this.map = window.csfpMap || window.mapInstance || window.map || null;
            
            if (this.map) {
                // Configure existing map for mobile
                this.map.setOptions({
                    gestureHandling: 'cooperative',
                    fullscreenControl: false,
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_RIGHT
                    },
                    streetViewControl: false, // Disable on mobile to save space
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    scrollwheel: false
                });
            }
            // Don't create a new map - let the original initCSFPMap handle it
        },
        
        /**
         * Destroy and cleanup
         */
        destroy: function() {
            if (this.guard) {
                this.guard.remove();
            }
            $(window).off('scroll.mapguard');
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPMobileMap.init();
        
        // Re-init on orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                CSFPMobileMap.init();
            }, 300);
        });
    });
    
})(jQuery);