/**
 * CS Field Pulse - Heatmap Visualization Fix
 * Ensures heatmap displays properly with gradient overlay
 */

(function($) {
    'use strict';
    
    window.CSFPHeatmapFix = {
        init: function() {
            // Wait for map to be initialized
            this.waitForMap();
        },
        
        waitForMap: function() {
            const checkInterval = setInterval(() => {
                if (window.csfpMap && window.google && window.google.maps && window.google.maps.visualization) {
                    clearInterval(checkInterval);
                    this.enhanceHeatmap();
                }
            }, 500);
            
            // Stop checking after 10 seconds
            setTimeout(() => clearInterval(checkInterval), 10000);
        },
        
        enhanceHeatmap: function() {
            // Store original loadMapData function
            const originalLoadMapData = window.loadMapData;
            
            // Override loadMapData to ensure heatmap is visible
            window.loadMapData = function(market) {
                // Call original function
                if (originalLoadMapData) {
                    originalLoadMapData.call(this, market);
                }
                
                // Enhance heatmap after data loads
                setTimeout(() => {
                    CSFPHeatmapFix.makeHeatmapVisible();
                }, 1000);
            };
            
            // Also enhance existing heatmap if it exists
            this.makeHeatmapVisible();
        },
        
        makeHeatmapVisible: function() {
            if (!window.csfpHeatmap) return;
            
            // Ensure heatmap is on the map
            if (window.csfpHeatmap.getMap() !== window.csfpMap) {
                window.csfpHeatmap.setMap(window.csfpMap);
            }
            
            // Update heatmap options for better visibility
            window.csfpHeatmap.setOptions({
                radius: 60,  // Increased from 50
                opacity: 0.8,  // Make more opaque
                maxIntensity: 10,  // Adjust intensity
                dissipating: true,
                gradient: [
                    'rgba(0, 0, 0, 0)',
                    'rgba(255, 0, 0, 0.3)',      // Red (detractor)
                    'rgba(255, 68, 68, 0.5)',    
                    'rgba(255, 165, 0, 0.6)',    // Orange
                    'rgba(255, 204, 0, 0.7)',    // Yellow (passive)
                    'rgba(255, 255, 0, 0.8)',    
                    'rgba(144, 238, 144, 0.9)',  // Light green
                    'rgba(0, 255, 0, 1)'          // Green (promoter)
                ]
            });
            
            // Force map to refresh
            google.maps.event.trigger(window.csfpMap, 'resize');
        },
        
        // Fix map styling to show heatmap better
        fixMapStyling: function() {
            if (!window.csfpMap) return;
            
            // Use a lighter map style that shows heatmap better
            const lightStyle = [
                {
                    "featureType": "all",
                    "elementType": "geometry",
                    "stylers": [{"color": "#2c2c2c"}]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [{"color": "#8a8a8a"}]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [{"color": "#1a1a1a"}]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{"color": "#1a1a1a"}]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{"color": "#2c2c2c"}]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#4a4a4a"}, {"weight": 0.5}]
                }
            ];
            
            window.csfpMap.setOptions({
                styles: lightStyle,
                backgroundColor: '#1a1a1a'
            });
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPHeatmapFix.init();
        
        // Also initialize when dashboard data loads
        $(document).on('csfp:dashboard:loaded', function() {
            CSFPHeatmapFix.makeHeatmapVisible();
        });
    });
    
    // Make function globally available for debugging
    window.forceShowHeatmap = function() {
        CSFPHeatmapFix.makeHeatmapVisible();
        CSFPHeatmapFix.fixMapStyling();
        console.log('Heatmap forced to show');
    };
    
})(jQuery);