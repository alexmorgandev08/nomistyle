<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Deps\BitApps\WPKit\Hooks\Hooks;
use GutenStyle\Styles\Schema;
use WP_HTML_Tag_Processor;

/**
 * A front-end page with sample blocks, loaded in an iframe on the Global Styles
 * screen. It runs through the active theme's head, so the preview shows the
 * theme's own fonts, colors and block styles. The admin screen injects the
 * unsaved GutenStyle CSS into it.
 */
final class PreviewPage
{
    public const QUERY_VAR = 'gutenstyle-preview';

    public function __construct()
    {
        Hooks::addAction('template_redirect', [$this, 'maybeRender'], 0);
    }

    public static function url()
    {
        return add_query_arg(self::QUERY_VAR, '1', home_url('/'));
    }

    public function maybeRender()
    {
        if (!isset($_GET[self::QUERY_VAR])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only preview
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You are not allowed to view this preview.', 'guten-style'), 403);
        }

        show_admin_bar(false);
        add_filter('wp_robots', 'wp_robots_no_robots');
        header('X-Robots-Tag: noindex');

        // Render blocks before wp_head() so their stylesheets are enqueued in time.
        $sections = '';

        foreach (self::samples() as $type => $markup) {
            $sections .= '<section class="gs-preview-sample" data-gs-sample="' . esc_attr($type) . '" hidden>'
                . $this->renderSample($type, $markup)
                . '</section>';
        }

        wp_enqueue_style('wp-block-library');

        // The preview frame's own layout, printed by wp_head().
        $handle = Config::SLUG . '-preview';
        wp_register_style($handle, false, [], Config::VERSION);
        wp_enqueue_style($handle);
        wp_add_inline_style(
            $handle,
            'html, body { margin: 0 !important; }
            .gs-preview { box-sizing: border-box; max-width: 760px; margin: 0 auto !important; padding: 40px 24px; }
            .gs-preview-sample > * + * { margin-block-start: 1.5em; }'
        );
        ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class('gs-preview-body'); ?>>
    <div class="wp-site-blocks">
        <main class="gs-preview entry-content wp-block-post-content is-layout-flow">
            <?php echo $sections; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered block markup ?>
        </main>
    </div>
    <?php wp_footer(); ?>
</body>
</html>
        <?php
        exit;
    }

    private function renderSample($type, $markup)
    {
        $html      = '';
        $schema    = Schema::block($type);
        $blockName = $schema ? $schema['name'] : 'core/' . $type;

        foreach (parse_blocks($markup) as $block) {
            if (empty($block['blockName'])) {
                continue;
            }

            $processor = new WP_HTML_Tag_Processor(render_block($block));

            // Only the sample's own block type is styled; the paragraphs between samples stay plain.
            if ($block['blockName'] === $blockName && $processor->next_tag()) {
                $processor->add_class('gs');
                $processor->add_class('gs-' . $type);
            }

            $html .= $processor->get_updated_html();
        }

        return $html;
    }

    /**
     * A placeholder picture that needs no media library: an inline SVG gradient.
     */
    private static function sampleImage()
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset=".6" stop-color="#c4b5fd"/><stop offset="1" stop-color="#fbcfe8"/></linearGradient></defs><rect width="1200" height="750" fill="url(#g)"/><circle cx="900" cy="200" r="90" fill="#fff" fill-opacity=".8"/><path d="M0 600 L300 380 L520 520 L760 300 L1200 560 L1200 750 L0 750 Z" fill="#1e293b" fill-opacity=".35"/></svg>';

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Sample content per block type, in core's saved block markup.
     *
     * @return array<string, string>
     */
    private static function samples()
    {
        $samples = [
            'table' => '<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Plan</th><th>Storage</th><th>Support</th><th>Price</th></tr></thead><tbody><tr><td>Starter</td><td>10 GB</td><td>Email</td><td>$5 / month</td></tr><tr><td>Growth</td><td>100 GB</td><td>Email &amp; chat</td><td>$15 / month</td></tr><tr><td>Business</td><td>1 TB</td><td>Priority</td><td>$40 / month</td></tr><tr><td>Enterprise</td><td>Unlimited</td><td>Dedicated manager</td><td>Contact us</td></tr></tbody><tfoot><tr><td>All plans</td><td>SSL included</td><td>24/7 status page</td><td>Save 20% yearly</td></tr></tfoot></table><figcaption class="wp-element-caption">Plan comparison (sample data)</figcaption></figure>
<!-- /wp:table -->',
            'heading' => '<!-- wp:heading -->
<h2 class="wp-block-heading">Why consistent headings matter</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Readers scan before they read. Headings that share one size, weight and spacing make every post feel like part of the same site.</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">A smaller section inside it</h3>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>H3 headings sit under H2 and introduce a sub-topic.</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">And a detail under that</h4>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>H4 is the smallest level most blogs use.</p>
<!-- /wp:paragraph -->',
            'button' => '<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">Get started</a></div>
<!-- /wp:button -->
<!-- wp:paragraph -->
<p>Hover over the button to see its hover style. Every button in your content follows the same design.</p>
<!-- /wp:paragraph -->
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">Read the full guide</a></div>
<!-- /wp:button -->',
            'image' => '<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="' . self::sampleImage() . '" alt="Sample landscape" width="1200" height="750"/><figcaption class="wp-element-caption">A caption under the image</figcaption></figure>
<!-- /wp:image -->',
            'list' => '<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Write with the blocks you already know</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Style every list on the site from one place<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Nested items follow along</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list --></li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Override a single post or a single list when needed</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list"><!-- wp:list-item -->
<li>Open GutenStyle and pick a block</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Choose a preset as a starting point</li>
<!-- /wp:list-item --><!-- wp:list-item -->
<li>Adjust colors and spacing, then save</li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->',
            'quote' => '<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>Gutenberg handles the content. GutenStyle handles the styling. Writers keep writing, and every post stays consistent.</p>
<!-- /wp:paragraph --><cite>Sample citation, Editor in Chief</cite></blockquote>
<!-- /wp:quote -->',
            'details' => '<!-- wp:details {"showContent":true} -->
<details class="wp-block-details" open><summary>Does GutenStyle change my existing posts?</summary><!-- wp:paragraph -->
<p>No. Your content stays exactly as written. GutenStyle only adds styling to the blocks in the places you choose.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->
<!-- wp:details -->
<details class="wp-block-details"><summary>Can one post look different?</summary><!-- wp:paragraph -->
<p>Yes. Use a post override in the editor sidebar, or customize a single block.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->
<!-- wp:details -->
<details class="wp-block-details"><summary>What happens if I deactivate the plugin?</summary><!-- wp:paragraph -->
<p>Blocks fall back to your theme\'s default design. Nothing breaks.</p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->',
        ];

        // Blocks added by add-ons bring their own sample; "{sampleImage}" stands for the sample picture.
        foreach (Schema::blocks() as $type => $block) {
            if (!isset($samples[$type]) && isset($block['sample']) && \is_string($block['sample'])) {
                $samples[$type] = str_replace('{sampleImage}', self::sampleImage(), $block['sample']);
            }
        }

        return $samples;
    }
}
