<?php
/**
 * Measures what GutenStyle costs on the front end of one post.
 *
 * Usage (from the plugin folder; WP-CLI finds the WordPress root itself):
 *   pnpm perf <post_id> [iterations]
 * Compare an in-scope post with an excluded copy of it to see GutenStyle's share.
 *
 * Reports: extra PHP time per page, one-time CSS generation time, CSS bytes added,
 * extra database queries, memory, autoloaded option size and shipped asset sizes.
 * Dev tool only: `pnpm zip` does not ship scripts/.
 */

use GutenStyle\Config;
use GutenStyle\Frontend\StyleRenderer;
use GutenStyle\Styles\CssGenerator;
use GutenStyle\Styles\PostStyles;
use GutenStyle\Styles\Schema;
use GutenStyle\Styles\Scope;
use GutenStyle\Styles\StyleSettings;
use GutenStyle\Styles\ValueSanitizer;

if (!\defined('ABSPATH')) {
    exit;
}

$postId     = isset($args[0]) ? (int) $args[0] : 0;
$iterations = isset($args[1]) ? max(1, (int) $args[1]) : 200;
$post       = $postId ? get_post($postId) : null;

if (!$post) {
    WP_CLI::error('Pass a post ID: wp eval-file .../scripts/perf.php <post_id> [iterations]');
}

$GLOBALS['post'] = $post;
setup_postdata($post);

$ms    = static fn ($seconds) => round($seconds * 1000, 3);
$bytes = static fn ($size) => $size >= 1024 ? round($size / 1024, 2) . ' KB' : $size . ' B';

/** Removes GutenStyle's front-end hooks and returns a function that restores them. */
$detachGutenStyle = static function () {
    global $wp_filter;
    $removed = [];

    foreach (['the_content', 'render_block'] as $hook) {
        if (empty($wp_filter[$hook])) {
            continue;
        }

        foreach ($wp_filter[$hook]->callbacks as $priority => $callbacks) {
            foreach ($callbacks as $callback) {
                if (\is_array($callback['function']) && $callback['function'][0] instanceof StyleRenderer) {
                    remove_filter($hook, $callback['function'], $priority);
                    $removed[] = [$hook, $callback['function'], $priority, $callback['accepted_args']];
                }
            }
        }
    }

    return static function () use ($removed) {
        foreach ($removed as [$hook, $function, $priority, $acceptedArgs]) {
            add_filter($hook, $function, $priority, $acceptedArgs);
        }
    };
};

$renderContent = static fn () => apply_filters('the_content', $post->post_content);

// 1. GutenStyle's own one-time work per request: load the schema, read settings, scope and post meta.
//    The post meta cache is cleared first, so the query count is the worst case.
global $wpdb;
wp_cache_delete($post->ID, 'post_meta');
$queriesBefore = $wpdb->num_queries;
$memoryBefore  = memory_get_usage();
$start         = microtime(true);
$schemaCopy    = json_decode(file_get_contents(Schema::path()), true);
$inScope       = Scope::isPostInScope($post->ID);
PostStyles::get($post->ID);
StyleSettings::get();
$setupTime     = microtime(true) - $start;
$setupMemory   = memory_get_usage() - $memoryBefore;
$setupQueries  = $wpdb->num_queries - $queriesBefore;
unset($schemaCopy);

// 2. Content render with vs without GutenStyle. Runs alternate and the median is used, so drift and noise cancel out.
//    The first render warms caches and is kept to measure how much the added classes grow the HTML.
$firstHtml = $renderContent();
$median    = static function (array $samples) {
    sort($samples);

    return $samples[(int) floor(\count($samples) / 2)];
};
$timed = static function (callable $render) {
    $start = microtime(true);
    $render();

    return microtime(true) - $start;
};

$with    = [];
$without = [];
for ($i = 0; $i < $iterations; ++$i) {
    $with[]    = $timed($renderContent);
    $restore   = $detachGutenStyle();
    $without[] = $timed($renderContent);
    $restore();
}
$withGutenStyle    = $median($with);
$withoutGutenStyle = $median($without);
$restore           = $detachGutenStyle();
$plainHtml         = $renderContent();
$restore();

