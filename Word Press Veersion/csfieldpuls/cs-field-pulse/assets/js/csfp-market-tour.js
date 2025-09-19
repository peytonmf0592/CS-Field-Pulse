/**
 * CS Field Pulse Market Tour Functionality
 */
(function($) {
    'use strict';
    
    // Complete lists in alphabetical order
    const rfmList = [
        'Affolter', 'Brasuel', 'Hillerich', 'Humphries', 'Johnson', 
        'Morton', 'Morris', 'Munda', 'Riley', 'Sanderson', 
        'Snelling', 'Swett', 'VanJoosten', 'Zatulak'
    ];
    
    const marketList = [
        'Carolinas', 'Central Great Lakes', 'Florida', 'Great Plains', 
        'Hawaiian Islands', 'Lower Midwest', 'Mid-Atlantic', 'New England',
        'Northeast', 'Northern Great Lakes', 'Northwest', 'Ohio Valley',
        'Rocky Mountains', 'South Central', 'South Pacific', 'Southeast',
        'Southwest', 'Tennessee Valley', 'Upper Midwest'
    ];
    
    // RFM to Markets mapping
    const rfmToMarkets = {
        'Affolter': ['Ohio Valley'],
        'Brasuel': ['South Central'],
        'Hillerich': ['New England', 'Northeast'],
        'Humphries': ['Southeast'],
        'Johnson': ['Southwest'],
        'Morton': ['Lower Midwest'],
        'Morris': ['South Pacific'],
        'Munda': ['Great Plains', 'Rocky Mountains'],
        'Riley': ['Carolinas'],
        'Sanderson': ['Northwest', 'Upper Midwest'],
        'Snelling': ['Tennessee Valley'],
        'Swett': ['Central Great Lakes', 'Northern Great Lakes'],
        'VanJoosten': ['Florida'],
        'Zatulak': ['Mid-Atlantic']
        // Note: Hawaiian Islands has no RFM
    };
    
    // Helper functions for slug conversion
    const toSlug = (str) => str.toLowerCase().replace(/\s+/g, '-');
    const fromSlug = (slug) => {
        // Convert slug back to label
        const slugToLabel = {
            'affolter': 'Affolter',
            'brasuel': 'Brasuel',
            'hillerich': 'Hillerich',
            'humphries': 'Humphries',
            'johnson': 'Johnson',
            'morton': 'Morton',
            'morris': 'Morris',
            'munda': 'Munda',
            'riley': 'Riley',
            'sanderson': 'Sanderson',
            'snelling': 'Snelling',
            'swett': 'Swett',
            'vanjoosten': 'VanJoosten',
            'zatulak': 'Zatulak',
            'carolinas': 'Carolinas',
            'central-great-lakes': 'Central Great Lakes',
            'florida': 'Florida',
            'great-plains': 'Great Plains',
            'hawaiian-islands': 'Hawaiian Islands',
            'lower-midwest': 'Lower Midwest',
            'mid-atlantic': 'Mid-Atlantic',
            'new-england': 'New England',
            'northeast': 'Northeast',
            'northern-great-lakes': 'Northern Great Lakes',
            'northwest': 'Northwest',
            'ohio-valley': 'Ohio Valley',
            'rocky-mountains': 'Rocky Mountains',
            'south-central': 'South Central',
            'south-pacific': 'South Pacific',
            'southeast': 'Southeast',
            'southwest': 'Southwest',
            'tennessee-valley': 'Tennessee Valley',
            'upper-midwest': 'Upper Midwest'
        };
        return slugToLabel[slug] || slug;
    };
    
    // Market Tour Modal HTML
    const marketTourModalHTML = `
        <div id="market-tour-modal" class="csfp-modal">
            <div class="csfp-modal-content">
                <span class="csfp-close" onclick="CSFPMarketTour.closeModal()">&times;</span>
                <h2>Start Market Tour</h2>
                
                <div class="csfp-form-group">
                    <label>RFM *</label>
                    <select id="tour-rfm" class="csfp-select" required onchange="CSFPMarketTour.updateMarketOptions()">
                        <option value="">Select RFM</option>
                        ${rfmList.map(rfm => `<option value="${toSlug(rfm)}">${rfm}</option>`).join('')}
                    </select>
                </div>
                
                <div class="csfp-form-group">
                    <label>Markets *</label>
                    <div class="csfp-helper-text">Select one or more markets for this RFM</div>
                    <div id="markets-container" class="csfp-markets-checkboxes csfp-disabled">
                        <div class="csfp-empty-state">Please select an RFM first</div>
                    </div>
                    <div id="selected-markets-chips" class="csfp-selected-chips"></div>
                </div>
                
                <div class="csfp-form-group">
                    <label>Traveler</label>
                    <input type="text" id="tour-traveler" class="csfp-input" placeholder="Your name (editable)">
                </div>
                
                <div class="csfp-form-group">
                    <label>Notes</label>
                    <textarea id="tour-notes" class="csfp-textarea" rows="3" placeholder="Optional tour notes"></textarea>
                </div>
                
                <div class="csfp-modal-actions">
                    <button class="csfp-btn csfp-btn-secondary" onclick="CSFPMarketTour.closeModal()">Cancel</button>
                    <button class="csfp-btn csfp-btn-primary" onclick="CSFPMarketTour.startTour()">Start Tour</button>
                </div>
            </div>
        </div>
    `;
    
    // Active Tour Indicator HTML
    const activeTourIndicatorHTML = `
        <div id="active-tour-indicator" class="csfp-active-tour" style="display: none;">
            <div class="csfp-tour-info">
                <span class="csfp-tour-badge">🚗 Active Tour</span>
                RFM: <span id="tour-display-rfm"></span> | 
                Markets: <span id="tour-display-markets"></span> • 
                Started <span id="tour-display-time"></span>
            </div>
            <button class="csfp-btn csfp-btn-danger csfp-btn-sm" onclick="CSFPMarketTour.stopTour()">Stop Tour</button>
        </div>
    `;
    
    window.CSFPMarketTour = {
        activeTour: null,
        
        init: function() {
            // Add modal to page if not exists
            if ($('#market-tour-modal').length === 0) {
                $('body').append(marketTourModalHTML);
            }
            
            // Add active tour indicator to page if not exists
            if ($('#active-tour-indicator').length === 0) {
                // Try to add after navigation or at top of container
                if ($('.csfp-navigation').length) {
                    $('.csfp-navigation').after(activeTourIndicatorHTML);
                } else if ($('.csfp-container').length) {
                    $('.csfp-container').prepend(activeTourIndicatorHTML);
                }
            }
            
            // Don't add button - it's already in the dashboard template
            
            // Bind events - use the dashboard button ID
            $(document).on('click', '#start-market-tour-btn', function() {
                CSFPMarketTour.openModal();
            });
            
            // Check for active tour on page load
            this.checkActiveTour();
        },
        
        openModal: function() {
            $('#market-tour-modal').addClass('active');
            $('#tour-rfm').val('');
            $('#markets-container').html('<div class="csfp-empty-state">Please select an RFM first</div>');
            $('#selected-markets-chips').empty();
            
            // Auto-populate traveler with current user's display name
            // This will be set from PHP via localized script
            if (typeof csfp_ajax !== 'undefined' && csfp_ajax.current_user_name) {
                $('#tour-traveler').val(csfp_ajax.current_user_name);
            } else {
                $('#tour-traveler').val('');
            }
            
            $('#tour-notes').val('');
        },
        
        closeModal: function() {
            $('#market-tour-modal').removeClass('active');
        },
        
        updateMarketOptions: function() {
            const selectedRfmSlug = $('#tour-rfm').val();
            const $container = $('#markets-container');
            const $chips = $('#selected-markets-chips');
            
            // Clear previous selections
            $chips.empty();
            
            if (!selectedRfmSlug) {
                $container.addClass('csfp-disabled');
                $container.html('<div class="csfp-empty-state">Please select an RFM first</div>');
                return;
            }
            
            // Enable the container
            $container.removeClass('csfp-disabled');
            
            // Get RFM label from slug
            const rfmLabel = fromSlug(selectedRfmSlug);
            
            // Get markets for selected RFM
            const markets = rfmToMarkets[rfmLabel] || [];
            
            if (markets.length === 0) {
                $container.html('<div class="csfp-empty-state">No markets available for this RFM</div>');
                return;
            }
            
            // Sort markets alphabetically
            markets.sort();
            
            // Build checkboxes HTML
            let html = '';
            markets.forEach(market => {
                const marketSlug = toSlug(market);
                html += `
                    <label class="csfp-checkbox-label">
                        <input type="checkbox" class="csfp-market-checkbox" value="${marketSlug}" id="market-${marketSlug}" data-label="${market}">
                        <span>${market}</span>
                    </label>
                `;
            });
            
            $container.html(html);
            
            // Bind checkbox change events
            $('.csfp-market-checkbox').on('change', function() {
                CSFPMarketTour.updateSelectedChips();
            });
        },
        
        updateSelectedChips: function() {
            const $chips = $('#selected-markets-chips');
            const selectedLabels = [];
            
            $('.csfp-market-checkbox:checked').each(function() {
                selectedLabels.push($(this).attr('data-label'));
            });
            
            if (selectedLabels.length === 0) {
                $chips.empty();
                return;
            }
            
            let chipsHtml = '';
            selectedLabels.forEach(marketLabel => {
                chipsHtml += `<span class="csfp-chip">${marketLabel}</span>`;
            });
            
            $chips.html(chipsHtml);
        },
        
        startTour: function() {
            const rfmSlug = $('#tour-rfm').val();
            const selectedMarketSlugs = [];
            const selectedMarketLabels = [];
            
            $('.csfp-market-checkbox:checked').each(function() {
                selectedMarketSlugs.push($(this).val());
                selectedMarketLabels.push($(this).attr('data-label'));
            });
            
            if (!rfmSlug) {
                alert('RFM is required');
                return;
            }
            
            if (selectedMarketSlugs.length === 0) {
                alert('Please select at least one market');
                return;
            }
            
            const data = {
                action: 'csfp_start_tour',
                nonce: csfp_ajax.nonce,
                markets: selectedMarketSlugs, // Send slugs
                rfm: rfmSlug, // Send slug
                traveler: $('#tour-traveler').val(),
                notes: $('#tour-notes').val()
            };
            
            $.post(csfp_ajax.ajax_url, data, function(response) {
                if (response.success) {
                    CSFPMarketTour.activeTour = {
                        id: response.data.tour_id,
                        rfm_slug: rfmSlug,
                        rfm_label: fromSlug(rfmSlug),
                        market_slugs: selectedMarketSlugs,
                        market_labels: selectedMarketLabels,
                        start_time: new Date()
                    };
                    CSFPMarketTour.showActiveTour();
                    CSFPMarketTour.closeModal();
                    
                    // Notify quick visit modal if open
                    if (typeof CSFPQuickVisit !== 'undefined') {
                        CSFPQuickVisit.activeTour = CSFPMarketTour.activeTour;
                    }
                } else {
                    alert(response.data || 'Failed to start tour');
                }
            });
        },
        
        stopTour: function() {
            if (!this.activeTour) return;
            
            if (!confirm('Are you sure you want to end this tour?')) {
                return;
            }
            
            const tourId = this.activeTour.id; // Store tour ID before clearing
            
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_end_tour',
                nonce: csfp_ajax.nonce,
                tour_id: tourId
            }, function(response) {
                if (response.success) {
                    CSFPMarketTour.hideActiveTour();
                    CSFPMarketTour.activeTour = null;
                    
                    // Clear from quick visit modal
                    if (typeof CSFPQuickVisit !== 'undefined') {
                        CSFPQuickVisit.activeTour = null;
                    }
                    
                    // Show option to export
                    if (confirm('Tour ended successfully! Would you like to export the tour summary?')) {
                        CSFPMarketTour.exportTour(tourId);
                    }
                } else {
                    alert('Failed to end tour');
                }
            });
        },
        
        checkActiveTour: function() {
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_get_active_tour',
                nonce: csfp_ajax.nonce
            }, function(response) {
                if (response.success && response.data) {
                    // Parse markets from JSON
                    let marketSlugs = response.data.markets;
                    if (typeof marketSlugs === 'string') {
                        marketSlugs = JSON.parse(marketSlugs);
                    }
                    if (!Array.isArray(marketSlugs)) {
                        marketSlugs = [marketSlugs];
                    }
                    
                    CSFPMarketTour.activeTour = {
                        id: response.data.id,
                        rfm_slug: response.data.rfm,
                        rfm_label: fromSlug(response.data.rfm),
                        market_slugs: marketSlugs,
                        market_labels: marketSlugs.map(slug => fromSlug(slug)),
                        start_time: new Date(response.data.start_time)
                    };
                    CSFPMarketTour.showActiveTour();
                    
                    // Notify quick visit modal
                    if (typeof CSFPQuickVisit !== 'undefined') {
                        CSFPQuickVisit.activeTour = CSFPMarketTour.activeTour;
                    }
                }
            });
        },
        
        showActiveTour: function() {
            if (!this.activeTour) return;
            
            // Display RFM label
            $('#tour-display-rfm').text(this.activeTour.rfm_label);
            
            // Display market labels
            const marketsText = this.activeTour.market_labels.join(', ');
            $('#tour-display-markets').text(marketsText);
            
            // Display time
            $('#tour-display-time').text(this.formatTime(this.activeTour.start_time));
            $('#active-tour-indicator').slideDown();
            
            // Hide start button, show in indicator
            $('#start-tour-btn').hide();
        },
        
        hideActiveTour: function() {
            $('#active-tour-indicator').slideUp();
            $('#start-tour-btn').show();
        },
        
        formatTime: function(date) {
            const now = new Date();
            const diff = Math.floor((now - date) / 1000 / 60); // minutes
            
            if (diff < 1) return 'just now';
            if (diff < 60) return diff + ' min ago';
            
            const hours = Math.floor(diff / 60);
            if (hours < 24) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
            
            return date.toLocaleDateString();
        },
        
        exportTour: function(tourId) {
            if (!tourId && this.activeTour) {
                tourId = this.activeTour.id;
            }
            
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_export_market_tour',
                nonce: csfp_ajax.nonce,
                tour_id: tourId
            }, function(response) {
                if (response.success) {
                    CSFPMarketTour.downloadExport(response.data);
                } else {
                    alert('Failed to export tour');
                }
            });
        },
        
        downloadExport: function(data) {
            // Check if SheetJS is loaded
            if (typeof XLSX === 'undefined') {
                // Load SheetJS dynamically
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
                script.onload = () => this.createExcelFile(data);
                document.head.appendChild(script);
            } else {
                this.createExcelFile(data);
            }
        },
        
        createExcelFile: function(data) {
            const workbook = XLSX.utils.book_new();
            
            // Add Inspector sheet if there's data
            if (data.inspector_data && data.inspector_data.length > 1) {
                const ws_inspector = XLSX.utils.aoa_to_sheet(data.inspector_data);
                XLSX.utils.book_append_sheet(workbook, ws_inspector, "Inspector Engagement 2025");
            }
            
            // Add Adjuster sheet if there's data
            if (data.adjuster_data && data.adjuster_data.length > 1) {
                const ws_adjuster = XLSX.utils.aoa_to_sheet(data.adjuster_data);
                XLSX.utils.book_append_sheet(workbook, ws_adjuster, "Adjuster Engagement 2025");
            }
            
            // Create Tour Summary sheet
            const summaryData = this.createTourSummary(data);
            const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, ws_summary, "Tour Summary");
            
            // Generate filename
            const filename = data.filename_base ? 
                data.filename_base + '.xlsx' : 
                'MarketTour_Export_' + new Date().toISOString().split('T')[0] + '.xlsx';
            
            // Write and download
            XLSX.writeFile(workbook, filename);
        },
        
        createTourSummary: function(data) {
            const tour = data.tour_info || {};
            const stats = data.tour_stats || {};
            
            const summary = [
                ['MARKET TOUR SUMMARY'],
                [],
                ['Tour Information'],
                ['RFM:', fromSlug(tour.rfm || '')],
                ['Market(s):', tour.markets || ''],
                ['Traveler:', tour.traveler || ''],
                ['Start Time:', tour.start_time || ''],
                ['End Time:', tour.end_time || 'Active'],
                ['Notes:', tour.notes || ''],
                [],
                ['Visit Statistics'],
                ['Total Visits:', stats.total_visits || 0],
                ['Inspector Visits:', stats.inspector_visits || 0],
                ['Adjuster Visits:', stats.adjuster_visits || 0],
                ['Follow-ups Needed:', stats.follow_ups_needed || 0],
                [],
                ['Sentiment Breakdown'],
                ['Promoter:', stats.sentiment_breakdown?.Promoter || 0],
                ['Passive:', stats.sentiment_breakdown?.Passive || 0],
                ['Detractor:', stats.sentiment_breakdown?.Detractor || 0],
                []
            ];
            
            // Add Top Issues
            if (stats.issues && Object.keys(stats.issues).length > 0) {
                summary.push(['Top Issues']);
                Object.entries(stats.issues).forEach(([issue, count]) => {
                    summary.push([issue + ':', count]);
                });
                summary.push([]);
            }
            
            // Add Branding Compliance
            if (stats.branding_compliance && Object.keys(stats.branding_compliance).length > 0) {
                summary.push(['Branding/Equipment Compliance']);
                Object.entries(stats.branding_compliance).forEach(([status, count]) => {
                    summary.push([status + ':', count]);
                });
                summary.push([]);
            }
            
            // Add Punctuality
            if (stats.punctual) {
                summary.push(['Punctuality']);
                summary.push(['Yes:', stats.punctual.Yes || 0]);
                summary.push(['No:', stats.punctual.No || 0]);
                summary.push([]);
            }
            
            // Add Scope Sheet Quality
            if (stats.scope_sheet_quality && Object.keys(stats.scope_sheet_quality).length > 0) {
                summary.push(['Scope Sheet Quality']);
                Object.entries(stats.scope_sheet_quality).forEach(([quality, count]) => {
                    summary.push([quality + ':', count]);
                });
                summary.push([]);
            }
            
            // Add Regional Shoutouts
            if (stats.regional_shoutouts && Object.keys(stats.regional_shoutouts).length > 0) {
                summary.push(['Regional Shoutouts Mentioned']);
                Object.entries(stats.regional_shoutouts).forEach(([rfm, count]) => {
                    summary.push([rfm + ':', count]);
                });
            }
            
            return summary;
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPMarketTour.init();
    });
    
})(jQuery);