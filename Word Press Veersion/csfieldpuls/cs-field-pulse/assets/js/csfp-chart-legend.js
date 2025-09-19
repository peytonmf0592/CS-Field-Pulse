/**
 * CS Field Pulse - Enhanced Chart Legend Interactions
 */

(function($) {
    'use strict';
    
    // Wait for charts to be created
    $(document).ready(function() {
        // Apply custom styling to Chart.js legends after they render
        const enhanceLegends = function() {
            // Find all chart canvases
            $('canvas#inspector-sentiment-chart, canvas#adjuster-sentiment-chart').each(function() {
                const canvas = this;
                const $canvas = $(canvas);
                
                // Get the chart instance
                const chartInstance = Chart.getChart(canvas);
                if (!chartInstance) return;
                
                // Override the legend click handler for cool effects
                const originalOnClick = chartInstance.options.plugins.legend.onClick;
                chartInstance.options.plugins.legend.onClick = function(e, legendItem, legend) {
                    // Add ripple effect
                    const $legend = $canvas.closest('.csfp-sentiment-chart').find('.chartjs-legend');
                    if ($legend.length) {
                        const $item = $legend.find('li').eq(legendItem.index);
                        
                        // Create ripple effect
                        const ripple = $('<span class="legend-ripple"></span>');
                        $item.append(ripple);
                        
                        setTimeout(() => ripple.remove(), 600);
                    }
                    
                    // Call original handler if exists
                    if (originalOnClick) {
                        originalOnClick.call(this, e, legendItem, legend);
                    }
                };
                
                // Add glow effect on hover
                chartInstance.options.plugins.legend.onHover = function(e, legendItem, legend) {
                    e.native.target.style.cursor = 'pointer';
                    
                    // Add glow to corresponding chart segment
                    if (legendItem) {
                        chartInstance.setActiveElements([{
                            datasetIndex: 0,
                            index: legendItem.index
                        }]);
                        chartInstance.update();
                    }
                };
                
                chartInstance.options.plugins.legend.onLeave = function(e, legendItem, legend) {
                    chartInstance.setActiveElements([]);
                    chartInstance.update();
                };
                
                // Update the chart
                chartInstance.update();
            });
        };
        
        // Run enhancement after charts load
        setTimeout(enhanceLegends, 500);
        
        // Re-run when dashboard data is loaded
        $(document).on('dashboardDataLoaded', enhanceLegends);
    });
    
    // Add CSS for ripple effect
    const style = `
        <style>
            .legend-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(32, 227, 123, 0.5);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                width: 20px;
                height: 20px;
                top: 50%;
                left: 10px;
                margin-top: -10px;
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* Enhance legend container */
            .csfp-sentiment-chart {
                position: relative;
            }
            
            /* Clean single rectangle indicator per item */
            .chartjs-legend li,
            .chart-legend li {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
            }
        </style>
    `;
    
    $('head').append(style);
    
})(jQuery);