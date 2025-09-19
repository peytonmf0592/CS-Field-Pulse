/**
 * CS Field Pulse - Fixed Floating Particles Background
 */

jQuery(document).ready(function($) {
    'use strict';
    
    function initParticles() {
        // Remove any existing particles first
        $('.csfp-particles-wrapper').remove();
        
        // Create particles wrapper that covers entire viewport
        const particlesWrapper = $('<div class="csfp-particles-wrapper"></div>');
        particlesWrapper.css({
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'pointer-events': 'none',
            'z-index': '1',
            'overflow': 'hidden'
        });
        
        // Create 50 particles
        for (let i = 0; i < 50; i++) {
            const particle = $('<div class="csfp-floating-particle"></div>');
            
            // Random properties
            const size = Math.random() * 4 + 2; // 2-6px
            const startX = Math.random() * 100;
            const duration = Math.random() * 60 + 40; // 40-100s
            const delay = Math.random() * 40;
            const opacity = Math.random() * 0.4 + 0.1;
            
            // Color variations
            let color = 'rgba(32, 227, 123, 0.6)'; // Default green
            if (i % 5 === 0) color = 'rgba(0, 150, 255, 0.6)'; // Blue
            if (i % 7 === 0) color = 'rgba(255, 204, 0, 0.6)'; // Yellow
            if (i % 11 === 0) color = 'rgba(255, 68, 68, 0.6)'; // Red
            
            particle.css({
                'position': 'absolute',
                'width': size + 'px',
                'height': size + 'px',
                'background': color,
                'border-radius': '50%',
                'left': startX + '%',
                'bottom': '-10px',
                'opacity': opacity,
                'pointer-events': 'none',
                'animation': `floatUpSlow ${duration}s ${delay}s infinite linear`,
                'will-change': 'transform',
                'box-shadow': `0 0 ${size * 2}px ${color}`
            });
            
            particlesWrapper.append(particle);
        }
        
        // Append to body
        $('body').append(particlesWrapper);
        
        // Add the CSS animation if not already present
        if (!$('#csfp-particle-styles').length) {
            const styles = `
                <style id="csfp-particle-styles">
                    @keyframes floatUpSlow {
                        0% {
                            transform: translateY(0) translateX(0) scale(0);
                            opacity: 0;
                        }
                        10% {
                            transform: translateY(-10vh) translateX(10px) scale(1);
                            opacity: 0.4;
                        }
                        20% {
                            transform: translateY(-20vh) translateX(-10px) scale(1.1);
                        }
                        30% {
                            transform: translateY(-30vh) translateX(15px) scale(1);
                        }
                        40% {
                            transform: translateY(-40vh) translateX(-5px) scale(0.9);
                        }
                        50% {
                            transform: translateY(-50vh) translateX(10px) scale(1);
                            opacity: 0.3;
                        }
                        60% {
                            transform: translateY(-60vh) translateX(-15px) scale(1.1);
                        }
                        70% {
                            transform: translateY(-70vh) translateX(5px) scale(1);
                        }
                        80% {
                            transform: translateY(-80vh) translateX(-10px) scale(0.9);
                            opacity: 0.2;
                        }
                        90% {
                            transform: translateY(-90vh) translateX(10px) scale(0.8);
                            opacity: 0.1;
                        }
                        100% {
                            transform: translateY(-100vh) translateX(0) scale(0.5);
                            opacity: 0;
                        }
                    }
                    
                    .csfp-floating-particle {
                        filter: blur(0.5px);
                    }
                    
                    /* Ensure particles stay behind content */
                    .csfp-container > *:not(.csfp-particles-wrapper) {
                        position: relative;
                        z-index: 2;
                    }
                </style>
            `;
            $('head').append(styles);
        }
    }
    
    // Initialize immediately
    initParticles();
    
    // Reinitialize on ajax complete (for page changes)
    $(document).on('ajaxComplete', function() {
        if (!$('.csfp-particles-wrapper').length) {
            initParticles();
        }
    });
});