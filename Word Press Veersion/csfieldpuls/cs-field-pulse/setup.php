<?php
/**
 * CS Field Pulse Setup Script
 * Run this file directly to set up the plugin with demo data
 */

// Load WordPress
require_once('../../../wp-load.php');

// Check if user is admin
if (!current_user_can('manage_options')) {
    die('You must be an administrator to run this setup.');
}

// Load plugin files
define('CSFP_PLUGIN_DIR', plugin_dir_path(__FILE__));
require_once CSFP_PLUGIN_DIR . 'includes/class-csfp-setup.php';

?>
<!DOCTYPE html>
<html>
<head>
    <title>CS Field Pulse Setup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #0a0a0a;
            color: #fff;
            padding: 40px;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #00ff88;
            margin-bottom: 30px;
        }
        .button {
            background: #00ff88;
            color: #0a0a0a;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
        }
        .button:hover {
            background: #00cc6a;
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
        }
        .success {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid rgba(0, 255, 136, 0.3);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .credentials {
            background: rgba(0, 255, 136, 0.05);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CS Field Pulse Setup</h1>
        
        <?php if (isset($_GET['run']) && $_GET['run'] === 'setup'): ?>
            <?php
            // Run setup
            $result = CSFP_Setup::run_setup();
            ?>
            <?php if ($result): ?>
                <div class="success">
                    <h2>✅ Setup Complete!</h2>
                    <p>CS Field Pulse has been successfully set up with demo data.</p>
                </div>
                
                <div class="info">
                    <h3>Default Admin Accounts:</h3>
                    
                    <div class="credentials">
                        <strong>Kyle Gray</strong><br>
                        Username: kgray<br>
                        Email: kgray@seeknow.com<br>
                        Role: Contractor Success Manager
                    </div>
                    
                    <div class="credentials">
                        <strong>Gino Lazio</strong><br>
                        Username: glazio<br>
                        Email: glazio@seeknow.com<br>
                        Role: Contractor Success Liaison
                    </div>
                    
                    <div class="credentials">
                        <strong>Peyton Fowlkes</strong><br>
                        Username: pfowlkes<br>
                        Email: pfowlkes@seeknow.com<br>
                        Role: Contractor Success Liaison
                    </div>
                    
                    <p><strong>Note:</strong> Passwords have been randomly generated. You'll need to reset them via the WordPress admin or database.</p>
                </div>
                
                <div class="info">
                    <h3>Demo Data Created:</h3>
                    <ul>
                        <li>15 Inspectors across 5 markets</li>
                        <li>13 Adjusters from major carriers</li>
                        <li>Sample engagements and interactions</li>
                        <li>Mixed sentiment distribution</li>
                    </ul>
                </div>
                
                <a href="<?php echo home_url('/csfp-dashboard'); ?>" class="button">Go to Dashboard</a>
                <a href="<?php echo admin_url(); ?>" class="button">WordPress Admin</a>
                
            <?php else: ?>
                <div class="error">
                    <h2>❌ Setup Failed</h2>
                    <p>There was an error during setup. Please check your WordPress installation and try again.</p>
                </div>
            <?php endif; ?>
            
        <?php else: ?>
            <div class="info">
                <h2>Welcome to CS Field Pulse Setup</h2>
                <p>This will:</p>
                <ul>
                    <li>Create all necessary database tables</li>
                    <li>Set up default admin users</li>
                    <li>Create WordPress pages with shortcodes</li>
                    <li>Add demo data for testing</li>
                </ul>
                
                <p><strong>⚠️ Warning:</strong> This will reset any existing CS Field Pulse data!</p>
            </div>
            
            <a href="?run=setup" class="button" onclick="return confirm('Are you sure? This will reset all CS Field Pulse data.')">Run Setup</a>
            <a href="<?php echo admin_url(); ?>" class="button">Cancel</a>
        <?php endif; ?>
    </div>
</body>
</html>