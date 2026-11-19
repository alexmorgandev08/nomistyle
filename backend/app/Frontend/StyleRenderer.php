<?php

namespace GutenStyle\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Deps\BitApps\WPKit\Hooks\Hooks;
use GutenStyle\Styles\AdvancedOptions;
use GutenStyle\Styles\PostStyles;
use GutenStyle\Styles\Schema;
use GutenStyle\Styles\Scope;
use GutenStyle\Styles\StyleCss;
use GutenStyle\Styles\StyleSettings;
use GutenStyle\Styles\ValueSanitizer;
use WP_HTML_Tag_Processor;

/**
 * Applies the three style levels on the front end.
 *
 * Supported blocks rendered inside an in-scope post's content get classes:
 *   gs gs-{type}        global style    (.gs.gs-table)
 *   gs-p-{postId}       post override   (.gs.gs-table.gs-p-12)
 *   gs-b-{hash}         block override  (.gs.gs-table.gs-b-1a2b3c4d5e)
 * Each level's CSS is printed after the previous one, so later levels win.
 * Classes are added at render time only; saved post content is never changed.
 *
 * Settings › Advanced: global styles can come from a cached file (GlobalCssFile), load on every page
 * instead of only where their blocks are used, and every rule can start with a content selector.
 */
final class StyleRenderer
{
    private const HANDLE = 'blockstyle';

    private const LATE_HANDLE = 'blockstyle-late';

    private const FILE_HANDLE = 'blockstyle-global';

    /** @var int[] post IDs whose the_content is currently being rendered */
    private $_contentStack = [];

    private $_printed = [];

    /**
     * URL of the cached global CSS file, false when not used, null until checked.
     *
     * @var string|false|null
     */
    private $_fileUrl;

    public function __construct()
    {
        Hooks::addFilter('the_content', [$this, 'enterContent'], 8);
        Hooks::addFilter('the_content', [$this, 'leaveContent'], 12);
        Hooks::addFilter('render_block', [$this, 'renderBlock'], 10, 2);
        Hooks::addAction('wp_enqueue_scripts', [$this, 'preparePrimaryPost'], 20);
        Hooks::addAction('wp_enqueue_scripts', [$this, 'loadAllGlobalStyles'], 21);
    }

    /**
     * With "Load CSS only for blocks used on the page" off, every global style loads on every page.
     */
    public function loadAllGlobalStyles()
    {
        $settings = StyleSettings::get();

        if ($settings['advanced']['onlyUsedBlocks']) {
            return;
        }

        foreach ($settings['styles'] as $type => $values) {
            $this->printGlobal($type, $values);
        }
    }

    public function enterContent($content)
    {
        $this->_contentStack[] = (int) get_the_ID();

        return $content;
    }

    public function leaveContent($content)
    {
        array_pop($this->_contentStack);

        return $content;
    }

    /**
     * Classic themes render content after the <head> is printed, so the main
     * post's CSS is generated up front to avoid a flash of unstyled content.
     */
    public function preparePrimaryPost()
    {
        if (!is_singular()) {
            return;
        }

        $post = get_queried_object();

        if (!$post instanceof \WP_Post || !Scope::isPostInScope($post->ID) || !has_blocks($post->post_content)) {
            return;
        }

        $this->walkBlocks(parse_blocks($post->post_content), $post->ID);
    }

    public function renderBlock($blockContent, $block)
    {
        if (empty($block['blockName']) || $blockContent === '' || empty($this->_contentStack)) {
            return $blockContent;
        }

        $postId = end($this->_contentStack);
        $map    = Schema::blockNameMap();

        if (!$postId || !isset($map[$block['blockName']]) || !Scope::isPostInScope($postId)) {
            return $blockContent;
        }

        $classes = $this->classesFor($map[$block['blockName']], $block, $postId);

        $processor = new WP_HTML_Tag_Processor($blockContent);

        if (!$processor->next_tag()) {
            return $blockContent;
        }

        foreach ($classes as $class) {
            $processor->add_class($class);
        }

        return $processor->get_updated_html();
    }

