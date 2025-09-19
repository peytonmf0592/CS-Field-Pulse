/**
 * CS Field Pulse - iOS Safari Enhancements
 * Handles keyboard detection, viewport changes, and bottom sheets
 */

(function($) {
    'use strict';
    
    window.CSFPiOS = {
        isIOS: false,
        isMobile: false,
        keyboardHeight: 0,
        visualViewport: null,
        
        init: function() {
            // Detect iOS
            this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            this.isMobile = window.innerWidth <= 768;
            
            // Only run iOS optimizations on iOS devices
            if (!this.isIOS) return;
            
            this.setupVisualViewport();
            this.handleKeyboard();
            this.setupBottomSheets();
            this.optimizeMap();
            this.enhanceTouch();
            this.fixSearchPortal();
        },
        
        // Setup visual viewport for keyboard detection
        setupVisualViewport: function() {
            if (!window.visualViewport) return;
            
            this.visualViewport = window.visualViewport;
            const self = this;
            
            // Listen for viewport changes (keyboard show/hide)
            this.visualViewport.addEventListener('resize', function() {
                self.handleViewportResize();
            });
            
            this.visualViewport.addEventListener('scroll', function() {
                self.handleViewportScroll();
            });
        },
        
        // Handle viewport resize (keyboard events)
        handleViewportResize: function() {
            if (!this.visualViewport) return;
            
            const vv = this.visualViewport;
            const windowHeight = window.innerHeight;
            const visualHeight = vv.height;
            const keyboardHeight = Math.max(0, windowHeight - visualHeight - vv.offsetTop);
            
            this.keyboardHeight = keyboardHeight;
            
            // Update CSS variable for keyboard height
            document.documentElement.style.setProperty('--keyboard-height', keyboardHeight + 'px');
            document.documentElement.style.setProperty('--visual-viewport-height', visualHeight + 'px');
            
            // Add class when keyboard is visible
            if (keyboardHeight > 100) {
                $('body').addClass('keyboard-visible');
                $('.csfp-modal').addClass('keyboard-visible');
                $('.csfp-search-portal').addClass('keyboard-visible');
                
                // Adjust bottom sheets
                this.adjustBottomSheets(keyboardHeight);
                
                // Reposition search portal
                this.repositionSearchPortal();
            } else {
                $('body').removeClass('keyboard-visible');
                $('.csfp-modal').removeClass('keyboard-visible');
                $('.csfp-search-portal').removeClass('keyboard-visible');
                
                // Reset bottom sheets
                this.adjustBottomSheets(0);
            }
        },
        
        // Handle viewport scroll
        handleViewportScroll: function() {
            // Reposition fixed elements if needed
            this.repositionSearchPortal();
        },
        
        // Setup keyboard handling
        handleKeyboard: function() {
            const self = this;
            
            // Prevent zoom on input focus
            $(document).on('focus', 'input, select, textarea', function() {
                $(this).attr('data-focused', 'true');
                
                // Scroll input into view above keyboard
                setTimeout(() => {
                    if (self.keyboardHeight > 0) {
                        const input = this;
                        const rect = input.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const targetY = rect.top + scrollTop - 100;
                        
                        window.scrollTo({
                            top: targetY,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            });
            
            $(document).on('blur', 'input, select, textarea', function() {
                $(this).removeAttr('data-focused');
            });
        },
        
        // Setup bottom sheets for modals
        setupBottomSheets: function() {
            if (!this.isMobile) return;
            
            const self = this;
            
            // Convert modals to bottom sheets on mobile
            $('.csfp-modal').each(function() {
                const modal = $(this);
                
                // Add swipe to dismiss
                let startY = 0;
                let currentY = 0;
                let isDragging = false;
                
                modal.find('.csfp-modal-content').on('touchstart', function(e) {
                    startY = e.touches[0].clientY;
                    isDragging = true;
                });
                
                modal.find('.csfp-modal-content').on('touchmove', function(e) {
                    if (!isDragging) return;
                    
                    currentY = e.touches[0].clientY;
                    const deltaY = currentY - startY;
                    
                    // Only allow dragging down
                    if (deltaY > 0) {
                        $(this).css('transform', `translateY(${deltaY}px)`);
                    }
                });
                
                modal.find('.csfp-modal-content').on('touchend', function(e) {
                    if (!isDragging) return;
                    isDragging = false;
                    
                    const deltaY = currentY - startY;
                    
                    // If dragged more than 100px, close modal
                    if (deltaY > 100) {
                        modal.removeClass('active');
                        $(this).css('transform', '');
                    } else {
                        // Snap back
                        $(this).css('transform', '');
                    }
                });
            });
        },
        
        // Adjust bottom sheets when keyboard appears
        adjustBottomSheets: function(keyboardHeight) {
            $('.csfp-modal.active .csfp-modal-content').css({
                'bottom': keyboardHeight + 'px',
                'transition': 'bottom 0.2s ease-out'
            });
        },
        
        // Optimize map for iOS
        optimizeMap: function() {
            if (!this.isMobile) return;
            
            const mapContainer = $('#map-container');
            if (!mapContainer.length) return;
            
            // Prevent accidental scroll capture
            mapContainer.addClass('inactive');
            
            // Enable map interaction on tap
            mapContainer.on('click touchstart', function() {
                $(this).removeClass('inactive').addClass('active');
            });
            
            // Disable on scroll
            $(window).on('scroll', function() {
                mapContainer.removeClass('active').addClass('inactive');
            });
            
            // Lazy load map when in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Trigger map initialization
                        if (typeof initCSFPMap === 'function' && !mapContainer.data('initialized')) {
                            initCSFPMap();
                            mapContainer.data('initialized', true);
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(mapContainer[0]);
        },
        
        // Enhance touch interactions
        enhanceTouch: function() {
            // Add active states for better touch feedback
            $(document).on('touchstart', '.csfp-btn, .csfp-card, .csfp-preset-chip', function() {
                $(this).addClass('touch-active');
            });
            
            $(document).on('touchend touchcancel', '.csfp-btn, .csfp-card, .csfp-preset-chip', function() {
                $(this).removeClass('touch-active');
            });
            
            // Make cards fully tappable
            $('.csfp-activity-card, .csfp-list-item').each(function() {
                const card = $(this);
                const link = card.find('a').first();
                
                if (link.length) {
                    card.css('cursor', 'pointer');
                    card.on('click', function(e) {
                        if (!$(e.target).is('a, button')) {
                            link[0].click();
                        }
                    });
                }
            });
            
            // Improve scrolling performance
            $('.csfp-list, .csfp-activity-feed').on('touchstart', function() {
                $(this).addClass('scrolling');
            });
            
            $('.csfp-list, .csfp-activity-feed').on('touchend', function() {
                $(this).removeClass('scrolling');
            });
        },
        
        // Fix search portal positioning
        fixSearchPortal: function() {
            // Ensure search portal is properly positioned
            const self = this;
            
            // Override the updatePortalPosition function if it exists
            if (window.CSFPQuickSearch && window.CSFPQuickSearch.updatePortalPosition) {
                const originalUpdate = window.CSFPQuickSearch.updatePortalPosition;
                
                window.CSFPQuickSearch.updatePortalPosition = function() {
                    // Call original function
                    originalUpdate.call(this);
                    
                    const $portal = $('#' + this.portalId);
                    const $input = $('#' + this.inputId);
                    
                    if (!$portal.length || !$input.length) return;
                    
                    // Always render to body and use fixed positioning
                    if ($portal.parent()[0] !== document.body) {
                        $portal.appendTo('body');
                    }
                    
                    // Get input position
                    const rect = $input[0].getBoundingClientRect();
                    
                    // Position portal below input
                    $portal.css({
                        position: 'fixed',
                        minWidth: rect.width + 'px',
                        left: rect.left + 'px',
                        top: (rect.bottom + 6) + 'px',
                        zIndex: getComputedStyle(document.documentElement).getPropertyValue('--z-popover') || 9999
                    });
                    
                    // Additional iOS adjustments
                    if (self.isIOS && self.keyboardHeight > 0) {
                        const currentTop = parseInt($portal.css('top'));
                        const visualHeight = self.visualViewport ? self.visualViewport.height : window.innerHeight;
                        
                        // Ensure portal stays above keyboard
                        if (currentTop + $portal.height() > visualHeight - 20) {
                            const newTop = Math.max(60, visualHeight - $portal.height() - 20);
                            $portal.css('top', newTop + 'px');
                        }
                    }
                };
            }
        },
        
        // Reposition search portal when keyboard appears
        repositionSearchPortal: function() {
            if (window.CSFPQuickSearch && window.CSFPQuickSearch.updatePortalPosition) {
                window.CSFPQuickSearch.updatePortalPosition();
            }
        },
        
        // Utility: Check if element is in viewport
        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPiOS.init();
        
        // Re-initialize on orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                CSFPiOS.handleViewportResize();
            }, 100);
        });
        
        // Listen for Visual Viewport changes to reposition popovers
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                const activeInput = document.querySelector('.csfp-quick-search-input:focus');
                if (activeInput && window.CSFPQuickSearch) {
                    window.CSFPQuickSearch.updatePortalPosition();
                }
            });
            
            window.visualViewport.addEventListener('scroll', function() {
                const activeInput = document.querySelector('.csfp-quick-search-input:focus');
                if (activeInput && window.CSFPQuickSearch) {
                    window.CSFPQuickSearch.updatePortalPosition();
                }
            });
        }
    });
    
})(jQuery);