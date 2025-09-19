<?php
/**
 * Settings class.
 *
 * Handles plugin settings.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Settings {

    /**
     * Settings option name.
     *
     * @var string
     */
    private $option_name = 'cs_field_pulse_settings';

    /**
     * Default settings.
     *
     * @var array
     */
    private $defaults = array(
        'evaluation_scale' => 10, // 1-10 scale
        'classification_thresholds' => array(
            'promoter' => 8, // 8-10 = promoter
            'passive' => 6,  // 6-7 = passive, below 6 = detractor
        ),
        'visit_types' => array(
            'office',
            'field_ride',
            'training',
            'customer_site'
        )
    );

    /**
     * Constructor.
     */
    public function __construct() {
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register settings.
     */
    public function register_settings() {
        register_setting(
            'cs_field_pulse_settings',
            $this->option_name,
            array($this, 'sanitize_settings')
        );

        // General Settings
        add_settings_section(
            'cs_field_pulse_general_settings',
            __('General Settings', 'cs-field-pulse'),
            array($this, 'render_general_section'),
            'cs_field_pulse_settings'
        );

        // Evaluation Scale
        add_settings_field(
            'evaluation_scale',
            __('Evaluation Scale', 'cs-field-pulse'),
            array($this, 'render_evaluation_scale_field'),
            'cs_field_pulse_settings',
            'cs_field_pulse_general_settings'
        );

        // Classification Thresholds
        add_settings_field(
            'classification_thresholds',
            __('Classification Thresholds', 'cs-field-pulse'),
            array($this, 'render_classification_thresholds_field'),
            'cs_field_pulse_settings',
            'cs_field_pulse_general_settings'
        );

        // Visit Types
        add_settings_field(
            'visit_types',
            __('Visit Types', 'cs-field-pulse'),
            array($this, 'render_visit_types_field'),
            'cs_field_pulse_settings',
            'cs_field_pulse_general_settings'
        );

        // Evaluation Criteria Settings
        add_settings_section(
            'cs_field_pulse_evaluation_criteria',
            __('Evaluation Criteria', 'cs-field-pulse'),
            array($this, 'render_evaluation_criteria_section'),
            'cs_field_pulse_settings'
        );
    }

    /**
     * Sanitize settings.
     *
     * @param array $input The settings input.
     * @return array Sanitized settings.
     */
    public function sanitize_settings($input) {
        $sanitized = array();

        // Evaluation Scale
        if (isset($input['evaluation_scale'])) {
            $sanitized['evaluation_scale'] = intval($input['evaluation_scale']);
            if ($sanitized['evaluation_scale'] < 5 || $sanitized['evaluation_scale'] > 10) {
                $sanitized['evaluation_scale'] = 10; // Default to 10 if invalid
            }
        }

        // Classification Thresholds
        if (isset($input['classification_thresholds']['promoter'])) {
            $sanitized['classification_thresholds']['promoter'] = intval($input['classification_thresholds']['promoter']);
        }
        if (isset($input['classification_thresholds']['passive'])) {
            $sanitized['classification_thresholds']['passive'] = intval($input['classification_thresholds']['passive']);
        }

        // Visit Types
        if (isset($input['visit_types']) && is_array($input['visit_types'])) {
            $sanitized['visit_types'] = array();
            foreach ($input['visit_types'] as $type) {
                $sanitized['visit_types'][] = sanitize_text_field($type);
            }
        }

        return $sanitized;
    }

    /**
     * Render general section.
     */
    public function render_general_section() {
        echo '<p>' . __('Configure general settings for the CS Field Pulse plugin.', 'cs-field-pulse') . '</p>';
    }

    /**
     * Render evaluation scale field.
     */
    public function render_evaluation_scale_field() {
        $settings = $this->get_settings();
        $scale = $settings['evaluation_scale'];

        echo '<select name="' . esc_attr($this->option_name) . '[evaluation_scale]">';
        for ($i = 5; $i <= 10; $i++) {
            echo '<option value="' . esc_attr($i) . '" ' . selected($scale, $i, false) . '>' . esc_html($i) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">' . __('The maximum score for evaluation criteria.', 'cs-field-pulse') . '</p>';
    }

    /**
     * Render classification thresholds field.
     */
    public function render_classification_thresholds_field() {
        $settings = $this->get_settings();
        $promoter_threshold = $settings['classification_thresholds']['promoter'];
        $passive_threshold = $settings['classification_thresholds']['passive'];

        echo '<div class="classification-thresholds">';
        echo '<label>' . __('Promoter Threshold:', 'cs-field-pulse') . ' ';
        echo '<input type="number" name="' . esc_attr($this->option_name) . '[classification_thresholds][promoter]" value="' . esc_attr($promoter_threshold) . '" min="1" max="' . esc_attr($settings['evaluation_scale']) . '" /></label>';
        echo '<p class="description">' . __('Scores at or above this threshold are classified as Promoters.', 'cs-field-pulse') . '</p>';

        echo '<label>' . __('Passive Threshold:', 'cs-field-pulse') . ' ';
        echo '<input type="number" name="' . esc_attr($this->option_name) . '[classification_thresholds][passive]" value="' . esc_attr($passive_threshold) . '" min="1" max="' . esc_attr($settings['evaluation_scale'] - 1) . '" /></label>';
        echo '<p class="description">' . __('Scores at or above this threshold (but below Promoter threshold) are classified as Passives. Below this are Detractors.', 'cs-field-pulse') . '</p>';
        echo '</div>';
    }

    /**
     * Render visit types field.
     */
    public function render_visit_types_field() {
        $settings = $this->get_settings();
        $visit_types = $settings['visit_types'];

        echo '<div class="visit-types">';
        echo '<p>' . __('Enter one visit type per line:', 'cs-field-pulse') . '</p>';
        echo '<textarea name="' . esc_attr($this->option_name) . '[visit_types]" rows="5" cols="50">' . esc_textarea(implode("\n", $visit_types)) . '</textarea>';
        echo '</div>';
    }

    /**
     * Render evaluation criteria section.
     */
    public function render_evaluation_criteria_section() {
        echo '<p>' . __('Manage the evaluation criteria used when recording visits.', 'cs-field-pulse') . '</p>';

        // Get all evaluation criteria
        $evaluation = new CS_Field_Pulse_Evaluation();
        $criteria = $evaluation->get_all_criteria(false);

        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead>';
        echo '<tr>';
        echo '<th>' . __('Criteria', 'cs-field-pulse') . '</th>';
        echo '<th>' . __('Key', 'cs-field-pulse') . '</th>';
        echo '<th>' . __('Description', 'cs-field-pulse') . '</th>';
        echo '<th>' . __('Status', 'cs-field-pulse') . '</th>';
        echo '<th>' . __('Actions', 'cs-field-pulse') . '</th>';
        echo '</tr>';
        echo '</thead>';
        echo '<tbody id="evaluation-criteria-list">';

        foreach ($criteria as $criterion) {
            echo '<tr data-id="' . esc_attr($criterion->id) . '">';
            echo '<td>' . esc_html($criterion->display_name) . '</td>';
            echo '<td>' . esc_html($criterion->criteria_key) . '</td>';
            echo '<td>' . esc_html($criterion->description) . '</td>';
            echo '<td>' . ($criterion->active ? __('Active', 'cs-field-pulse') : __('Inactive', 'cs-field-pulse')) . '</td>';
            echo '<td>';
            echo '<button type="button" class="button edit-criteria">' . __('Edit', 'cs-field-pulse') . '</button> ';
            echo '<button type="button" class="button ' . ($criterion->active ? 'deactivate-criteria' : 'activate-criteria') . '">' 
                . ($criterion->active ? __('Deactivate', 'cs-field-pulse') : __('Activate', 'cs-field-pulse')) . '</button>';
            echo '</td>';
            echo '</tr>';
        }

        echo '</tbody>';
        echo '</table>';

        echo '<h3>' . __('Add New Criteria', 'cs-field-pulse') . '</h3>';
        echo '<div class="new-criteria-form">';
        echo '<p><label>' . __('Display Name:', 'cs-field-pulse') . '<br>';
        echo '<input type="text" id="new-criteria-name" /></label></p>';
        echo '<p><label>' . __('Key:', 'cs-field-pulse') . '<br>';
        echo '<input type="text" id="new-criteria-key" /></label></p>';
        echo '<p><label>' . __('Description:', 'cs-field-pulse') . '<br>';
        echo '<textarea id="new-criteria-description" rows="3" cols="50"></textarea></label></p>';
        echo '<p><button type="button" class="button button-primary" id="add-criteria">' . __('Add Criteria', 'cs-field-pulse') . '</button></p>';
        echo '</div>';

        // Add edit form (hidden by default)
        echo '<div id="edit-criteria-form" style="display:none;">';
        echo '<h3>' . __('Edit Criteria', 'cs-field-pulse') . '</h3>';
        echo '<input type="hidden" id="edit-criteria-id" />';
        echo '<p><label>' . __('Display Name:', 'cs-field-pulse') . '<br>';
        echo '<input type="text" id="edit-criteria-name" /></label></p>';
        echo '<p><label>' . __('Description:', 'cs-field-pulse') . '<br>';
        echo '<textarea id="edit-criteria-description" rows="3" cols="50"></textarea></label></p>';
        echo '<p>';
        echo '<button type="button" class="button button-primary" id="save-criteria">' . __('Save Changes', 'cs-field-pulse') . '</button> ';
        echo '<button type="button" class="button" id="cancel-edit">' . __('Cancel', 'cs-field-pulse') . '</button>';
        echo '</p>';
        echo '</div>';
    }

    /**
     * Get settings.
     *
     * @return array The settings.
     */
    public function get_settings() {
        $settings = get_option($this->option_name, array());
        return wp_parse_args($settings, $this->defaults);
    }

    /**
     * Get a specific setting.
     *
     * @param string $key The setting key.
     * @param mixed $default The default value.
     * @return mixed The setting value.
     */
    public function get_setting($key, $default = null) {
        $settings = $this->get_settings();
        
        if (strpos($key, '.') !== false) {
            $keys = explode('.', $key);
            $value = $settings;
            
            foreach ($keys as $k) {
                if (!isset($value[$k])) {
                    return $default;
                }
                $value = $value[$k];
            }
            
            return $value;
        }
        
        return isset($settings[$key]) ? $settings[$key] : $default;
    }

    /**
     * Update settings.
     *
     * @param array $settings The settings to update.
     * @return bool Whether the settings were updated.
     */
    public function update_settings($settings) {
        $current_settings = $this->get_settings();
        $updated_settings = wp_parse_args($settings, $current_settings);
        
        return update_option($this->option_name, $updated_settings);
    }
}