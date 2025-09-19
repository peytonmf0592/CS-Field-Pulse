/**
 * CS Field Pulse - Mobile-Optimized Charts
 * Replaces Chart.js with custom SVG implementation for better mobile performance
 */

(function($) {
    'use strict';
    
    window.CSFPMobileCharts = {
        colors: {
            Promoter: '#20E37B',
            Passive: '#F0C41B', 
            Detractor: '#E05252'
        },
        
        isMobile: function() {
            return window.innerWidth <= 640;
        },
        
        /**
         * Create a responsive donut chart
         */
        createDonutChart: function(container, data, options = {}) {
            const $container = $(container);
            if (!$container.length) return;
            
            // Clear existing content
            $container.empty();
            
            const isMobile = this.isMobile();
            const width = isMobile ? 280 : 220;
            const height = isMobile ? 280 : 220;
            const margin = { top: 20, right: 20, bottom: 60, left: 20 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;
            const radius = Math.min(chartWidth, chartHeight) / 2;
            const innerRadius = isMobile ? 58 : 52;
            const outerRadius = isMobile ? 100 : 90;
            
            // Calculate total
            const total = data.reduce((sum, d) => sum + d.value, 0);
            
            // Create SVG
            const svg = this.createSVG($container[0], width, height);
            const g = svg.append('g')
                .attr('transform', `translate(${width/2}, ${(height-margin.bottom)/2})`);
            
            // Create pie generator
            const pie = d3.pie()
                .value(d => d.value)
                .sort(null);
            
            // Create arc generator
            const arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
            
            // Create hover arc
            const hoverArc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius + 5);
            
            // Create tooltip
            const $tooltip = $('<div class="csfp-chart-tooltip"></div>').appendTo('body');
            
            // Draw slices
            const slices = g.selectAll('.arc')
                .data(pie(data))
                .enter().append('g')
                .attr('class', 'arc');
            
            slices.append('path')
                .attr('d', arc)
                .attr('fill', d => this.colors[d.data.name])
                .attr('stroke', 'transparent')
                .style('cursor', 'pointer')
                .on('mouseenter touchstart', function(event, d) {
                    // Expand slice
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('d', hoverArc);
                    
                    // Show tooltip
                    const percent = total > 0 ? Math.round((d.data.value / total) * 100) : 0;
                    $tooltip
                        .html(`<strong>${d.data.name}</strong><br>${d.data.value} (${percent}%)`)
                        .css({
                            left: event.pageX + 10 + 'px',
                            top: event.pageY - 30 + 'px',
                            display: 'block'
                        });
                })
                .on('mouseleave touchend', function(event, d) {
                    // Contract slice
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('d', arc);
                    
                    // Hide tooltip
                    $tooltip.css('display', 'none');
                })
                .on('click', function(event, d) {
                    if (options.onClick) {
                        options.onClick(d.data.name, d.data.value);
                    }
                });
            
            // Add center text (total)
            if (total > 0) {
                g.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('class', 'csfp-chart-center-text')
                    .style('font-size', isMobile ? '24px' : '20px')
                    .style('font-weight', '600')
                    .style('fill', '#9AA3AF')
                    .text(total);
                
                g.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('y', 20)
                    .attr('class', 'csfp-chart-center-label')
                    .style('font-size', '12px')
                    .style('fill', '#6B7280')
                    .text('Total');
            }
            
            // Create legend
            this.createLegend($container[0], data, total);
            
            // Clean up tooltip on destroy
            $container.data('tooltip', $tooltip);
        },
        
        /**
         * Create SVG element with D3
         */
        createSVG: function(container, width, height) {
            // Remove any existing SVG
            d3.select(container).select('svg').remove();
            
            return d3.select(container)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('class', 'csfp-chart-svg');
        },
        
        /**
         * Create chart legend
         */
        createLegend: function(container, data, total) {
            const $container = $(container);
            const $legend = $('<div class="csfp-chart-legend"></div>');
            
            // Always show all three categories
            const categories = ['Promoter', 'Passive', 'Detractor'];
            
            categories.forEach(name => {
                const item = data.find(d => d.name === name) || { name, value: 0 };
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                
                const $item = $(`
                    <div class="csfp-legend-item">
                        <span class="csfp-legend-color" style="background-color: ${this.colors[name]}"></span>
                        <span class="csfp-legend-label">${name}</span>
                        <span class="csfp-legend-value">${item.value} (${percent}%)</span>
                    </div>
                `);
                
                $legend.append($item);
            });
            
            $container.append($legend);
        },
        
        /**
         * Initialize charts on dashboard
         */
        initDashboardCharts: function(inspectorData, adjusterData) {
            // Ensure D3 is loaded
            if (typeof d3 === 'undefined') {
                console.error('D3.js is required for mobile charts');
                return;
            }
            
            // Inspector chart
            const inspectorContainer = document.getElementById('inspector-sentiment-chart');
            if (inspectorContainer) {
                // Transform data for chart
                const inspectorChartData = [
                    { name: 'Promoter', value: inspectorData.Promoter || 0 },
                    { name: 'Passive', value: inspectorData.Passive || 0 },
                    { name: 'Detractor', value: inspectorData.Detractor || 0 }
                ];
                
                this.createDonutChart(inspectorContainer, inspectorChartData, {
                    onClick: function(sentiment) {
                        // Navigate to inspectors page with sentiment filter
                        const inspectorsPageId = window.csfp_page_ids?.inspectors;
                        if (inspectorsPageId) {
                            window.location.href = `/?page_id=${inspectorsPageId}&sentiment=${sentiment}`;
                        }
                    }
                });
            }
            
            // Adjuster chart
            const adjusterContainer = document.getElementById('adjuster-sentiment-chart');
            if (adjusterContainer) {
                // Transform data for chart
                const adjusterChartData = [
                    { name: 'Promoter', value: adjusterData.Promoter || 0 },
                    { name: 'Passive', value: adjusterData.Passive || 0 },
                    { name: 'Detractor', value: adjusterData.Detractor || 0 }
                ];
                
                this.createDonutChart(adjusterContainer, adjusterChartData, {
                    onClick: function(sentiment) {
                        // Navigate to adjusters page with sentiment filter
                        const adjustersPageId = window.csfp_page_ids?.adjusters;
                        if (adjustersPageId) {
                            window.location.href = `/?page_id=${adjustersPageId}&sentiment=${sentiment}`;
                        }
                    }
                });
            }
        },
        
        /**
         * Clean up charts
         */
        destroy: function() {
            // Remove tooltips
            $('.csfp-chart-tooltip').remove();
            
            // Clear chart containers
            $('#inspector-sentiment-chart, #adjuster-sentiment-chart').empty();
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        // Check if we're on the dashboard page
        if ($('#inspector-sentiment-chart, #adjuster-sentiment-chart').length > 0) {
            // Load D3.js if not already loaded
            if (typeof d3 === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://d3js.org/d3.v7.min.js';
                script.onload = function() {
                    console.log('D3.js loaded for mobile charts');
                };
                document.head.appendChild(script);
            }
        }
    });
    
})(jQuery);