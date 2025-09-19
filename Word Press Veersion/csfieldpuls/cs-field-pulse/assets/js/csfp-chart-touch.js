/**
 * CS Field Pulse - Chart Touch Interaction Handler
 * Improves touch interactions on mobile charts
 */

(function($) {
    'use strict';
    
    // Add visual feedback for touch-hold
    function addTouchFeedback() {
        // Create feedback overlay if it doesn't exist
        if (!$('#touch-feedback').length) {
            $('body').append('<div id="touch-feedback" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);color:#20E37B;padding:12px 20px;border-radius:8px;z-index:99999;font-size:14px;font-weight:600;pointer-events:none;">Hold to view • Release to cancel</div>');
        }
        
        // Track all chart canvases
        $('canvas').each(function() {
            if (this.hasAttribute('data-feedback-tracked')) return;
            this.setAttribute('data-feedback-tracked', 'true');
            
            let touchTimer;
            let feedbackShown = false;
            
            $(this).on('touchstart', function(e) {
                feedbackShown = false;
                // Show feedback after 200ms of holding
                touchTimer = setTimeout(function() {
                    $('#touch-feedback').fadeIn(200);
                    feedbackShown = true;
                    // Add haptic feedback if available
                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }
                }, 200);
            });
            
            $(this).on('touchend touchcancel', function(e) {
                clearTimeout(touchTimer);
                if (feedbackShown) {
                    $('#touch-feedback').fadeOut(100);
                }
            });
            
            $(this).on('touchmove', function(e) {
                // Cancel if finger moves too much
                clearTimeout(touchTimer);
                if (feedbackShown) {
                    $('#touch-feedback').fadeOut(100);
                    feedbackShown = false;
                }
            });
        });
    }
    
    // Initialize on document ready
    $(document).ready(function() {
        // Only run on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            addTouchFeedback();
            
            // Re-run when new charts are added
            const observer = new MutationObserver(function(mutations) {
                addTouchFeedback();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
    
})(jQuery);