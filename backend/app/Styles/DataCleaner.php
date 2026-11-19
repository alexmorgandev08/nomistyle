<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Frontend\GlobalCssFile;

/**
 * Deletes Block Style data: for Settings › Advanced › Reset everything, and on uninstall when
 * "Delete data on uninstall" is on. Block styles saved inside post content are not touched,
 * because removing them would change the posts.
 */
final class DataCleaner
{
    /**
     * Global styles, settings, post styles, exclusions and the cached CSS file.
     */
    public static function resetStyles()
    {
        StyleSettings::reset();
        delete_post_meta_by_key(PostStyles::META_STYLES);
        delete_post_meta_by_key(PostStyles::META_DISABLED);
        GlobalCssFile::deleteAll();

        // Add-ons such as Block Style Pro delete their style data (presets, design system, history) here.
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Config::withPrefix() adds the GUTEN_STYLE_ prefix.
        do_action(Config::withPrefix('data_reset'));
    }

    /**
     * Everything Block Style stores, including its version options and the CSS folder (uninstall).
     */
    public static function deleteAll()
    {
        self::resetStyles();
        GlobalCssFile::deleteAll(true);

        foreach (['db_version', 'installed', 'version'] as $option) {
            Config::deleteOption($option);
        }
    }

    /**
     * Whether uninstall deletes data. Reads the option directly: on multisite, uninstall runs once
     * per site and StyleSettings::get() would return the first site's cached settings.
     *
     * @return bool
     */
    public static function deletesDataOnUninstall()
    {
        $stored = Config::getOption(StyleSettings::OPTION, []);
        $input  = \is_array($stored) && isset($stored['advanced']) ? $stored['advanced'] : null;

        return AdvancedOptions::sanitize($input)['deleteOnUninstall'];
    }
}
