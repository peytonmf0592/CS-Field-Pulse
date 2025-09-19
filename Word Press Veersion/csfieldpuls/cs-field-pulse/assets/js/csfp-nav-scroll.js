/**
 * CS Field Pulse - Navigation Scroll Functionality
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Handle Dashboard scroll link
        $(document).on('click', 'a[data-scroll="stats"]', function(e) {
            e.preventDefault();
            
            const target = $('#stats-section');
            if (target.length) {
                // Calculate scroll position with offset for fixed elements
                const scrollTop = target.offset().top - 100;
                
                // Stop any ongoing animations first
                $('html, body').stop(true, false);
                
                // Use native smooth scroll for better performance
                window.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            }
        });
        
        // Optional: Update active state when scrolling
        $(window).on('scroll', function() {
            const scrollPos = $(window).scrollTop();
            const statsSection = $('#stats-section');
            
            if (statsSection.length) {
                const statsTop = statsSection.offset().top - 150;
                const statsBottom = statsTop + statsSection.outerHeight();
                
                if (scrollPos >= statsTop && scrollPos < statsBottom) {
                    // Update Dashboard link to active if within stats section
                    $('.csfp-nav-item[data-scroll="stats"]').addClass('active');
                }
            }
        });
    });
})(jQuery);