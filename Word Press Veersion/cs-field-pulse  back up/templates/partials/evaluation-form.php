 <?php
/**
 * Evaluation form partial template.
 *
 * @package CS_Field_Pulse
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Required variables:
// $criteria - Array of evaluation criteria
// $visit - Visit object (optional, null for new visit)
// $scale - Evaluation scale (1-10)
?>

<h2><?php _e('Evaluation Criteria', 'cs-field-pulse'); ?></h2>

<?php if (empty($criteria)) : ?>
    <div class="cs-card cs-text-center">
        <?php _e('No evaluation criteria found. Please add criteria in the settings.', 'cs-field-pulse'); ?>
    </div>
<?php else : ?>
    <div class="cs-grid">
        <?php foreach ($criteria as $criterion) : 
            // Get evaluation score and notes if editing
            $evaluation_score = 5; // Default score
            $evaluation_notes = '';
            
            if ($visit && !empty($visit->evaluations)) {
                foreach ($visit->evaluations as $evaluation) {
                    if ($evaluation->criteria_key === $criterion->criteria_key) {
                        $evaluation_score = $evaluation->score;
                        $evaluation_notes = $evaluation->notes;
                        break;
                    }
                }
            }
        ?>
            <div class="cs-card cs-evaluation-criteria" data-criteria-key="<?php echo esc_attr($criterion->criteria_key); ?>">
                <h3 class="cs-card-title"><?php echo esc_html($criterion->display_name); ?></h3>
                
                <?php if (!empty($criterion->description)) : ?>
                    <div class="cs-text-secondary cs-mb-10"><?php echo esc_html($criterion->description); ?></div>
                <?php endif; ?>
                
                <div class="cs-d-flex cs-align-center cs-mb-10">
                    <input type="range" class="cs-evaluation-slider" 
                           name="evaluations[<?php echo esc_attr($criterion->criteria_key); ?>][score]" 
                           min="1" max="<?php echo esc_attr($scale); ?>" step="1" 
                           value="<?php echo esc_attr($evaluation_score); ?>">
                    <span class="cs-evaluation-value"><?php echo esc_html($evaluation_score); ?></span>
                </div>
                
                <div class="cs-form-group">
                    <label class="cs-form-label"><?php _e('Notes', 'cs-field-pulse'); ?></label>
                    <textarea class="cs-form-control cs-evaluation-notes" 
                              name="evaluations[<?php echo esc_attr($criterion->criteria_key); ?>][notes]" 
                              rows="2"><?php echo esc_textarea($evaluation_notes); ?></textarea>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<script>
    jQuery(document).ready(function($) {
        // Update evaluation value display when slider changes
        $('.cs-evaluation-slider').on('input change', function() {
            var value = $(this).val();
            $(this).siblings('.cs-evaluation-value').text(value);
            
            // Update color based on value
            updateSliderColor($(this), value);
        });
        
        // Initial setup of sliders
        $('.cs-evaluation-slider').each(function() {
            var value = $(this).val();
            updateSliderColor($(this), value);
        });
        
        function updateSliderColor(slider, value) {
            var max = slider.attr('max') || 10;
            var percentage = (value / max) * 100;
            
            // Determine color based on percentage
            var color;
            if (percentage >= 80) {
                color = 'var(--cs-success)';
            } else if (percentage >= 60) {
                color = 'var(--cs-warning)';
            } else {
                color = 'var(--cs-danger)';
            }
            
            slider.siblings('.cs-evaluation-value').css('background-color', color);
        }
    });
</script>
