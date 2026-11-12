<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Post-level overrides and the per-post on/off switch, stored as post meta and
 * exposed to the block editor through the REST API.
 */
final class PostStyles
{
    public const META_STYLES = '_guten_style';

    public const META_DISABLED = '_guten_style_disabled';

    public static function register()
    {
        $auth = function ($allowed, $metaKey, $postId) {
            return current_user_can('edit_post', $postId);
        };

        register_post_meta(
            '',
            self::META_STYLES,
            [
                'type'              => 'string',
                'single'            => true,
                'default'           => '',
                'show_in_rest'      => true,
                'sanitize_callback' => [self::class, 'sanitizeMeta'],
                'auth_callback'     => $auth,
                // Saved with each revision and restored with it (Tools › Overrides saves one first).
                'revisions_enabled' => true,
            ]
        );

        register_post_meta(
            '',
            self::META_DISABLED,
            [
                'type'          => 'boolean',
                'single'        => true,
                'default'       => false,
                'show_in_rest'  => true,
                'auth_callback' => $auth,
            ]
        );

        // Runs late so custom post types registered on init are available.
        add_action('init', [self::class, 'addCustomFieldsSupport'], 99);
    }

    /**
     * The editor can only read and write meta for post types that support custom fields.
     */
    public static function addCustomFieldsSupport()
    {
        foreach (StyleSettings::get()['postTypes'] as $postType) {
            if (post_type_exists($postType) && !post_type_supports($postType, 'custom-fields')) {
                add_post_type_support($postType, 'custom-fields');
            }
        }
    }

    /**
     * Meta is a JSON string: {"table": {"headerBackground": "#000"}, ...}.
     */
    public static function sanitizeMeta($value)
    {
        $decoded = \is_string($value) ? json_decode($value, true) : $value;
        $styles  = ValueSanitizer::sanitizeStyleMap($decoded);

        return empty($styles) ? '' : wp_json_encode($styles);
    }

    /**
     * @return array<string, array<string, string>>
     */
    public static function get($postId)
    {
        $raw = get_post_meta($postId, self::META_STYLES, true);

        if (!\is_string($raw) || $raw === '') {
            return [];
        }

        return ValueSanitizer::sanitizeStyleMap(json_decode($raw, true));
    }

    public static function isDisabled($postId)
    {
        return (bool) get_post_meta($postId, self::META_DISABLED, true);
    }

    public static function setDisabled($postId, $disabled)
    {
        if ($disabled) {
            return (bool) update_post_meta($postId, self::META_DISABLED, true);
        }

        return delete_post_meta($postId, self::META_DISABLED);
    }
}
