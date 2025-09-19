<?php
/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @package CS_Field_Pulse
 */

class CS_Field_Pulse_Deactivator {

    /**
     * Deactivate the plugin.
     *
     * Performs necessary cleanup when the plugin is deactivated.
     */
    public static function deactivate() {
        // Cleanup operations if necessary
        // Note: We're not removing database tables here, only on uninstall
    }
}