/**
 * CS Field Pulse Quick Search Component
 * Unified search for both Inspectors and Adjusters
 */
(function($) {
    'use strict';
    
    window.CSFPQuickSearch = {
        searchTimeout: null,
        currentResults: [],
        selectedIndex: -1,
        typeFilter: 'both', // both, inspector, adjuster
        portalId: 'csfp-search-portal',
        scrollTimeout: null,
        
        init: function() {
            // Only initialize if container exists
            if ($('#csfp-quick-search-container').length === 0) {
                return;
            }
            
            this.render();
            this.createPortal();
            this.bindEvents();
        },
        
        render: function() {
            const html = `
                <div class="csfp-quick-search">
                    <div class="csfp-quick-search-wrapper">
                        <div class="csfp-quick-search-input-group">
                            <input type="text" 
                                   id="csfp-quick-search-input" 
                                   class="csfp-quick-search-input" 
                                   placeholder="Search inspectors or adjusters..."
                                   autocomplete="off">
                            <div class="csfp-quick-search-filter">
                                <button class="csfp-filter-btn active" data-type="both">Both</button>
                                <button class="csfp-filter-btn" data-type="inspector">Inspectors</button>
                                <button class="csfp-filter-btn" data-type="adjuster">Adjusters</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('#csfp-quick-search-container').html(html);
        },
        
        createPortal: function() {
            // Remove existing portal if it exists
            $('#' + this.portalId).remove();
            
            // Create portal element and append to body
            const portal = `<div id="${this.portalId}" class="csfp-search-portal"></div>`;
            $('body').append(portal);
        },
        
        bindEvents: function() {
            const self = this;
            
            // Search input with debounce
            $('#csfp-quick-search-input').on('input', function() {
                const query = $(this).val();
                
                clearTimeout(self.searchTimeout);
                
                if (query.length < 2) {
                    self.hideResults();
                    return;
                }
                
                self.searchTimeout = setTimeout(() => {
                    self.performSearch(query);
                }, 200);
            });
            
            // Type filter buttons
            $('.csfp-filter-btn').on('click', function() {
                $('.csfp-filter-btn').removeClass('active');
                $(this).addClass('active');
                
                self.typeFilter = $(this).data('type');
                
                const query = $('#csfp-quick-search-input').val();
                if (query.length >= 2) {
                    self.performSearch(query);
                }
            });
            
            // Keyboard navigation
            $('#csfp-quick-search-input').on('keydown', function(e) {
                switch(e.keyCode) {
                    case 38: // Up arrow
                        e.preventDefault();
                        self.navigateResults(-1);
                        break;
                    case 40: // Down arrow
                        e.preventDefault();
                        self.navigateResults(1);
                        break;
                    case 13: // Enter
                        e.preventDefault();
                        self.selectResult(self.selectedIndex);
                        break;
                    case 27: // Escape
                        self.hideResults();
                        break;
                }
            });
            
            // Click outside to close
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.csfp-quick-search').length && 
                    !$(e.target).closest('#' + self.portalId).length) {
                    self.hideResults();
                }
            });
            
            // Result item clicks
            $(document).on('click', '.csfp-search-result-item', function() {
                const index = $(this).data('index');
                self.selectResult(index);
            });
            
            // Update position on scroll or resize
            $(window).on('scroll resize', function() {
                if ($('#' + self.portalId).is(':visible')) {
                    clearTimeout(self.scrollTimeout);
                    self.scrollTimeout = setTimeout(() => {
                        self.updatePortalPosition();
                    }, 10);
                }
            });
        },
        
        performSearch: function(query) {
            const self = this;
            
            // Show loading state in portal
            this.showPortal();
            $('#' + this.portalId).html('<div class="csfp-search-loading">Searching...</div>');
            
            // Determine which endpoint(s) to call based on filter
            const promises = [];
            
            if (self.typeFilter === 'both' || self.typeFilter === 'inspector') {
                promises.push(self.searchPersons(query, 'Inspector'));
            }
            
            if (self.typeFilter === 'both' || self.typeFilter === 'adjuster') {
                promises.push(self.searchPersons(query, 'Adjuster'));
            }
            
            // Wait for all searches to complete
            Promise.all(promises).then(results => {
                // Merge and sort results
                let allResults = [];
                results.forEach(result => {
                    if (result) {
                        allResults = allResults.concat(result);
                    }
                });
                
                // Limit to 10 total results
                allResults = allResults.slice(0, 10);
                
                self.currentResults = allResults;
                self.displayResults(allResults);
            });
        },
        
        searchPersons: function(query, type) {
            return new Promise((resolve) => {
                $.post(csfp_ajax.ajax_url, {
                    action: 'csfp_autocomplete_persons',
                    nonce: csfp_ajax.nonce,
                    query: query,
                    type: type
                }, function(response) {
                    if (response.success && response.data) {
                        resolve(response.data);
                    } else {
                        resolve([]);
                    }
                });
            });
        },
        
        displayResults: function(results) {
            const $portal = $('#' + this.portalId);
            
            if (results.length === 0) {
                $portal.html(`
                    <div class="csfp-search-no-results">
                        No matches found. 
                        <a href="#" onclick="CSFPQuickSearch.openAddModal(); return false;">Add new</a>
                    </div>
                `);
                this.showPortal();
                return;
            }
            
            let html = '';
            results.forEach((person, index) => {
                const typeClass = person.role === 'Inspector' ? 'inspector' : 'adjuster';
                const typeBadge = person.role === 'Inspector' ? '🔍' : '📋';
                
                // Get RFM if available
                const rfm = person.rfm || '';
                
                // Format last visit if available
                const lastVisit = person.last_visit ? 
                    `<span class="csfp-search-last-visit">Last: ${this.formatDate(person.last_visit)}</span>` : '';
                
                html += `
                    <div class="csfp-search-result-item ${typeClass}" data-index="${index}">
                        <div class="csfp-search-result-main">
                            <span class="csfp-search-name">${person.name}</span>
                            <span class="csfp-search-type-badge">${typeBadge} ${person.role}</span>
                        </div>
                        <div class="csfp-search-result-meta">
                            ${person.market ? `<span class="csfp-search-chip">${person.market}</span>` : ''}
                            ${rfm ? `<span class="csfp-search-chip">${rfm}</span>` : ''}
                            ${lastVisit}
                        </div>
                    </div>
                `;
            });
            
            $portal.html(html);
            this.showPortal();
            this.selectedIndex = -1;
        },
        
        navigateResults: function(direction) {
            const $items = $('.csfp-search-result-item');
            const count = $items.length;
            
            if (count === 0) return;
            
            // Remove previous selection
            $items.removeClass('selected');
            
            // Update selected index
            this.selectedIndex += direction;
            
            // Wrap around
            if (this.selectedIndex < 0) {
                this.selectedIndex = count - 1;
            } else if (this.selectedIndex >= count) {
                this.selectedIndex = 0;
            }
            
            // Highlight new selection
            $items.eq(this.selectedIndex).addClass('selected');
        },
        
        selectResult: function(index) {
            if (index < 0 || index >= this.currentResults.length) {
                return;
            }
            
            const person = this.currentResults[index];
            
            // Get the appropriate profile page URL
            // These page IDs should match what's set up in WordPress
            let profileUrl = '';
            if (person.role === 'Inspector') {
                // Navigate to inspectors page with ID parameter
                profileUrl = '/inspectors/?id=' + person.id;
            } else {
                // Navigate to adjusters page with ID parameter  
                profileUrl = '/adjusters/?id=' + person.id;
            }
            
            // Navigate to the profile
            window.location.href = profileUrl;
            
            // Clear search
            this.clearSearch();
        },
        
        showPortal: function() {
            const $portal = $('#' + this.portalId);
            $portal.addClass('active');
            this.updatePortalPosition();
        },
        
        hideResults: function() {
            $('#' + this.portalId).removeClass('active').empty();
            this.selectedIndex = -1;
        },
        
        updatePortalPosition: function() {
            const $input = $('#csfp-quick-search-input');
            const $portal = $('#' + this.portalId);
            
            if (!$input.length || !$portal.hasClass('active')) return;
            
            const rect = $input[0].getBoundingClientRect();
            const inputGroup = $('.csfp-quick-search-input-group')[0].getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            // Position the portal
            let top = rect.bottom + 8;
            let maxHeight = Math.min(400, spaceBelow - 20);
            
            // If not enough space below, position above
            if (spaceBelow < 200 && spaceAbove > spaceBelow) {
                maxHeight = Math.min(400, spaceAbove - 20);
                top = rect.top - maxHeight - 8;
            }
            
            $portal.css({
                top: top + 'px',
                left: inputGroup.left + 'px',
                width: inputGroup.width + 'px',
                maxHeight: maxHeight + 'px'
            });
        },
        
        clearSearch: function() {
            $('#csfp-quick-search-input').val('');
            this.hideResults();
            this.currentResults = [];
        },
        
        openAddModal: function() {
            // Open the quick visit modal to add new person
            if (typeof CSFPQuickVisit !== 'undefined') {
                CSFPQuickVisit.open();
            }
        },
        
        formatDate: function(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return diffDays + ' days ago';
            if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
            
            return date.toLocaleDateString();
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        CSFPQuickSearch.init();
    });
    
})(jQuery);