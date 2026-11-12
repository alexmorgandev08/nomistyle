<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;

/**
 * Decides whether GutenStyle applies to a post: its post type must be enabled
 * in settings, the post must not be excluded, and it must match add-on conditions.
 */
final class Scope
{
    private static $_cache = [];

    public static function isPostTypeEnabled($postType)
    {
        return \in_array($postType, StyleSettings::get()['postTypes'], true);
    }

    public static function isPostInScope($postId)
    {
        $postId = (int) $postId;

        if (!isset(self::$_cache[$postId])) {
            $postType = $postId ? get_post_type($postId) : false;

            self::$_cache[$postId] = $postType
                && self::isPostTypeEnabled($postType)
                && !PostStyles::isDisabled($postId)
                && self::matchesConditions($postId);
        }

        return self::$_cache[$postId];
    }

    /**
     * Whether a post matches the conditions of add-ons, such as GutenStyle Pro's categories, tags and
     * authors (GUTEN_STYLE_post_matches_conditions filter). True when no add-on adds conditions.
     *
     * @param int $postId post ID
     *
     * @return bool
     */
    public static function matchesConditions($postId)
    {
        return (bool) apply_filters(Config::withPrefix('post_matches_conditions'), true, (int) $postId);
    }

    /**
     * Media queries for tablet and mobile values: the custom breakpoints from Settings › Responsive,
     * or the theme's.
     *
     * @return array<string, string>
     */
    public static function mediaQueries()
    {
        $breakpoints = StyleSettings::get()['breakpoints'];

        return $breakpoints ? Breakpoints::mediaQueries($breakpoints) : self::themeMediaQueries();
    }

    /**
     * The breakpoints of WordPress core's responsive styles, and the theme's settings.viewport when set.
     *
     * @return array<string, string>
     */
    public static function themeMediaQueries()
    {
        if (class_exists('WP_Theme_JSON') && method_exists('WP_Theme_JSON', 'get_viewport_media_queries')) {
            $viewport = \function_exists('wp_get_global_settings') ? wp_get_global_settings(['viewport']) : null;
            $queries  = \WP_Theme_JSON::get_viewport_media_queries($viewport);

            return array_filter(
                [
                    'tablet' => isset($queries['@tablet']) ? $queries['@tablet'] : '',
                    'mobile' => isset($queries['@mobile']) ? $queries['@mobile'] : '',
                ]
            );
        }

        return [
            'tablet' => '@media (480px < width <= 782px)',
            'mobile' => '@media (width <= 480px)',
        ];
    }
}
