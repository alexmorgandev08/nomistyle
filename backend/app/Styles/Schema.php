<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;

/**
 * Reads schema/blocks.json — the single definition of every supported block,
 * its controls, CSS targets and presets. The editor bundle imports the same file.
 * Add-ons such as Block Style Pro add blocks with the GUTEN_STYLE_blocks filter.
 */
final class Schema
{
    private static $_schema;

    /**
     * Block Style's blocks and the add-ons' blocks, once plugins are loaded.
     */
    private static $_blocks;

    public static function path()
    {
        return \dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'schema' . DIRECTORY_SEPARATOR . 'blocks.json';
    }

    public static function all()
    {
        if (self::$_schema === null) {
            $json          = file_get_contents(self::path());
            $decoded       = $json ? json_decode($json, true) : null;
            self::$_schema = \is_array($decoded) && isset($decoded['blocks']) ? $decoded : ['blocks' => []];
        }

        return self::$_schema;
    }

    /**
     * Block Style's blocks, then the blocks of active add-ons (GUTEN_STYLE_blocks filter). An add-on
     * cannot replace a Block Style block. Optional block fields for add-ons: "sample" (block markup for
     * the admin preview; "{sampleImage}" stands for a sample picture), "thumb" (HTML for preset
     * thumbnails) and "readability" (contrast checks).
     *
     * @return array<string, array> block type key (e.g. "table") => block schema
     */
    public static function blocks()
    {
        if (self::$_blocks !== null) {
            return self::$_blocks;
        }

        $blocks = self::all()['blocks'];

        // Outside WordPress (unit tests, fixture script) there are no add-ons.
        if (!\function_exists('apply_filters')) {
            return $blocks;
        }

        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Config::withPrefix() adds the GUTEN_STYLE_ prefix.
        $added  = apply_filters(Config::withPrefix('blocks'), []);
        $blocks += \is_array($added) ? array_filter($added, [self::class, 'isBlock']) : [];

        // Add-ons hook in on plugins_loaded; a call before that must not hide their blocks later.
        if (did_action('plugins_loaded')) {
            self::$_blocks = $blocks;
        }

        return $blocks;
    }

    /**
     * Forgets the cached block list, so the next call applies the filter again (tests).
     */
    public static function flush()
    {
        self::$_blocks = null;
    }

    public static function block($type)
    {
        $blocks = self::blocks();

        return isset($blocks[$type]) ? $blocks[$type] : null;
    }

    /**
     * Whether an add-on block has the fields Block Style needs.
     *
     * @param mixed $block block schema
     *
     * @return bool
     */
    private static function isBlock($block)
    {
        return \is_array($block)
            && isset($block['name'], $block['label'], $block['sections'], $block['presets'])
            && \is_string($block['name'])
            && \is_array($block['sections'])
            && \is_array($block['presets']);
    }

    /**
     * Maps a block name like "core/table" to its schema key like "table".
     *
     * @return array<string, string>
     */
    public static function blockNameMap()
    {
        $map = [];

        foreach (self::blocks() as $type => $block) {
            $map[$block['name']] = $type;
        }

        return $map;
    }

    /**
     * Controls of a block type whose tablet and mobile values are output. Block Style allows the ones
     * marked "freeResponsive"; add-ons extend the list with the GUTEN_STYLE_device_controls filter.
     *
     * @param string $type block type, e.g. "table"
     *
     * @return string[]
     */
    public static function deviceKeys($type)
    {
        $block = self::block($type);

        if (!$block) {
            return [];
        }

        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Config::withPrefix() adds the GUTEN_STYLE_ prefix.
        $keys = apply_filters(Config::withPrefix('device_controls'), DeviceValues::freeKeys($block), $type, $block);

        return \is_array($keys) ? array_values(array_filter($keys, 'is_string')) : [];
    }

    /**
     * @return array<string, array> control key => control definition, in schema order
     */
    public static function controls($type)
    {
        $block = self::block($type);

        if (!$block) {
            return [];
        }

        $controls = [];

        foreach ($block['sections'] as $section) {
            foreach ($section['controls'] as $control) {
                $controls[$control['key']] = $control;
            }
        }

        return $controls;
    }
}
