/**
 * CS Field Pulse Dashboard JavaScript
 * This file handles all dashboard functionality including data loading,
 * chart rendering, and UI interactions.
 */
// Define default variables to prevent errors
var cs_field_pulse_params = cs_field_pulse_params || {
    ajax_url: (typeof ajaxurl !== 'undefined') ? ajaxurl : '/wp-admin/admin-ajax.php',
    nonce: 'default_nonce'
};

jQuery(document).ready(function($) {
    // Log initialization for debugging
    console.log('CS Field Pulse Dashboard initialized with demo data');
    
    // Chart instances (stored globally so they can be destroyed and recreated)
    let visitTrendChart = null;
    let classificationChart = null;
    let criteriaChart = null;
    
    // Dashboard demo data
    const demoData = {
        total_inspectors: 8,
        total_visits: 15, 
        visits_this_month: 5,
        promoters_percent: 38,
        passives_percent: 37,
        detractors_percent: 25,
        chart_data: {
            visit_trend: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                datasets: [
                    {
                        label: 'Promoters',
                        data: [3, 4, 5, 4, 5, 6],
                        backgroundColor: '#00E676'
                    },
                    {
                        label: 'Passives', 
                        data: [2, 3, 4, 3, 2, 1],
                        backgroundColor: '#FFD600'
                    },
                    {
                        label: 'Detractors',
                        data: [1, 1, 0, 2, 1, 1],
                        backgroundColor: '#FF5252'
                    }
                ]
            },
            classification: {
                labels: ['Promoters', 'Passives', 'Detractors'],
                datasets: [
                    {
                        data: [3, 3, 2],
                        backgroundColor: ['#00E676', '#FFD600', '#FF5252']
                    }
                ]
            },
            criteria: {
                labels: ['Friendliness', 'Efficiency', 'Attitude', 'Branding', 'Punctuality'],
                datasets: [
                    {
                        label: 'Average Score',
                        data: [8.2, 7.6, 7.5, 8.1, 6.8],
                        backgroundColor: '#00C853'
                    }
                ]
            }
        },
        recent_visits: [
            { inspector_name: 'John Smith', visit_date: '2025-04-05', location_type: 'Office', classification: 'promoter', edit_url: '#' },
            { inspector_name: 'Sarah Johnson', visit_date: '2025-04-02', location_type: 'Field', classification: 'passive', edit_url: '#' },
            { inspector_name: 'Michael Brown', visit_date: '2025-03-31', location_type: 'Field', classification: 'detractor', edit_url: '#' }
        ],
        recent_inspectors: [
            { name: 'John Smith', location: 'New York', classification: 'promoter', edit_url: '#' },
            { name: 'Emily Davis', location: 'Houston', classification: 'promoter', edit_url: '#' },
            { name: 'Jennifer Martinez', location: 'Philadelphia', classification: 'promoter', edit_url: '#' }
        ]
    };
    
    // Load Chart.js dynamically
    function loadChartJS() {
        console.log('Loading Chart.js from CDN');
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
        script.onload = function() {
            console.log('Chart.js loaded successfully');
            // Once loaded, update charts with demo data
            updateCharts(demoData.chart_data);
        };
        script.onerror = function() {
            console.error('Failed to load Chart.js');
            $('.cs-chart-container').each(function() {
                $(this).html('<div class="cs-alert cs-alert-warning">Chart library could not be loaded. Please refresh the page or contact the administrator.</div>');
            });
        };
        document.head.appendChild(script);
    }
    
    // Function to load dashboard data (in this demo, we're using static data)
    function loadDashboardData() {
        // Show loading indicator
        $('.loading-dashboard-data').show();
        $('#refresh-dashboard').addClass('cs-loading-btn');
        
        // Simulate loading delay for demonstration
        setTimeout(function() {
            // Hide loading indicators
            $('.loading-dashboard-data').hide();
            $('#refresh-dashboard').removeClass('cs-loading-btn');
            
            // Update dashboard with demo data
            updateDashboardMetrics(demoData);
            updateClassificationDistribution(demoData);
            updateRecentVisits(demoData.recent_visits);
            updateRecentInspectors(demoData.recent_inspectors);
            
            // Load Chart.js if needed and update charts
            if (typeof Chart === 'undefined') {
                loadChartJS();
            } else {
                updateCharts(demoData.chart_data);
            }
            
            // Show success notification
            showNotification('success', 'Dashboard updated with demo data');
        }, 800);
    }
    
    // Function to update dashboard metrics
    function updateDashboardMetrics(data) {
        // Update count metrics
        $('#total-inspectors').text(data.total_inspectors || 0);
        $('#total-visits').text(data.total_visits || 0);
        $('#visits-this-month').text(data.visits_this_month || 0);
    }
    
    // Function to update classification distribution
    function updateClassificationDistribution(data) {
        // Update percentages
        $('#promoter-percent').text(data.promoters_percent + '%');
        $('#passive-percent').text(data.passives_percent + '%');
        $('#detractor-percent').text(data.detractors_percent + '%');
        
        // Update progress bars
        $('#promoter-bar').css('width', data.promoters_percent + '%');
        $('#passive-bar').css('width', data.passives_percent + '%');
        $('#detractor-bar').css('width', data.detractors_percent + '%');
    }
    
    // Function to update charts with new data
    function updateCharts(chartData) {
        // Only proceed if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not available');
            
            // Show fallback message in chart containers
            $('.cs-chart-container').html('<div class="cs-alert cs-alert-warning">Chart library not available. Please install Chart.js to view charts.</div>');
            return;
        }
        
        // Set common chart configuration
        Chart.defaults.color = '#B0B0B0';
        Chart.defaults.font.family = "'Poppins', sans-serif";
        
        // Destroy existing charts to prevent memory leaks
        destroyExistingCharts();
        
        // Create visit trend chart
        if ($('#visits-chart').length && chartData.visit_trend) {
            const ctx = document.getElementById('visits-chart').getContext('2d');
            visitTrendChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.visit_trend.labels,
                    datasets: chartData.visit_trend.datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#FFFFFF',
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        title: {
                            display: true,
                            text: 'Visit Trends',
                            color: '#FFFFFF',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            backgroundColor: '#242424',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: '#00E676',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#B0B0B0'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#B0B0B0'
                            }
                        }
                    }
                }
            });
        } else {
            console.warn('Visit trend chart element not found or data missing');
        }
        
        // Create classification distribution chart
        if ($('#classification-chart').length && chartData.classification) {
            const ctx = document.getElementById('classification-chart').getContext('2d');
            classificationChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartData.classification.labels,
                    datasets: chartData.classification.datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#FFFFFF',
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        title: {
                            display: true,
                            text: 'Classification Distribution',
                            color: '#FFFFFF',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            backgroundColor: '#242424',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderWidth: 1
                        }
                    }
                }
            });
        } else {
            console.warn('Classification chart element not found or data missing');
        }
        
        // Create criteria chart if available
        if ($('#criteria-chart').length && chartData.criteria && chartData.criteria.labels.length > 0) {
            const ctx = document.getElementById('criteria-chart').getContext('2d');
            criteriaChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.criteria.labels,
                    datasets: chartData.criteria.datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Evaluation Criteria Scores',
                            color: '#FFFFFF',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            backgroundColor: '#242424',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: '#00E676',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#B0B0B0'
                            }
                        },
                        x: {
                            beginAtZero: true,
                            max: 10,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#B0B0B0'
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Function to destroy existing charts before creating new ones
    function destroyExistingCharts() {
        if (visitTrendChart) {
            visitTrendChart.destroy();
            visitTrendChart = null;
        }
        
        if (classificationChart) {
            classificationChart.destroy();
            classificationChart = null;
        }
        
        if (criteriaChart) {
            criteriaChart.destroy();
            criteriaChart = null;
        }
    }
    
    // Function to update recent visits list
    function updateRecentVisits(visits) {
        const $container = $('#recent-visits');
        
        if (!visits || visits.length === 0) {
            $container.html('<p class="cs-text-muted">No recent visits found.</p>');
            return;
        }
        
        let html = '<ul class="cs-list">';
        
        visits.forEach(function(visit) {
            const classColor = getClassificationClass(visit.classification);
            const visitEditUrl = visit.edit_url || '#';
            
            html += '<li class="cs-list-item">';
            html += '<div class="cs-d-flex cs-justify-between">';
            html += '<div class="cs-flex-grow-1">';
            html += '<a href="' + visitEditUrl + '" class="cs-fw-bold">' + visit.inspector_name + '</a>';
            html += '<div class="cs-text-sm cs-text-muted">' + visit.visit_date + ' • ' + visit.location_type + '</div>';
            html += '</div>';
            html += '<div class="' + classColor + ' cs-text-sm cs-fw-bold cs-text-uppercase">' + visit.classification + '</div>';
            html += '</div>';
            html += '</li>';
        });
        
        html += '</ul>';
        $container.html(html);
    }
    
    // Function to update recent inspectors list
    function updateRecentInspectors(inspectors) {
        const $container = $('#recent-inspectors');
        
        if (!inspectors || inspectors.length === 0) {
            $container.html('<p class="cs-text-muted">No recent inspector activity found.</p>');
            return;
        }
        
        let html = '<ul class="cs-list">';
        
        inspectors.forEach(function(inspector) {
            const classColor = getClassificationClass(inspector.classification);
            const inspectorEditUrl = inspector.edit_url || '#';
            const inspectorLocation = inspector.location || '';
            
            html += '<li class="cs-list-item">';
            html += '<div class="cs-d-flex cs-justify-between">';
            html += '<div class="cs-flex-grow-1">';
            html += '<a href="' + inspectorEditUrl + '" class="cs-fw-bold">' + inspector.name + '</a>';
            
            if (inspectorLocation) {
                html += '<div class="cs-text-sm cs-text-muted">' + inspectorLocation + '</div>';
            }
            
            html += '</div>';
            html += '<div class="' + classColor + ' cs-text-sm cs-fw-bold cs-text-uppercase">' + inspector.classification + '</div>';
            html += '</div>';
            html += '</li>';
        });
        
        html += '</ul>';
        $container.html(html);
    }
    
    // Helper function to get classification CSS class
    function getClassificationClass(classification) {
        switch (classification) {
            case 'promoter':
                return 'cs-text-success';
            case 'passive':
                return 'cs-text-warning';
            case 'detractor':
                return 'cs-text-danger';
            default:
                return 'cs-text-muted';
        }
    }
    
    // Function to show notifications
    function showNotification(type, message) {
        // Remove any existing notifications
        $('#cs-notifications .cs-alert').remove();
        
        // Determine alert class based on type
        let alertClass = 'cs-alert-info';
        if (type === 'error') {
            alertClass = 'cs-alert-danger';
        } else if (type === 'success') {
            alertClass = 'cs-alert-success';
        } else if (type === 'warning') {
            alertClass = 'cs-alert-warning';
        }
        
        // Create notification HTML
        const html = `
            <div class="cs-alert ${alertClass}">
                <span class="dashicons dashicons-${type === 'error' ? 'warning' : 'info'}"></span>
                ${message}
                <button type="button" class="cs-alert-close">&times;</button>
            </div>
        `;
        
        // Add notification to the container
        $('#cs-notifications').append(html);
        
        // Add close button handler
        $('#cs-notifications .cs-alert-close').on('click', function() {
            $(this).parent().fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(function() {
                $('#cs-notifications .cs-alert').fadeOut(300, function() {
                    $(this).remove();
                });
            }, 5000);
        }
    }
    
    // Event handler for refresh button
    $('#refresh-dashboard').on('click', function() {
        loadDashboardData();
    });
    
    // Event handler for period filter buttons
    $('.cs-period-filter').on('click', function() {
        $('.cs-period-filter').removeClass('active');
        $(this).addClass('active');
        loadDashboardData();
    });
    
    // Load dashboard data on page load
    loadDashboardData();
});