    private function walkBlocks(array $blocks, $postId)
    {
        $map = Schema::blockNameMap();

        foreach ($blocks as $block) {
            if (!empty($block['blockName']) && isset($map[$block['blockName']])) {
                $this->classesFor($map[$block['blockName']], $block, $postId);
            }

            if (!empty($block['innerBlocks'])) {
                $this->walkBlocks($block['innerBlocks'], $postId);
            }
        }
    }

    /**
     * Returns the classes for a block and makes sure the CSS they need is printed.
     */
    private function classesFor($type, array $block, $postId)
    {
        $settings = StyleSettings::get();
        $base     = AdvancedOptions::scopedSelector($settings['advanced']['contentSelector'], '.gs.gs-' . $type);
        $classes  = ['gs', 'gs-' . $type];

        if (!empty($settings['styles'][$type])) {
            $this->printGlobal($type, $settings['styles'][$type]);
        }

        $postStyles = PostStyles::get($postId);

        if (!empty($postStyles[$type])) {
            $classes[] = 'gs-p-' . $postId;
            $this->printOnce('p-' . $postId . '-' . $type, $type, $postStyles[$type], $base . '.gs-p-' . $postId);
        }

        $blockValues = isset($block['attrs']['gutenStyle']['values'])
            ? ValueSanitizer::sanitize($type, $block['attrs']['gutenStyle']['values'])
            : [];

        if (!empty($blockValues)) {
            // A forced block (Block Style Pro's Style Inspector) gets !important CSS for its own values.
            $force = !empty($block['attrs']['gutenStyle']['force']);

            ksort($blockValues);
            $hash      = substr(md5($type . wp_json_encode($blockValues) . ($force ? '!' : '')), 0, 10);
            $classes[] = 'gs-b-' . $hash;
            $this->printOnce('b-' . $hash, $type, $blockValues, $base . '.gs-b-' . $hash, $force);
        }

        return $classes;
    }

    /**
     * A block type's global style: from the cached file when it is in use, else inline.
     *
     * @param string               $type   block type, e.g. "table"
     * @param array<string, mixed> $values the global style
     */
    private function printGlobal($type, array $values)
    {
        if ($this->fileUrl()) {
            wp_enqueue_style(self::FILE_HANDLE, $this->fileUrl(), [], Config::VERSION);

            return;
        }

        $selector = AdvancedOptions::scopedSelector(StyleSettings::get()['advanced']['contentSelector'], '.gs.gs-' . $type);
        $this->printOnce('g-' . $type, $type, $values, $selector);
    }

    /**
     * The cached file's URL when Settings › Advanced uses it and it exists, else false (inline CSS).
     *
     * @return string|false
     */
    private function fileUrl()
    {
        if ($this->_fileUrl === null) {
            $this->_fileUrl = StyleSettings::get()['advanced']['cssFile'] ? (GlobalCssFile::url() ?: false) : false;
        }

        return $this->_fileUrl;
    }

    private function printOnce($id, $type, array $values, $selector, $force = false)
    {
        if (isset($this->_printed[$id])) {
            return;
        }

        $this->_printed[$id] = true;

        $css = StyleCss::generate($type, $values, $selector, $force);

        if ($css === '') {
            return;
        }

        // Once the head styles are out, anything new goes to a footer stylesheet.
        $handle = did_action('wp_print_styles') ? self::LATE_HANDLE : self::HANDLE;

        if (!wp_style_is($handle, 'registered')) {
            // Post and block styles must come after the global file, so they win.
            wp_register_style($handle, false, $this->fileUrl() ? [self::FILE_HANDLE] : [], Config::VERSION);
        }

        wp_enqueue_style($handle);
        wp_add_inline_style($handle, $css);
    }
}
