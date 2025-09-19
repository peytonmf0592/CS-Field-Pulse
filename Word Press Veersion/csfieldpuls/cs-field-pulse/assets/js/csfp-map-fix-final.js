/**
 * CS Field Pulse - Final Map Fix
 * Ensures map displays with dark theme and proper heatmap
 */

(function($) {
    'use strict';
    
    window.CSFPMapFix = {
        darkStyles: [
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
        ],
        
        init: function() {
            this.fixMapInitialization();
            this.ensureProperTheme();
            this.fixHeatmapDisplay();
        },
        
        fixMapInitialization: function() {
            // Override the map initialization to ensure dark theme
            const originalInit = window.initCSFPMap;
            const self = this;
            
            window.initCSFPMap = function() {
                const mapElement = document.getElementById('csfp-map');
                if (!mapElement) return;
                
                // Create map with dark theme
                const mapOptions = {
                    zoom: 4,
                    center: { lat: 39.8283, lng: -98.5795 },
                    styles: self.darkStyles,
                    backgroundColor: '#0a0a0a',
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_RIGHT,
                        mapTypeIds: ['roadmap', 'satellite']
                    },
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    // Start with cooperative on mobile
                    gestureHandling: window.innerWidth <= 640 ? 'cooperative' : 'greedy'
                };
                
                // Create map
                window.csfpMap = new google.maps.Map(mapElement, mapOptions);
                
                // Initialize arrays
                window.csfpMarkers = [];
                window.csfpInfoWindows = [];
                
                // Load map data
                loadMapData();
                
                // Ensure theme persists
                setTimeout(() => {
                    self.ensureProperTheme();
                }, 500);
            };
            
            // If map already exists, fix it
            if (window.csfpMap) {
                this.ensureProperTheme();
            }
        },
        
        ensureProperTheme: function() {
            if (!window.csfpMap) return;
            
            // Force dark theme
            window.csfpMap.setOptions({
                styles: this.darkStyles,
                backgroundColor: '#0a0a0a'
            });
            
            // Ensure the map container has dark background
            $('#csfp-map').css({
                'background-color': '#0a0a0a'
            });
        },
        
        fixHeatmapDisplay: function() {
            // Override loadMapData to ensure heatmap displays correctly
            const originalLoadMapData = window.loadMapData;
            const self = this;
            
            window.loadMapData = function(market) {
                if (!window.csfpMap) return;
                
                // Clear existing markers and heatmap
                if (window.clearMarkers) {
                    window.clearMarkers();
                }
                
                jQuery.post(csfp_ajax.ajax_url, {
                    action: 'csfp_get_map_data',
                    nonce: csfp_ajax.nonce,
                    market: market || ''
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
                                // Weight based on sentiment
                                const promoterWeight = sentimentCounts.Promoter * 3;
                                const passiveWeight = sentimentCounts.Passive * 1;
                                const detractorWeight = sentimentCounts.Detractor * 0.5;
                                const weight = (promoterWeight + passiveWeight + detractorWeight) / total;
                                
                                // Add multiple points for density
                                for (let i = 0; i < Math.min(total, 20); i++) {
                                    heatmapData.push({
                                        location: new google.maps.LatLng(position.lat, position.lng),
                                        weight: weight
                                    });
                                }
                            }
                            
                            // Create marker
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
                            
                            // Create info window
                            const infoContent = window.createInfoWindowContent ? 
                                window.createInfoWindowContent(location) : 
                                `<div>${location.city}, ${location.market}</div>`;
                            
                            const infoWindow = new google.maps.InfoWindow({
                                content: infoContent
                            });
                            
                            marker.addListener('click', () => {
                                window.csfpInfoWindows.forEach(iw => iw.close());
                                infoWindow.open(window.csfpMap, marker);
                            });
                            
                            window.csfpMarkers.push(marker);
                            window.csfpInfoWindows.push(infoWindow);
                            bounds.extend(position);
                        });
                        
                        // Create or update heatmap with proper gradient
                        if (window.csfpHeatmap) {
                            window.csfpHeatmap.setMap(null);
                        }
                        
                        if (heatmapData.length > 0) {
                            window.csfpHeatmap = new google.maps.visualization.HeatmapLayer({
                                data: heatmapData,
                                map: window.csfpMap,
                                radius: 50,
                                opacity: 0.6,
                                gradient: [
                                    'rgba(0, 0, 0, 0)',
                                    'rgba(255, 68, 68, 0.2)',    // Red (detractor)
                                    'rgba(255, 68, 68, 0.4)',
                                    'rgba(255, 204, 0, 0.6)',    // Yellow (passive)
                                    'rgba(255, 204, 0, 0.8)',
                                    'rgba(0, 255, 136, 0.9)',    // Green (promoter)
                                    'rgba(0, 255, 136, 1)'
                                ]
                            });
                        }
                        
                        // Fit bounds
                        if (locations.length > 0) {
                            window.csfpMap.fitBounds(bounds);
                            
                            google.maps.event.addListenerOnce(window.csfpMap, 'bounds_changed', function() {
                                if (window.csfpMap.getZoom() > 8) {
                                    window.csfpMap.setZoom(8);
                                }
                            });
                            
                            if (locations.length === 1) {
                                window.csfpMap.setZoom(6);
                                window.csfpMap.setCenter(locations[0].coords);
                            }
                        } else {
                            window.csfpMap.setCenter({ lat: 39.8283, lng: -98.5795 });
                            window.csfpMap.setZoom(4);
                        }
                        
                        // Ensure dark theme persists
                        self.ensureProperTheme();
                    }
                });
            };
        }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        CSFPMapFix.init();
        
        // Fix again after a delay to ensure all scripts are loaded
        setTimeout(() => {
            CSFPMapFix.ensureProperTheme();
        }, 2000);
    });
    
    // Fix on dashboard load
    $(document).on('csfp:dashboard:loaded', function() {
        CSFPMapFix.ensureProperTheme();
    });
    
})(jQuery);