<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;

/**
 * Front-end CSS for one style level of a block type, with the site's settings applied: Force Style,
 * breakpoints, and only the device values that are allowed (Schema::deviceKeys()).
 * Used by the inline styles (StyleRenderer) and the cached file (GlobalCssFile).
 */
final class StyleCss
{
    /**
     * CSS for one style level.
     *
     * @param string                $type     block type, e.g. "table"
     * @param array<string, string> $values   style values of one level
     * @param string                $selector root selector, e.g. ".gs.gs-table.gs-p-12"
     * @param bool                  $force    mark the CSS !important even when Force Style is off (one forced block)
     *
     * @return string
     */
    public static function generate($type, array $values, $selector, $force = false)
    {
        return CssGenerator::generate(
            $type,
            DeviceValues::filter($values, Schema::deviceKeys($type)),
            $selector,
            $force || self::isForced($type),
            Scope::mediaQueries()
        );
    }

    /**
     * Whether a block type's CSS is marked !important (Settings › Force Style). GutenStyle forces every
     * block type when the switch is on; add-ons can narrow it with the GUTEN_STYLE_force_style filter.
     *
     * @param string $type block type, e.g. "table"
     *
     * @return bool
     */
    public static function isForced($type)
    {
        $settings = StyleSettings::get();

        return (bool) apply_filters(Config::withPrefix('force_style'), !empty($settings['forceStyle']), $type, $settings);
    }
}
