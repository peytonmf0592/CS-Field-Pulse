<?php
/**
 * Fired during plugin deactivation
 */
class CSFP_Deactivator {
    
    /**
     * Deactivate the plugin
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}