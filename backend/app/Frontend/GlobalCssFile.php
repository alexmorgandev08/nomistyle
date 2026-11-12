<?php

namespace GutenStyle\Frontend;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Styles\AdvancedOptions;
use GutenStyle\Styles\StyleCss;

/**
 * The cached CSS file (Settings › Advanced › CSS output): all global styles in
 * uploads/guten-style/global-<hash>.css, so browsers can cache them. Post and block styles stay
 * inline because they change per page. The hash changes with the CSS, so browsers never keep an
 * old file.
 */
final class GlobalCssFile
{
    private const FOLDER = 'guten-style';

    /**
     * Option with the current file name.
     */
    private const OPTION = 'css_file';

    /**
     * Writes the file for these settings, or removes it when the cached file is off.
     *
     * @param array<string, mixed> $settings StyleSettings::get() or a just-saved copy
     *
     * @return bool whether a file is in place
     */
    public static function sync(array $settings)
    {
        self::deleteAll();

        if (empty($settings['advanced']['cssFile'])) {
            return false;
        }

        $dir = self::dir();

        if ($dir === null || !self::filesystem()) {
            return false;
        }

        global $wp_filesystem;

        $css  = self::css($settings);
        $name = 'global-' . substr(md5($css), 0, 12) . '.css';

        if (!wp_mkdir_p($dir) || !$wp_filesystem->put_contents($dir . $name, $css, FS_CHMOD_FILE)) {
            return false;
        }

        Config::updateOption(self::OPTION, $name, true);

        return true;
    }

    /**
     * The URL of the current file, or null when there is none (cached file off, or not written).
     *
     * @return string|null
     */
    public static function url()
    {
        $name = Config::getOption(self::OPTION);
        $dir  = self::dir();

        if (!\is_string($name) || $name === '' || $dir === null || !file_exists($dir . $name)) {
            return null;
        }

        $uploads = wp_upload_dir(null, false);

        return set_url_scheme(trailingslashit($uploads['baseurl']) . self::FOLDER . '/' . $name);
    }

    /**
     * Removes every GutenStyle CSS file and, on request, the folder.
     *
     * @param bool $removeFolder also remove uploads/guten-style/ (uninstall)
     */
    public static function deleteAll($removeFolder = false)
    {
        Config::deleteOption(self::OPTION);
        $dir = self::dir();

        if ($dir === null || !is_dir($dir)) {
            return;
        }

        foreach (glob($dir . 'global-*.css') ?: [] as $file) {
            wp_delete_file($file);
        }

        if ($removeFolder && self::filesystem()) {
            global $wp_filesystem;
            $wp_filesystem->rmdir($dir);
        }
    }

    /**
     * Every global style, with the same selectors the front end uses.
     *
     * @param array<string, mixed> $settings StyleSettings::get()
     *
     * @return string
     */
    private static function css(array $settings)
    {
        $css = '';

        foreach ($settings['styles'] as $type => $values) {
            $css .= StyleCss::generate(
                $type,
                $values,
                AdvancedOptions::scopedSelector($settings['advanced']['contentSelector'], '.gs.gs-' . $type)
            );
        }

        return $css;
    }

    /**
     * The folder for CSS files, with a trailing slash, or null when uploads are not available.
     *
     * @return string|null
     */
    private static function dir()
    {
        $uploads = wp_upload_dir(null, false);

        if (!empty($uploads['error'])) {
            return null;
        }

        return trailingslashit($uploads['basedir']) . self::FOLDER . '/';
    }

    /**
     * Prepares the WordPress filesystem API. False when WordPress would need FTP credentials.
     *
     * @return bool
     */
    private static function filesystem()
    {
        if (!\function_exists('WP_Filesystem')) {
            include_once ABSPATH . 'wp-admin/includes/file.php';
        }

        return WP_Filesystem() === true;
    }
}
