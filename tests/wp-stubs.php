<?php

/**
 * The few WordPress hook functions the tested classes call, so add-on filters can be tested
 * without WordPress. Only defined when WordPress is not loaded.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

if (!function_exists('add_filter')) {
    $GLOBALS['gs_test_filters'] = [];

    function add_filter(string $hook, callable $callback): bool
    {
        $GLOBALS['gs_test_filters'][$hook][] = $callback;

        return true;
    }

    function remove_filter(string $hook, callable $callback): bool
    {
        $GLOBALS['gs_test_filters'][$hook] = array_values(
            array_filter($GLOBALS['gs_test_filters'][$hook] ?? [], static fn ($item) => $item !== $callback)
        );

        return true;
    }

    function apply_filters(string $hook, $value, ...$args)
    {
        foreach ($GLOBALS['gs_test_filters'][$hook] ?? [] as $callback) {
            $value = $callback($value, ...$args);
        }

        return $value;
    }

    function did_action(string $hook): int
    {
        return 1;
    }

    $GLOBALS['gs_test_options'] = [];

    function get_option(string $name, $default = false)
    {
        return $GLOBALS['gs_test_options'][$name] ?? $default;
    }

    function update_option(string $name, $value, $autoload = null): bool
    {
        $GLOBALS['gs_test_options'][$name] = $value;

        return true;
    }

    function delete_option(string $name): bool
    {
        unset($GLOBALS['gs_test_options'][$name]);

        return true;
    }

    function absint($value): int
    {
        return abs((int) $value);
    }

    function sanitize_text_field($value): string
    {
        return trim(preg_replace('/\s+/', ' ', strip_tags((string) $value)));
    }

    function wp_generate_uuid4(): string
    {
        return bin2hex(random_bytes(16));
    }

    function remove_accents(string $text): string
    {
        return $text;
    }

    function esc_url_raw(string $url): string
    {
        return $url;
    }

    function set_url_scheme(string $url): string
    {
        return $url;
    }

    function trailingslashit(string $value): string
    {
        return rtrim($value, '/\\') . '/';
    }

    function wp_upload_dir($time = null, bool $create = true): array
    {
        return ['basedir' => '/tmp/uploads', 'baseurl' => 'https://example.test/wp-content/uploads', 'error' => false];
    }

    function wp_parse_url(string $url, int $component = -1)
    {
        return parse_url($url, $component);
    }

    function __(string $text, string $domain = 'default'): string
    {
        return $text;
    }

    function is_wp_error($thing): bool
    {
        return $thing instanceof WP_Error;
    }

    /**
     * The parts of WP_Error the tested classes use.
     */
    class WP_Error
    {
        public function __construct(public string $code = '', public string $message = '', public $data = '')
        {
        }

        public function get_error_message(): string
        {
            return $this->message;
        }
    }
}
