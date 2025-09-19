/**
 * CS Field Pulse - Clean Map Implementation
 * Simple, working heatmap that moves with the map
 */

(function($) {
    'use strict';
    
    window.CSFPMapClean = {
        init: function() {
            // Only initialize once
            if (this.initialized) return;
            this.initialized = true;
            
            // Wait for Google Maps to be ready
            this.waitForGoogleMaps();
        },
        
        waitForGoogleMaps: function() {
            const self = this;
            const checkInterval = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.visualization) {
                    clearInterval(checkInterval);
                    self.setupMap();
                }
            }, 100);
            
            // Stop checking after 10 seconds
            setTimeout(() => clearInterval(checkInterval), 10000);
        },
        
        setupMap: function() {
            const self = this;
            
            // Override the global init function
            window.initCSFPMap = function() {
                const mapElement = document.getElementById('csfp-map');
                if (!mapElement) return;
                
                // Simple map options with dark theme
                const mapOptions = {
                    zoom: 4,
                    center: { lat: 39.8283, lng: -98.5795 },
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    // Allow all gestures on desktop, cooperative on mobile
                    gestureHandling: window.innerWidth <= 640 ? 'cooperative' : 'greedy',
                    styles: [
                        {
                            "featureType": "all",
                            "elementType": "geometry",
                            "stylers": [{"color": "#0a0a0a"}]
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
                            "featureType": "poi",
                            "elementType": "all",
                            "stylers": [{"visibility": "off"}]
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
                        }
                    ]
                };
                
                // Create the map
                window.csfpMap = new google.maps.Map(mapElement, mapOptions);
                window.csfpMarkers = [];
                window.csfpInfoWindows = [];
                window.csfpHeatmap = null;
                
                // Load the data
                self.loadMapData();
            };
            
            // If callback hasn't been called yet, call it
            if (document.getElementById('csfp-map') && !window.csfpMap) {
                window.initCSFPMap();
            }
        },
        
        loadMapData: function(market = '') {
            const self = this;
            
            // Clear existing data
            if (window.csfpMarkers) {
                window.csfpMarkers.forEach(marker => marker.setMap(null));
                window.csfpMarkers = [];
            }
            
            if (window.csfpHeatmap) {
                window.csfpHeatmap.setMap(null);
                window.csfpHeatmap = null;
            }
            
            // Fetch data
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_get_map_data',
                nonce: csfp_ajax.nonce,
                market: market
            }, function(response) {
                if (!response.success || !window.csfpMap) return;
                
                const locations = response.data;
                const heatmapData = [];
                const bounds = new google.maps.LatLngBounds();
                
                // Process each location
                locations.forEach(location => {
                    if (!location.coords || !location.coords.lat || !location.coords.lng) return;
                    
                    const lat = parseFloat(location.coords.lat);
                    const lng = parseFloat(location.coords.lng);
                    
                    // Create LatLng object
                    const position = new google.maps.LatLng(lat, lng);
                    
                    // Calculate activity for heatmap
                    const counts = location.sentiment_counts || {};
                    const promoters = counts.Promoter || 0;
                    const passives = counts.Passive || 0;
                    const detractors = counts.Detractor || 0;
                    const total = promoters + passives + detractors;
                    
                    if (total > 0) {
                        // Add weighted points to heatmap
                        // More promoters = higher weight
                        const weight = Math.max(1, (promoters * 3 + passives * 1 - detractors * 0.5) / total);
                        
                        // Add multiple points for density
                        const pointCount = Math.min(total, 10);
                        for (let i = 0; i < pointCount; i++) {
                            heatmapData.push({
                                location: position,
                                weight: weight
                            });
                        }
                    }
                    
                    // Create marker
                    const marker = new google.maps.Marker({
                        position: position,
                        map: window.csfpMap,
                        title: `${location.city}, ${location.market}`,
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
                    const infoWindow = new google.maps.InfoWindow({
                        content: self.createInfoContent(location)
                    });
                    
                    marker.addListener('click', () => {
                        window.csfpInfoWindows.forEach(iw => iw.close());
                        infoWindow.open(window.csfpMap, marker);
                    });
                    
                    window.csfpMarkers.push(marker);
                    window.csfpInfoWindows.push(infoWindow);
                    bounds.extend(position);
                });
                
                // Create heatmap if we have data
                if (heatmapData.length > 0) {
                    window.csfpHeatmap = new google.maps.visualization.HeatmapLayer({
                        data: heatmapData,
                        map: window.csfpMap,
                        radius: 50,
                        opacity: 0.6,
                        gradient: [
                            'rgba(0, 0, 0, 0)',
                            'rgba(255, 68, 68, 0.4)',     // Red
                            'rgba(255, 204, 0, 0.6)',     // Yellow
                            'rgba(255, 255, 0, 0.8)',     
                            'rgba(0, 255, 136, 0.9)',     // Green
                            'rgba(0, 255, 136, 1)'
                        ]
                    });
                }
                
                // Fit bounds
                if (locations.length > 0) {
                    window.csfpMap.fitBounds(bounds);
                    
                    // Don't zoom too far in
                    google.maps.event.addListenerOnce(window.csfpMap, 'bounds_changed', function() {
                        if (window.csfpMap.getZoom() > 8) {
                            window.csfpMap.setZoom(8);
                        }
                    });
                }
            });
        },
        
        createInfoContent: function(location) {
            const counts = location.sentiment_counts || {};
            return `
                <div style="color: #333; min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0;">${location.city}, ${location.market}</h3>
                    <p style="margin: 5px 0;"><strong>Total Visits:</strong> ${location.total_visits || 0}</p>
                    <div style="margin-top: 10px;">
                        <div style="color: #00b851;">Promoters: ${counts.Promoter || 0}</div>
                        <div style="color: #f0c41b;">Passive: ${counts.Passive || 0}</div>
                        <div style="color: #e05252;">Detractors: ${counts.Detractor || 0}</div>
                    </div>
                </div>
            `;
        }
    };
    
    // Initialize
    $(document).ready(function() {
        CSFPMapClean.init();
        
        // Simple touch detection for mobile
        $('#csfp-map').on('touchstart click', function() {
            $(this).addClass('touched');
        });
    });
    
    // Also set up loadMapData globally
    window.loadMapData = function(market) {
        CSFPMapClean.loadMapData(market);
    };
    
})(jQuery);