// 3. CSS generation on its own: every level this post needs, from scratch.
$supported = Schema::blockNameMap();
$blocks    = [];
$walk      = static function ($list) use (&$walk, &$blocks, $supported) {
    foreach ($list as $block) {
        if (!empty($block['blockName']) && isset($supported[$block['blockName']])) {
            $blocks[] = $block;
        }
        if (!empty($block['innerBlocks'])) {
            $walk($block['innerBlocks']);
        }
    }
};
$walk(parse_blocks($post->post_content));

$css     = '';
$cssTime = 0;

// Out-of-scope posts get no CSS at all.
if ($inScope) {
    $settings = StyleSettings::get();
    $queries  = Scope::mediaQueries();
    $start    = microtime(true);

    foreach ($settings['styles'] as $type => $values) {
        $css .= CssGenerator::generate($type, $values, '.gs.gs-' . $type, $settings['forceStyle'], $queries);
    }
    foreach (PostStyles::get($post->ID) as $type => $values) {
        $css .= CssGenerator::generate($type, $values, '.gs.gs-' . $type . '.gs-p-' . $post->ID, $settings['forceStyle'], $queries);
    }
    foreach ($blocks as $block) {
        $type   = $supported[$block['blockName']];
        $values = isset($block['attrs']['gutenStyle']['values']) ? ValueSanitizer::sanitize($type, $block['attrs']['gutenStyle']['values']) : [];
        if ($values) {
            $css .= CssGenerator::generate($type, $values, '.gs.gs-' . $type . '.gs-b-x', $settings['forceStyle'], $queries);
        }
    }

    $cssTime = microtime(true) - $start;
}

// 4. Static costs.
$option     = get_option(Config::withPrefix(StyleSettings::OPTION));
$assetsDir  = \dirname(__DIR__) . '/assets/';
$assetSize  = static function ($file) use ($assetsDir, $bytes) {
    $path = $assetsDir . $file;
    if (!file_exists($path)) {
        return 'missing';
    }
    $raw = file_get_contents($path);

    return $bytes(\strlen($raw)) . ' (' . $bytes(\strlen(gzencode($raw, 9))) . ' gzip)';
};

$extra = $withGutenStyle - $withoutGutenStyle;
$rows  = [
    ['Post', "#{$post->ID} " . get_the_title($post) . ' (' . ($inScope ? 'GutenStyle on' : 'GutenStyle off') . ')'],
    ['Supported blocks in post', \count($blocks)],
    ['--- PHP, per page view ---', ''],
    ['Setup (schema, settings, meta)', $ms($setupTime) . ' ms, ' . $bytes(max(0, $setupMemory)) . ' memory, ' . $setupQueries . ' queries (worst case)'],
    ['CSS generation, all levels', $ms($cssTime) . ' ms'],
    ['Content render without GutenStyle', $ms($withoutGutenStyle) . ' ms (median of ' . $iterations . ')'],
    ['Content render with GutenStyle', $ms($withGutenStyle) . ' ms'],
    ['Extra render time', abs($extra) < 0.0002 ? 'under 0.2 ms (within noise)' : $ms($extra) . ' ms'],
    ['--- Sent to the browser ---', ''],
    ['CSS added to the page', $bytes(\strlen($css)) . ' (' . $bytes(\strlen(gzencode($css, 9))) . ' gzip), inline, 0 extra requests'],
    ['HTML growth (classes on blocks)', $bytes(\strlen($firstHtml) - \strlen($plainHtml))],
    ['Front-end JavaScript', '0 B (no scripts, no jQuery)'],
    ['--- Every request ---', ''],
    ['Autoloaded option ' . Config::withPrefix(StyleSettings::OPTION), $bytes(\strlen(maybe_serialize($option)))],
    ['--- Admin / editor only ---', ''],
    ['schema/blocks.json (inside both bundles)', $bytes(filesize(Schema::path()))],
    ['assets/editor.js', $assetSize('editor.js')],
    ['assets/editor.css', $assetSize('editor.css')],
    ['assets/admin.js', $assetSize('admin.js')],
    ['assets/admin.css', $assetSize('admin.css')],
];

foreach ($rows as [$label, $value]) {
    WP_CLI::line(str_pad($label, 40) . $value);
}
