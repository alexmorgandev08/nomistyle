<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;

/**
 * Site-wide GutenStyle configuration: global block styles, where they apply, Force Style,
 * breakpoints, block editor options and theme colors. Stored as one autoloaded option.
 */
final class StyleSettings
{
    public const OPTION = 'config';

    private static $_cache;

    public static function defaults()
    {
        return [
            'styles'      => [],
            'postTypes'   => ['post'],
            'forceStyle'  => false,
            'breakpoints' => null,
            'editor'      => EditorOptions::defaults(self::defaultEditorRoles()),
            'themeColors' => true,
            'advanced'    => AdvancedOptions::defaults(),
            'pro'         => [],
        ];
    }

    public static function get()
    {
        if (self::$_cache === null) {
            $stored       = Config::getOption(self::OPTION, []);
            $stored       = \is_array($stored) ? $stored : [];
            self::$_cache = self::normalize($stored, isset($stored['pro']) ? $stored['pro'] : []);
        }

        return self::$_cache;
    }

    /**
     * Deletes the saved configuration; get() returns the defaults again.
     */
    public static function reset()
    {
        Config::deleteOption(self::OPTION);
        self::$_cache = null;
    }

    public static function save(array $input)
    {
        $previous = self::get();
        $settings = self::normalize($input, $previous['pro']);
        $stored   = $settings;

        $stored['styles'] += self::inactiveStyles();

        Config::updateOption(self::OPTION, $stored, true);
        self::$_cache = $settings;

        /*
         * After every save, with the new and the previous settings. GutenStyle Pro's Style history
         * records the changes to global styles here.
         */
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Config::withPrefix() adds the GUTEN_STYLE_ prefix.
        do_action(Config::withPrefix('settings_saved'), $settings, $previous);

        return $settings;
    }

    /**
     * Saved styles of blocks that no active plugin adds (for example GutenStyle Pro is off). save()
     * keeps them, so turning the add-on off and saving does not lose them. They were cleaned when
     * they were saved.
     *
     * @return array<string, array<string, string>>
     */
    private static function inactiveStyles()
    {
        $stored = Config::getOption(self::OPTION, []);
        $styles = \is_array($stored) && isset($stored['styles']) && \is_array($stored['styles']) ? $stored['styles'] : [];

        return array_diff_key($styles, Schema::blocks());
    }

    /**
     * Post types GutenStyle can be applied to: public and editable in the block editor.
     *
     * @return array<int, array{name: string, label: string}>
     */
    public static function availablePostTypes()
    {
        $types = [];

        foreach (get_post_types(['public' => true, 'show_in_rest' => true], 'objects') as $postType) {
            if ($postType->name === 'attachment' || !use_block_editor_for_post_type($postType->name)) {
                continue;
            }

            $types[] = ['name' => $postType->name, 'label' => $postType->labels->name];
        }

        return $types;
    }

    /**
     * Valid settings from saved or submitted input.
     *
     * @param array<string, mixed> $input     saved or submitted settings
     * @param mixed                $storedPro the "pro" settings saved before, kept when no add-on cleans them
     *
     * @return array<string, mixed>
     */
    private static function normalize(array $input, $storedPro)
    {
        $defaults = self::defaults();

        $postTypes = isset($input['postTypes']) && \is_array($input['postTypes'])
            ? array_values(array_unique(array_filter(array_map('sanitize_key', $input['postTypes']))))
            : $defaults['postTypes'];

        return [
            'styles'      => ValueSanitizer::sanitizeStyleMap(isset($input['styles']) ? $input['styles'] : []),
            'postTypes'   => $postTypes,
            'forceStyle'  => !empty($input['forceStyle']),
            'breakpoints' => Breakpoints::sanitize(isset($input['breakpoints']) ? $input['breakpoints'] : null),
            'editor'      => EditorOptions::sanitize(
                isset($input['editor']) ? $input['editor'] : null,
                array_keys(wp_roles()->roles),
                self::defaultEditorRoles()
            ),
            'themeColors' => \array_key_exists('themeColors', $input) ? (bool) $input['themeColors'] : $defaults['themeColors'],
            'advanced'    => AdvancedOptions::sanitize(isset($input['advanced']) ? $input['advanced'] : null),
            'pro'         => self::proSettings(isset($input['pro']) ? $input['pro'] : null, $storedPro),
        ];
    }

    /**
     * Settings of add-ons such as GutenStyle Pro. The add-on cleans them with the
     * GUTEN_STYLE_pro_settings filter. Without it (add-on off), the saved settings are kept as they
     * are, so turning the add-on off and saving does not lose them; submitted ones are ignored.
     *
     * @param mixed $input     submitted "pro" settings
     * @param mixed $storedPro saved "pro" settings
     *
     * @return array<string, mixed>
     */
    private static function proSettings($input, $storedPro)
    {
        $hook = Config::withPrefix('pro_settings');

        if (!has_filter($hook)) {
            return \is_array($storedPro) ? $storedPro : [];
        }

        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- $hook is Config::withPrefix('pro_settings').
        $settings = apply_filters($hook, [], $input);

        return \is_array($settings) ? $settings : [];
    }

    /**
     * Roles for the "Roles that can edit styles" setting.
     *
     * @return array<int, array{name: string, label: string}>
     */
    public static function availableRoles()
    {
        $roles = [];

        foreach (wp_roles()->get_names() as $name => $label) {
            $roles[] = ['name' => $name, 'label' => translate_user_role($label)];
        }

        return $roles;
    }

    /**
     * By default, every role that can write posts can also style them.
     *
     * @return string[]
     */
    private static function defaultEditorRoles()
    {
        $roles = [];

        foreach (wp_roles()->roles as $name => $role) {
            if (!empty($role['capabilities']['edit_posts'])) {
                $roles[] = $name;
            }
        }

        return $roles;
    }
}
