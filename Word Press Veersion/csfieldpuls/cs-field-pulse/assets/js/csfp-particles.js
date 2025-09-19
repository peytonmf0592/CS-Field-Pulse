/**
 * CS Field Pulse - Floating Particles Effect
 * Creates a consistent particle animation across all pages
 */

(function($) {
    'use strict';
    
    // Enhanced particle creation with consistent timing
    function createParticles() {
        console.log('Creating particles...');
        
        // Check if particles already exist anywhere
        if ($('.csfp-particles').length) {
            console.log('Particles already exist');
            return;
        }
        
        // Find the main container - try multiple selectors
        let container = $('.csfp-container');
        
        // If no container, check for any main content area
        if (!container.length) {
            container = $('body > div').first();
        }
        
        // If still nothing, use body directly
        if (!container.length || container.is('body')) {
            container = $('body');
        }
        
        // Ensure container has position relative
        if (container.css('position') === 'static') {
            container.css('position', 'relative');
        }
        
        // Create particle container
        const particlesContainer = $('<div class="csfp-particles"></div>');
        
        // Create 60 particles for better coverage
        for (let i = 0; i < 60; i++) {
            const particle = $('<div class="csfp-particle"></div>');
            
            // Random starting position
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            
            // Random size (2-6px)
            const size = Math.random() * 4 + 2;
            
            // Random opacity (0.1-0.5)
            const opacity = Math.random() * 0.4 + 0.1;
            
            // Consistent slower animation (40-80 seconds)
            const duration = Math.random() * 40 + 40;
            
            // Random delay (0-40 seconds)
            const delay = Math.random() * 40;
            
            particle.css({
                left: startX + '%',
                top: startY + '%',
                width: size + 'px',
                height: size + 'px',
                opacity: opacity,
                animationDuration: duration + 's',
                animationDelay: delay + 's'
            });
            
            particlesContainer.append(particle);
        }
        
        // Prepend to container
        container.css('position', 'relative').prepend(particlesContainer);
        
        // Add some variations for visual interest
        addParticleVariations();
    }
    
    // Add some colored particle variations
    function addParticleVariations() {
        const particles = $('.csfp-particle');
        particles.each(function(index) {
            if (index % 5 === 0) {
                // Every 5th particle gets a blue tint
                $(this).css('background', 'rgba(0, 150, 255, 0.6)');
            } else if (index % 7 === 0) {
                // Every 7th particle gets a yellow tint
                $(this).css('background', 'rgba(255, 204, 0, 0.6)');
            } else if (index % 11 === 0) {
                // Every 11th particle gets a brighter green
                $(this).css('background', 'rgba(32, 227, 123, 0.8)');
            }
        });
    }
    
    // Initialize particles when DOM is ready
    $(document).ready(function() {
        console.log('Document ready, initializing particles');
        // Immediate creation
        createParticles();
        
        // Retry after short delay
        setTimeout(function() {
            if (!$('.csfp-particles').length) {
                console.log('Retrying particle creation...');
                createParticles();
            }
        }, 500);
        
        // Re-check after AJAX loads
        $(document).on('ajaxComplete', function() {
            if (!$('.csfp-particles').length) {
                setTimeout(createParticles, 500);
            }
        });
    });
    
    // Also run on window load as backup
    $(window).on('load', function() {
        if (!$('.csfp-particles').length) {
            console.log('Window loaded, final particle attempt');
            createParticles();
        }
    });
    
    // Make function globally available for debugging
    window.CSFPCreateParticles = createParticles;
    
})(jQuery);