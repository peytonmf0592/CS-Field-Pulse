<?php
/**
 * Template Name: CS Field Pulse Full Width
 * Description: Full width template for CS Field Pulse pages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title><?php wp_title('|', true, 'right'); ?></title>
    <?php wp_head(); ?>
    <style>
        /* iOS safe areas and viewport fixes */
        html {
            -webkit-text-size-adjust: 100%;
        }
        
        /* Remove all WordPress theme margins and padding */
        body {
            margin: 0 !important;
            padding: 0 !important;
            padding-top: env(safe-area-inset-top) !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
        }
        
        .site-content,
        .content-area,
        .site-main,
        article,
        .entry-content,
        #content,
        #primary,
        #main,
        .wp-site-blocks {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
        }
        
        /* Hide WordPress admin bar for non-admins */
        body:not(.admin-bar) #wpadminbar {
            display: none !important;
        }
        
        /* Full width container */
        .csfp-container {
            width: 100vw;
            margin: 0;
            padding: 1.5rem;
            box-sizing: border-box;
        }
        
        /* Hide any theme headers/footers if needed */
        .site-header,
        .site-footer {
            display: none;
        }
    </style>
</head>
<body <?php body_class('csfp-full-width'); ?>>
    <?php wp_body_open(); ?>
    
    <main id="csfp-main" class="csfp-main-content">
        <?php
        while (have_posts()) {
            the_post();
            the_content();
        }
        ?>
    </main>
    
    <?php wp_footer(); ?>
</body>
</html>