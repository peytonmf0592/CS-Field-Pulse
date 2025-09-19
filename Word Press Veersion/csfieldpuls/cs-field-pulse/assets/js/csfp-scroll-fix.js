/**
 * CS Field Pulse - Scroll Capture Fix
 * Prevents map and other elements from capturing page scroll
 */

(function($) {
    'use strict';
    
    window.CSFPScrollFix = {
        init: function() {
            // Only run on mobile
            if (window.innerWidth > 640) return;
            
            this.fixContainerOverflow();
            this.setupMapScrollPrevention();
            this.setupActivityScrollBoundary();
            this.preventChartScroll();
            this.addScrollListeners();
        },
        
        /**
         * Fix container overflow issues
         */
        fixContainerOverflow: function() {
            // Remove all overflow settings from main containers
            $('.csfp-container, .csfp-dashboard-compact, .csfp-dashboard-main, .csfp-dashboard-sidebar').css({
                'overflow': 'visible',
                'height': 'auto',
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            
            // Ensure body uses page scroll
            $('html, body').css({
                'overflow-x': 'hidden',
                'overflow-y': 'auto',
                '-webkit-overflow-scrolling': 'touch'
            });
        },
        
        /**
         * Setup map scroll prevention
         */
        setupMapScrollPrevention: function() {
            const $mapContainer = $('#csfp-map').parent();
            const $map = $('#csfp-map');
            
            if (!$map.length) return;
            
            // Ensure map has a guard
            if (!$mapContainer.find('.csfp-map-guard').length) {
                const $guard = $(`
                    <div class="csfp-map-guard">
                        <span class="csfp-map-guard-text">Tap to interact with map</span>
                    </div>
                `);
                
                $mapContainer.css('position', 'relative').append($guard);
                
                // Guard click handler
                $guard.on('click touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    $(this).addClass('hidden');
                    $map.addClass('interactive');
                    
                    // Enable map interaction
                    if (window.csfpMap) {
                        window.csfpMap.setOptions({
                            gestureHandling: 'greedy',
                            scrollwheel: true,
                            zoomControl: true
                        });
                    }
                    
                    // Re-enable guard when scrolling away
                    setTimeout(() => {
                        CSFPScrollFix.watchMapScroll($guard, $map);
                    }, 500);
                });
            }
            
            // Prevent scroll when map is not interactive
            $map.on('wheel touchmove', function(e) {
                if (!$(this).hasClass('interactive')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
            
            // Initial state - disable map interaction
            if (window.csfpMap) {
                window.csfpMap.setOptions({
                    gestureHandling: 'none',
                    scrollwheel: false,
                    disableDoubleClickZoom: true,
                    draggable: false
                });
            }
        },
        
        /**
         * Watch for scroll away from map
         */
        watchMapScroll: function($guard, $map) {
            let scrollTimer;
            const checkScroll = function() {
                const mapRect = $map[0].getBoundingClientRect();
                const isOffscreen = mapRect.bottom < -50 || mapRect.top > window.innerHeight + 50;
                
                if (isOffscreen) {
                    // Re-enable guard
                    $guard.removeClass('hidden');
                    $map.removeClass('interactive');
                    
                    // Disable map interaction
                    if (window.csfpMap) {
                        window.csfpMap.setOptions({
                            gestureHandling: 'none',
                            scrollwheel: false,
                            disableDoubleClickZoom: true,
                            draggable: false
                        });
                    }
                    
                    // Remove scroll listener
                    $(window).off('scroll.mapwatch');
                }
            };
            
            $(window).on('scroll.mapwatch', function() {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(checkScroll, 100);
            });
        },
        
        /**
         * Setup activity scroll boundary
         */
        setupActivityScrollBoundary: function() {
            const $activityScroll = $('.csfp-activity-scroll');
            
            if (!$activityScroll.length) return;
            
            // Prevent scroll propagation to page
            $activityScroll.on('touchstart', function(e) {
                this.startY = e.touches[0].pageY;
                this.startScrollTop = this.scrollTop;
            });
            
            $activityScroll.on('touchmove', function(e) {
                const currentY = e.touches[0].pageY;
                const deltaY = this.startY - currentY;
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight;
                const clientHeight = this.clientHeight;
                
                // At top and trying to scroll up
                if (scrollTop === 0 && deltaY < 0) {
                    e.preventDefault();
                    return false;
                }
                
                // At bottom and trying to scroll down
                if (scrollTop + clientHeight >= scrollHeight && deltaY > 0) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        
        /**
         * Prevent chart containers from capturing scroll
         */
        preventChartScroll: function() {
            // Disable touch events on chart canvases
            $('canvas').on('touchmove wheel', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Allow click but not scroll on chart containers
            $('.csfp-chart-container-compact, .csfp-chart-wrapper-compact').on('touchmove wheel', function(e) {
                // Allow vertical scroll to pass through to page
                e.stopPropagation();
                return false;
            });
        },
        
        /**
         * Add global scroll listeners
         */
        addScrollListeners: function() {
            // Prevent horizontal scroll
            $(document).on('touchmove', function(e) {
                if (e.touches[0].clientX < 0 || e.touches[0].clientX > window.innerWidth) {
                    e.preventDefault();
                }
            });
            
            // iOS elastic scroll prevention
            let startY = 0;
            $(document).on('touchstart', function(e) {
                startY = e.touches[0].pageY;
            });
            
            $(document).on('touchmove', function(e) {
                const y = e.touches[0].pageY;
                const scrollTop = window.pageYOffset;
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = window.innerHeight;
                
                // Prevent overscroll at top
                if (scrollTop === 0 && y > startY) {
                    if (!$(e.target).closest('.csfp-activity-scroll').length) {
                        e.preventDefault();
                    }
                }
                
                // Prevent overscroll at bottom
                if (scrollTop + clientHeight >= scrollHeight && y < startY) {
                    if (!$(e.target).closest('.csfp-activity-scroll').length) {
                        e.preventDefault();
                    }
                }
            });
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPScrollFix.init();
        
        // Re-init on orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                CSFPScrollFix.init();
            }, 300);
        });
        
        // Re-init on resize (for testing)
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth <= 640) {
                    CSFPScrollFix.init();
                }
            }, 250);
        });
    });
    
})(jQuery);