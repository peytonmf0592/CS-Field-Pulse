/**
 * CS Field Pulse Export Functionality
 * Generates Excel workbook with Inspector and Adjuster sheets, plus CSV files
 */

(function($) {
    'use strict';
    
    window.CSFPExport = {
        
        // Initialize export functionality
        init: function() {
            // Don't add export button - it's now in the navigation menu
            // Just bind the nav button click
            $(document).on('click', '#csfp-export-visits-nav', function() {
                CSFPExport.exportAllVisits();
            });
        },
        
        // Export all visits
        exportAllVisits: function() {
            // Handle nav button
            const $button = $('#csfp-export-visits-nav');
            const originalText = $button.html();
            
            // Show loading state
            $button.html('<span style="margin-right: 0.5rem;">⏳</span> Exporting...').prop('disabled', true);
            
            // Request data from server
            $.post(csfp_ajax.ajax_url, {
                action: 'csfp_export_all_visits',
                nonce: csfp_ajax.nonce
            }, function(response) {
                if (response.success) {
                    const data = response.data;
                    
                    // Generate Excel workbook
                    CSFPExport.generateExcel(
                        data.inspector_data,
                        data.adjuster_data,
                        data.filename_base
                    );
                    
                    // Generate CSV files
                    CSFPExport.generateCSV(data.inspector_data, 'Inspector_Visits.csv');
                    CSFPExport.generateCSV(data.adjuster_data, 'Adjuster_Visits.csv');
                    
                    // Reset button
                    $button.html(originalText).prop('disabled', false);
                    
                    // Show success message
                    alert('Export complete! Files have been downloaded.');
                } else {
                    alert('Export failed: ' + (response.data || 'Unknown error'));
                    $button.html(originalText).prop('disabled', false);
                }
            }).fail(function() {
                alert('Network error. Please try again.');
                $button.html(originalText).prop('disabled', false);
            });
        },
        
        // Generate Excel workbook with multiple sheets
        generateExcel: function(inspectorData, adjusterData, filenameBase) {
            // Check if SheetJS library is loaded
            if (typeof XLSX === 'undefined') {
                // Load SheetJS dynamically
                const script = document.createElement('script');
                script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
                script.onload = () => {
                    CSFPExport.createExcelWorkbook(inspectorData, adjusterData, filenameBase);
                };
                document.head.appendChild(script);
            } else {
                CSFPExport.createExcelWorkbook(inspectorData, adjusterData, filenameBase);
            }
        },
        
        // Create Excel workbook
        createExcelWorkbook: function(inspectorData, adjusterData, filenameBase) {
            // Create a new workbook
            const wb = XLSX.utils.book_new();
            
            // Create Inspector sheet
            const inspectorSheet = XLSX.utils.aoa_to_sheet(inspectorData);
            XLSX.utils.book_append_sheet(wb, inspectorSheet, 'Inspector Engagement 2025');
            
            // Create Adjuster sheet
            const adjusterSheet = XLSX.utils.aoa_to_sheet(adjusterData);
            XLSX.utils.book_append_sheet(wb, adjusterSheet, 'Adjuster Engagement 2025');
            
            // Auto-size columns for both sheets
            const inspectorRange = XLSX.utils.decode_range(inspectorSheet['!ref']);
            const adjusterRange = XLSX.utils.decode_range(adjusterSheet['!ref']);
            
            // Set column widths for Inspector sheet
            const inspectorCols = [];
            for (let C = inspectorRange.s.c; C <= inspectorRange.e.c; ++C) {
                inspectorCols.push({ wch: 20 });
            }
            inspectorSheet['!cols'] = inspectorCols;
            
            // Set column widths for Adjuster sheet
            const adjusterCols = [];
            for (let C = adjusterRange.s.c; C <= adjusterRange.e.c; ++C) {
                adjusterCols.push({ wch: 20 });
            }
            adjusterSheet['!cols'] = adjusterCols;
            
            // Write the file
            XLSX.writeFile(wb, filenameBase + '.xlsx');
        },
        
        // Generate CSV file
        generateCSV: function(data, filename) {
            let csv = '';
            
            // Process each row
            data.forEach(row => {
                // Escape and quote fields that contain commas, quotes, or newlines
                const processedRow = row.map(field => {
                    // Convert to string
                    let value = field !== null && field !== undefined ? String(field) : '';
                    
                    // Check if field needs to be quoted
                    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                        // Escape quotes by doubling them
                        value = value.replace(/"/g, '""');
                        // Wrap in quotes
                        value = '"' + value + '"';
                    }
                    
                    return value;
                });
                
                csv += processedRow.join(',') + '\n';
            });
            
            // Create blob with UTF-8 BOM for Excel compatibility
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
            
            // Download the file
            CSFPExport.downloadFile(blob, filename);
        },
        
        // Download file helper
        downloadFile: function(blob, filename) {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        }
    };
    
    // Initialize on document ready
    $(document).ready(function() {
        // Only initialize if we're on a page with visits functionality
        if ($('.csfp-dashboard').length || $('.csfp-visits-container').length || $('#quick-visit-btn').length) {
            CSFPExport.init();
        }
    });
    
})(jQuery);