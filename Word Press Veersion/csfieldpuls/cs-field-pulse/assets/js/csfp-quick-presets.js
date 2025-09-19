/**
 * CS Field Pulse Quick Presets Component
 * One-click filter bundles for Inspectors page
 */
(function($) {
    'use strict';
    
    window.CSFPQuickPresets = {
        activePreset: null,
        customPresets: [],
        currentFilters: {},
        
        // Default preset configurations
        defaultPresets: [
            {
                id: 'all',
                name: 'All Inspectors',
                icon: '👥',
                filters: {},
                keyboard: 'Shift+0'
            },
            {
                id: 'detractors-30d',
                name: 'Detractors—30d',
                icon: '👎',
                filters: {
                    sentiment: 'Detractor',
                    date_range: 'last_30_days'
                },
                keyboard: '1'
            },
            {
                id: 'promoters-30d',
                name: 'Promoters—30d',
                icon: '👍',
                filters: {
                    sentiment: 'Promoter',
                    date_range: 'last_30_days'
                },
                keyboard: '2'
            },
            {
                id: 'branding-issues-30d',
                name: 'Branding Issues—30d',
                icon: '🚫',
                filters: {
                    branding_compliance: ['Improper Uniform', 'No Ladder Rack', 'Missing Ladder', 'No Steep Assist', 'Truck Not Branded'],
                    branding_compliance_mode: 'any',
                    date_range: 'last_30_days'
                },
                keyboard: '3'
            },
            {
                id: 'punctuality-no-30d',
                name: 'Punctuality: No—30d',
                icon: '⏰',
                filters: {
                    punctual: 'No',
                    date_range: 'last_30_days'
                },
                keyboard: '4'
            },
            {
                id: 'scope-fair-bad-30d',
                name: 'Scope Sheet Fair/Bad—30d',
                icon: '📋',
                filters: {
                    scope_sheet_quality: ['Fair', 'Bad'],
                    scope_sheet_quality_mode: 'any',
                    date_range: 'last_30_days'
                },
                keyboard: '5'
            },
            {
                id: 'issues-late-not-confirming-30d',
                name: 'Issues: Late/Not Confirming—30d',
                icon: '⚠️',
                filters: {
                    issues: ['Late', 'Not Confirming Claims'],
                    issues_mode: 'any',
                    date_range: 'last_30_days'
                },
                keyboard: '6'
            },
            {
                id: 'mojo-no-90d',
                name: 'Mojo: No—90d',
                icon: '😔',
                filters: {
                    mojo: 'No',
                    date_range: 'last_90_days'
                },
                keyboard: '7'
            },
            {
                id: 'my-inspectors-90d',
                name: 'My Inspectors—90d',
                icon: '👤',
                filters: {
                    cs_owner: 'current_user',
                    date_range: 'last_90_days'
                },
                keyboard: '8'
            },
            {
                id: 'active-tour',
                name: 'Active Tour',
                icon: '🚗',
                filters: {
                    tour: 'active'
                },
                keyboard: '9',
                requiresActiveTour: true
            }
        ],
        
        init: function() {
            this.loadCustomPresets();
            this.render();
            this.bindEvents();
            this.restoreFromUrl();
            this.setupKeyboardShortcuts();
        },
        
        render: function() {
            const container = $('#csfp-quick-presets-container');
            if (!container.length) {
                // Insert container above filters
                $('.csfp-filters').before('<div id="csfp-quick-presets-container"></div>');
            }
            
            let html = '<div class="csfp-quick-presets">';
            html += '<div class="csfp-presets-bar">';
            html += '<div class="csfp-presets-chips">';
            
            // Render preset chips
            const allPresets = [...this.defaultPresets, ...this.customPresets];
            allPresets.forEach((preset, index) => {
                if (index < 10 || preset.pinned) {
                    const isDisabled = preset.requiresActiveTour && !this.hasActiveTour();
                    const keyboardHint = preset.keyboard ? `<span class="csfp-preset-key">${preset.keyboard}</span>` : '';
                    
                    html += `
                        <button class="csfp-preset-chip ${isDisabled ? 'disabled' : ''}" 
                                data-preset-id="${preset.id}"
                                aria-pressed="false"
                                ${isDisabled ? 'disabled' : ''}
                                title="${preset.name}${preset.keyboard ? ' (Press ' + preset.keyboard + ')' : ''}">
                            <span class="csfp-preset-icon">${preset.icon || '🔖'}</span>
                            <span class="csfp-preset-name">${preset.name}</span>
                            ${keyboardHint}
                        </button>
                    `;
                }
            });
            
            // More presets dropdown if needed
            if (allPresets.length > 10) {
                const morePresets = allPresets.slice(10).filter(p => !p.pinned);
                if (morePresets.length > 0) {
                    html += `
                        <div class="csfp-presets-more">
                            <button class="csfp-preset-chip csfp-more-trigger">
                                <span>More Presets</span>
                                <span class="csfp-preset-arrow">▾</span>
                            </button>
                            <div class="csfp-more-dropdown">
                    `;
                    
                    morePresets.forEach(preset => {
                        html += `
                            <button class="csfp-dropdown-item" data-preset-id="${preset.id}">
                                <span class="csfp-preset-icon">${preset.icon || '🔖'}</span>
                                ${preset.name}
                            </button>
                        `;
                    });
                    
                    html += '</div></div>';
                }
            }
            
            html += '</div>'; // .csfp-presets-chips
            
            // Action buttons
            html += `
                <div class="csfp-presets-actions">
                    <button class="csfp-btn-icon" id="csfp-save-preset" title="Save current filters as preset">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="csfp-btn-icon" id="csfp-manage-presets" title="Manage presets">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 5h10M3 8h10M3 11h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="csfp-btn-icon" id="csfp-share-filters" title="Share current filters">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 5l-4 4-4-4M8 9V2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M2 12h12v2H2z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            `;
            
            html += '</div></div>'; // .csfp-presets-bar .csfp-quick-presets
            
            // Aria live region for announcements
            html += '<div class="sr-only" role="status" aria-live="polite" id="csfp-preset-announcer"></div>';
            
            $('#csfp-quick-presets-container').html(html);
        },
        
        bindEvents: function() {
            const self = this;
            
            // Preset chip clicks
            $(document).on('click', '.csfp-preset-chip:not(.csfp-more-trigger):not(.disabled)', function() {
                const presetId = $(this).data('preset-id');
                self.applyPreset(presetId);
            });
            
            // More presets dropdown
            $(document).on('click', '.csfp-more-trigger', function(e) {
                e.stopPropagation();
                $(this).siblings('.csfp-more-dropdown').toggleClass('active');
            });
            
            $(document).on('click', '.csfp-dropdown-item', function() {
                const presetId = $(this).data('preset-id');
                self.applyPreset(presetId);
                $('.csfp-more-dropdown').removeClass('active');
            });
            
            // Close dropdown on outside click
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.csfp-presets-more').length) {
                    $('.csfp-more-dropdown').removeClass('active');
                }
            });
            
            // Save preset button
            $('#csfp-save-preset').on('click', function() {
                self.openSavePresetDialog();
            });
            
            // Manage presets button
            $('#csfp-manage-presets').on('click', function() {
                self.openManagePresetsDialog();
            });
            
            // Share filters button
            $('#csfp-share-filters').on('click', function() {
                self.shareCurrentFilters();
            });
            
            // Listen for filter changes from the drawer
            $(document).on('csfp:filtersChanged', function(e, filters) {
                self.currentFilters = filters;
                self.updateActivePreset();
                self.updateUrl();
            });
        },
        
        setupKeyboardShortcuts: function() {
            const self = this;
            
            $(document).on('keydown', function(e) {
                // Ignore if typing in input
                if ($(e.target).is('input, textarea, select')) {
                    return;
                }
                
                // Shift+0 for All Inspectors
                if (e.shiftKey && e.keyCode === 48) { // 0
                    e.preventDefault();
                    self.applyPreset('all');
                    self.announcePreset('All Inspectors');
                    return;
                }
                
                // 1-9 for presets
                if (e.keyCode >= 49 && e.keyCode <= 57) { // 1-9
                    const num = e.keyCode - 48;
                    const preset = self.getPresetByKeyboard(String(num));
                    if (preset) {
                        e.preventDefault();
                        self.applyPreset(preset.id);
                        self.announcePreset(preset.name);
                    }
                }
            });
        },
        
        applyPreset: function(presetId) {
            const preset = this.getPresetById(presetId);
            if (!preset) return;
            
            // Clear active state
            $('.csfp-preset-chip').attr('aria-pressed', 'false').removeClass('active');
            
            // Set new active preset
            this.activePreset = presetId;
            $(`.csfp-preset-chip[data-preset-id="${presetId}"]`)
                .attr('aria-pressed', 'true')
                .addClass('active');
            
            // Apply filters
            if (presetId === 'all') {
                this.clearAllFilters();
            } else {
                this.applyFilters(preset.filters);
            }
            
            // Open drawer to show applied filters
            this.openFiltersDrawer();
            
            // Update URL
            this.updateUrl();
            
            // Trigger reload of inspectors list
            if (typeof window.loadInspectors === 'function') {
                window.loadInspectors(1);
            }
        },
        
        applyFilters: function(filters) {
            // Reset all filters first
            this.clearAllFilters();
            
            // Apply each filter
            Object.keys(filters).forEach(key => {
                const value = filters[key];
                
                // Handle special cases
                if (key === 'cs_owner' && value === 'current_user') {
                    // Get current user name from csfp_ajax object
                    const currentUser = csfp_ajax.current_user_name || '';
                    if (currentUser) {
                        $('#filter-cs-owner').val(currentUser).trigger('change');
                    }
                } else if (key === 'tour' && value === 'active') {
                    // Apply active tour filter
                    const activeTour = this.getActiveTour();
                    if (activeTour) {
                        $('#filter-tour').val(activeTour.id).trigger('change');
                    }
                } else if (key === 'date_range') {
                    // Apply date range
                    this.applyDateRange(value);
                } else if (Array.isArray(value)) {
                    // Multi-select filters
                    $(`#filter-${key.replace(/_/g, '-')}`).val(value).trigger('change');
                } else {
                    // Single value filters
                    $(`#filter-${key.replace(/_/g, '-')}`).val(value).trigger('change');
                }
            });
            
            this.currentFilters = filters;
        },
        
        clearAllFilters: function() {
            // Clear all filter inputs
            $('.csfp-filter-select, .csfp-filter-input').val('').trigger('change');
            $('.csfp-filter-checkbox').prop('checked', false).trigger('change');
            
            // Clear date range
            $('#filter-date-from, #filter-date-to').val('').trigger('change');
            
            this.currentFilters = {};
        },
        
        applyDateRange: function(range) {
            const today = new Date();
            let fromDate = new Date();
            
            switch(range) {
                case 'last_30_days':
                    fromDate.setDate(today.getDate() - 30);
                    break;
                case 'last_90_days':
                    fromDate.setDate(today.getDate() - 90);
                    break;
                case 'last_7_days':
                    fromDate.setDate(today.getDate() - 7);
                    break;
                default:
                    return;
            }
            
            // Format dates as YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            $('#filter-date-from').val(formatDate(fromDate)).trigger('change');
            $('#filter-date-to').val(formatDate(today)).trigger('change');
        },
        
        openFiltersDrawer: function() {
            // Trigger drawer open if it exists
            if (typeof window.openFiltersDrawer === 'function') {
                window.openFiltersDrawer();
            } else {
                // Show filters section
                $('.csfp-filters').addClass('expanded');
            }
        },
        
        updateActivePreset: function() {
            // Check if current filters match any preset
            const matchingPreset = this.findMatchingPreset(this.currentFilters);
            
            $('.csfp-preset-chip').attr('aria-pressed', 'false').removeClass('active');
            
            if (matchingPreset) {
                this.activePreset = matchingPreset.id;
                $(`.csfp-preset-chip[data-preset-id="${matchingPreset.id}"]`)
                    .attr('aria-pressed', 'true')
                    .addClass('active');
            } else {
                this.activePreset = null;
            }
        },
        
        findMatchingPreset: function(filters) {
            const allPresets = [...this.defaultPresets, ...this.customPresets];
            
            return allPresets.find(preset => {
                // Check if filters match preset filters
                const presetKeys = Object.keys(preset.filters);
                const filterKeys = Object.keys(filters);
                
                if (presetKeys.length !== filterKeys.length) return false;
                
                return presetKeys.every(key => {
                    const presetValue = preset.filters[key];
                    const filterValue = filters[key];
                    
                    if (Array.isArray(presetValue)) {
                        return Array.isArray(filterValue) && 
                               presetValue.length === filterValue.length &&
                               presetValue.every(v => filterValue.includes(v));
                    }
                    
                    return presetValue === filterValue;
                });
            });
        },
        
        updateUrl: function() {
            const url = new URL(window.location);
            
            // Clear existing filter params
            [...url.searchParams.keys()].forEach(key => {
                if (key.startsWith('filter_')) {
                    url.searchParams.delete(key);
                }
            });
            
            // Add preset if active
            if (this.activePreset) {
                url.searchParams.set('preset', this.activePreset);
            } else {
                url.searchParams.delete('preset');
            }
            
            // Add individual filters
            Object.keys(this.currentFilters).forEach(key => {
                const value = this.currentFilters[key];
                if (Array.isArray(value)) {
                    value.forEach(v => url.searchParams.append(`filter_${key}[]`, v));
                } else if (value) {
                    url.searchParams.set(`filter_${key}`, value);
                }
            });
            
            // Update URL without reload
            window.history.replaceState({}, '', url);
        },
        
        restoreFromUrl: function() {
            const url = new URL(window.location);
            const presetId = url.searchParams.get('preset');
            
            if (presetId) {
                // Apply preset from URL
                this.applyPreset(presetId);
            } else {
                // Apply individual filters from URL
                const filters = {};
                [...url.searchParams.entries()].forEach(([key, value]) => {
                    if (key.startsWith('filter_')) {
                        const filterKey = key.replace('filter_', '').replace('[]', '');
                        if (key.endsWith('[]')) {
                            if (!filters[filterKey]) filters[filterKey] = [];
                            filters[filterKey].push(value);
                        } else {
                            filters[filterKey] = value;
                        }
                    }
                });
                
                if (Object.keys(filters).length > 0) {
                    this.applyFilters(filters);
                    this.updateActivePreset();
                }
            }
        },
        
        openSavePresetDialog: function() {
            const self = this;
            
            const dialog = `
                <div class="csfp-modal active" id="save-preset-modal">
                    <div class="csfp-modal-content csfp-glass">
                        <button class="csfp-modal-close">&times;</button>
                        <h2>Save Filters as Preset</h2>
                        
                        <form id="save-preset-form">
                            <div class="csfp-form-group">
                                <label>Preset Name *</label>
                                <input type="text" id="preset-name" required placeholder="e.g., High Priority Issues">
                            </div>
                            
                            <div class="csfp-form-group">
                                <label>Icon (optional)</label>
                                <input type="text" id="preset-icon" placeholder="e.g., 🔥" maxlength="2">
                            </div>
                            
                            <div class="csfp-form-group">
                                <label>Keyboard Shortcut (optional)</label>
                                <select id="preset-keyboard">
                                    <option value="">None</option>
                                    ${this.getAvailableKeyboardSlots().map(slot => 
                                        `<option value="${slot}">${slot}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="csfp-form-group">
                                <label>
                                    <input type="checkbox" id="preset-pinned"> Pin to top
                                </label>
                            </div>
                            
                            <div class="csfp-modal-actions">
                                <button type="button" class="csfp-btn csfp-btn-secondary" onclick="$('#save-preset-modal').remove()">
                                    Cancel
                                </button>
                                <button type="submit" class="csfp-btn csfp-btn-primary">
                                    Save Preset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            $('body').append(dialog);
            
            $('#save-preset-form').on('submit', function(e) {
                e.preventDefault();
                
                const preset = {
                    id: 'custom-' + Date.now(),
                    name: $('#preset-name').val(),
                    icon: $('#preset-icon').val() || '🔖',
                    keyboard: $('#preset-keyboard').val(),
                    pinned: $('#preset-pinned').is(':checked'),
                    filters: { ...self.currentFilters }
                };
                
                self.saveCustomPreset(preset);
                $('#save-preset-modal').remove();
            });
            
            $('.csfp-modal-close').on('click', function() {
                $('#save-preset-modal').remove();
            });
        },
        
        saveCustomPreset: function(preset) {
            this.customPresets.push(preset);
            this.saveToStorage();
            this.render();
            
            // Show success message
            this.showNotification('Preset saved successfully');
        },
        
        openManagePresetsDialog: function() {
            const self = this;
            
            let presetsHtml = '';
            this.customPresets.forEach((preset, index) => {
                presetsHtml += `
                    <div class="csfp-preset-item" data-index="${index}">
                        <span class="csfp-preset-icon">${preset.icon}</span>
                        <span class="csfp-preset-name">${preset.name}</span>
                        ${preset.keyboard ? `<span class="csfp-preset-key">${preset.keyboard}</span>` : ''}
                        <div class="csfp-preset-actions">
                            <button class="csfp-btn-icon" onclick="CSFPQuickPresets.editPreset(${index})" title="Edit">
                                ✏️
                            </button>
                            <button class="csfp-btn-icon" onclick="CSFPQuickPresets.deletePreset(${index})" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                `;
            });
            
            if (!presetsHtml) {
                presetsHtml = '<p>No custom presets saved yet.</p>';
            }
            
            const dialog = `
                <div class="csfp-modal active" id="manage-presets-modal">
                    <div class="csfp-modal-content csfp-glass">
                        <button class="csfp-modal-close">&times;</button>
                        <h2>Manage Custom Presets</h2>
                        
                        <div class="csfp-presets-list">
                            ${presetsHtml}
                        </div>
                        
                        <div class="csfp-modal-actions">
                            <button type="button" class="csfp-btn csfp-btn-secondary" onclick="$('#manage-presets-modal').remove()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(dialog);
            
            $('.csfp-modal-close').on('click', function() {
                $('#manage-presets-modal').remove();
            });
        },
        
        editPreset: function(index) {
            const preset = this.customPresets[index];
            if (!preset) return;
            
            // Open save dialog with preset data
            this.openSavePresetDialog();
            $('#preset-name').val(preset.name);
            $('#preset-icon').val(preset.icon);
            $('#preset-keyboard').val(preset.keyboard || '');
            $('#preset-pinned').prop('checked', preset.pinned);
            
            // Change form to update mode
            $('#save-preset-form').off('submit').on('submit', (e) => {
                e.preventDefault();
                
                preset.name = $('#preset-name').val();
                preset.icon = $('#preset-icon').val() || '🔖';
                preset.keyboard = $('#preset-keyboard').val();
                preset.pinned = $('#preset-pinned').is(':checked');
                
                this.saveToStorage();
                this.render();
                $('#save-preset-modal').remove();
                $('#manage-presets-modal').remove();
                this.showNotification('Preset updated successfully');
            });
        },
        
        deletePreset: function(index) {
            if (!confirm('Are you sure you want to delete this preset?')) return;
            
            this.customPresets.splice(index, 1);
            this.saveToStorage();
            this.render();
            $('#manage-presets-modal').remove();
            this.openManagePresetsDialog();
            this.showNotification('Preset deleted');
        },
        
        shareCurrentFilters: function() {
            const url = new URL(window.location);
            
            // Copy URL to clipboard
            navigator.clipboard.writeText(url.toString()).then(() => {
                this.showNotification('Filter link copied to clipboard');
            }).catch(() => {
                // Fallback
                const input = $('<input>').val(url.toString());
                $('body').append(input);
                input[0].select();
                document.execCommand('copy');
                input.remove();
                this.showNotification('Filter link copied to clipboard');
            });
        },
        
        getPresetById: function(id) {
            const allPresets = [...this.defaultPresets, ...this.customPresets];
            return allPresets.find(p => p.id === id);
        },
        
        getPresetByKeyboard: function(key) {
            const allPresets = [...this.defaultPresets, ...this.customPresets];
            return allPresets.find(p => p.keyboard === key);
        },
        
        getAvailableKeyboardSlots: function() {
            const usedSlots = [...this.defaultPresets, ...this.customPresets]
                .map(p => p.keyboard)
                .filter(k => k && k !== 'Shift+0');
            
            const allSlots = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            return allSlots.filter(s => !usedSlots.includes(s));
        },
        
        hasActiveTour: function() {
            // Check if user has an active market tour
            // This would integrate with the market tour system
            return typeof window.CSFPMarketTour !== 'undefined' && 
                   window.CSFPMarketTour.getActiveTour() !== null;
        },
        
        getActiveTour: function() {
            if (typeof window.CSFPMarketTour !== 'undefined') {
                return window.CSFPMarketTour.getActiveTour();
            }
            return null;
        },
        
        loadCustomPresets: function() {
            // Load from local storage
            const saved = localStorage.getItem('csfp_custom_presets');
            if (saved) {
                try {
                    this.customPresets = JSON.parse(saved);
                } catch (e) {
                    this.customPresets = [];
                }
            }
            
            // TODO: Load from server for user-specific presets
        },
        
        saveToStorage: function() {
            // Save to local storage
            localStorage.setItem('csfp_custom_presets', JSON.stringify(this.customPresets));
            
            // TODO: Save to server for user-specific presets
        },
        
        showNotification: function(message) {
            const notification = $(`
                <div class="csfp-notification">
                    ${message}
                </div>
            `);
            
            $('body').append(notification);
            
            setTimeout(() => {
                notification.addClass('show');
            }, 10);
            
            setTimeout(() => {
                notification.removeClass('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },
        
        announcePreset: function(name) {
            $('#csfp-preset-announcer').text(`${name} preset activated`);
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        // Only initialize on inspectors page
        if ($('[data-page="inspectors"]').length > 0) {
            CSFPQuickPresets.init();
        }
    });
    
})(jQuery);