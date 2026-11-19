<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\HTTP\Controllers\StylesController;
use GutenStyle\Styles\Scope;
use GutenStyle\Styles\StyleSettings;

/**
 * Enqueues the built admin/editor bundles (assets/{name}.js|css, built by `pnpm build`).
 * Both bundles use the React WordPress already loads. The editor bundle also uses the @wordpress
 * packages; the admin bundle bundles antd, so it needs only the @wordpress packages without components.
 */
final class Assets
{
    private const DEPENDENCIES = [
        'admin'  => ['react', 'react-dom', 'react-jsx-runtime', 'wp-api-fetch', 'wp-i18n', 'wp-dom-ready'],
        'editor' => [
            'react',
            'react-dom',
            'react-jsx-runtime',
            'wp-block-editor',
            'wp-blocks',
            'wp-components',
            'wp-compose',
            'wp-core-data',
            'wp-data',
            'wp-editor',
            'wp-element',
            'wp-hooks',
            'wp-i18n',
            'wp-plugins',
        ],
    ];

    private const STYLE_DEPENDENCIES = [
        'admin'  => [],
        'editor' => ['wp-components'],
    ];

    public static function enqueue($name, $globalName, array $data)
    {
        $handle      = Config::SLUG . '-' . $name;
        [$dir, $url] = self::location($name);

        if (!file_exists($dir . $name . '.js')) {
            return false;
        }

        wp_enqueue_script($handle, $url . $name . '.js', self::DEPENDENCIES[$name], (string) filemtime($dir . $name . '.js'), true);
        wp_add_inline_script($handle, 'window.' . $globalName . ' = ' . wp_json_encode($data) . ';', 'before');
        wp_set_script_translations($handle, 'guten-style');

        if (file_exists($dir . $name . '.css')) {
            wp_enqueue_style($handle, $url . $name . '.css', self::STYLE_DEPENDENCIES[$name], (string) filemtime($dir . $name . '.css'));
        }

        return true;
    }

    /**
     * Where a bundle is loaded from: GutenStyle's own build, or an add-on's build of the same app
     * (GUTEN_STYLE_assets_location filter; GutenStyle Pro builds the app with its features).
     *
     * @param string $name admin or editor
     *
     * @return array{0: string, 1: string} directory and URL, both with a trailing slash
     */
    private static function location($name)
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Config::withPrefix() adds the GUTEN_STYLE_ prefix.
        $location = apply_filters(Config::withPrefix('assets_location'), null, $name);

        if (\is_array($location) && isset($location[0], $location[1]) && file_exists($location[0] . $name . '.js')) {
            return [(string) $location[0], (string) $location[1]];
        }

        return [
            Config::get('ROOT_DIR') . Config::ASSETS_FOLDER . DIRECTORY_SEPARATOR,
            Config::get('ROOT_URI') . '/' . Config::ASSETS_FOLDER . '/',
        ];
    }

    /**
     * Data every GutenStyle screen needs.
     */
    public static function sharedData()
    {
        $settings = StyleSettings::get();

        return [
            'config'        => $settings,
            'mediaQueries'  => Scope::mediaQueries(),
            'settingsUrl'   => admin_url('admin.php?page=' . Config::SLUG . '#/settings'),
            'restNamespace' => StylesController::restNamespace(),
            'palette'       => self::themePalette(),
            'brandColors'   => self::brandColors(),
            'upgradeUrl'    => Config::UPGRADE_URL,
        ];
    }

    /**
     * Extra data for the admin screen's Settings.
     */
    public static function adminSettingsData()
    {
        return [
            'roles'             => StyleSettings::availableRoles(),
            'themeJson'         => wp_theme_has_theme_json(),
            'themeMediaQueries' => Scope::themeMediaQueries(),
        ];
    }

    /**
     * Colors that add-ons such as GutenStyle Pro's design system put first in every color picker
     * (GUTEN_STYLE_brand_colors filter). Each color is a hex value or a var(--gs-c-*) variable.
     *
     * @return array<int, array{name: string, color: string}>
     */
    private static function brandColors()
    {
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Config::withPrefix() adds the GUTEN_STYLE_ prefix.
        $colors = apply_filters(Config::withPrefix('brand_colors'), []);
        $clean  = [];

        foreach (\is_array($colors) ? $colors : [] as $entry) {
            if (isset($entry['name'], $entry['color']) && \is_string($entry['name']) && \is_string($entry['color'])) {
                $clean[] = ['name' => sanitize_text_field($entry['name']), 'color' => sanitize_text_field($entry['color'])];
            }
        }

        return $clean;
    }

    /**
     * Theme colors to show next to custom colors in color pickers.
     *
     * @return array<int, array{name: string, color: string}>
     */
    private static function themePalette()
    {
        if (!\function_exists('wp_get_global_settings')) {
            return [];
        }

        $palette = wp_get_global_settings(['color', 'palette', 'theme']);

        if (!\is_array($palette)) {
            return [];
        }

        $colors = [];

        foreach ($palette as $entry) {
            if (isset($entry['color'], $entry['name'])) {
                $colors[] = ['name' => $entry['name'], 'color' => $entry['color']];
            }
        }

        return $colors;
    }
}
