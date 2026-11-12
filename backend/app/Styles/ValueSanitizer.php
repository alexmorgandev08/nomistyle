<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Validates style values against the schema. Anything that is not a known key
 * with a value of the expected shape is dropped, so stored values can be
 * printed into CSS without escaping concerns.
 */
final class ValueSanitizer
{
    public const DEVICES = ['tablet', 'mobile'];

    public const HOVER = 'hover';

    private const COLOR_PATTERN = '/^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\([0-9.,%\s\/]+\)|transparent|currentColor|var\(--wp--preset--color--[a-z0-9-]+\)|var\(--gs-c-[a-z0-9-]+\))$/';

    private const LENGTH_PATTERN = '/^(-?(\d+(\.\d+)?|\.\d+))(px|em|rem|%|vw|vh)?$/';

    private const NUMBER_PATTERN = '/^(\d+(\.\d+)?|\.\d+)$/';

    /**
     * @param string $type   block schema key, e.g. "table"
     * @param mixed  $values raw values, e.g. from a request or block attribute
     *
     * @return array<string, string>
     */
    public static function sanitize($type, $values)
    {
        if (!\is_array($values)) {
            return [];
        }

        $controls = Schema::controls($type);
        $clean    = [];

        foreach ($values as $key => $value) {
            if (!\is_string($key) || (!\is_string($value) && !is_numeric($value))) {
                continue;
            }

            $parts      = explode('@', $key, 2);
            $controlKey = $parts[0];
            $device     = isset($parts[1]) ? $parts[1] : null;

            if (!isset($controls[$controlKey])) {
                continue;
            }

            $control = $controls[$controlKey];

            if ($device !== null && !self::supportsVariant($control, $device)) {
                continue;
            }

            // Some settings only make sense per screen size (e.g. "stack table rows on mobile").
            if ($device === null && !empty($control['mediaOnly'])) {
                continue;
            }

            $value = self::sanitizeValue($control, trim((string) $value));

            if ($value !== null) {
                $clean[$key] = $value;
            }
        }

        return $clean;
    }

    /**
     * Whether a control accepts a value variant: "tablet" / "mobile" for responsive controls,
     * "hover" for colors and controls marked `"hover": true` in the schema.
     */
    public static function supportsVariant(array $control, $variant)
    {
        if ($variant === self::HOVER) {
            return $control['type'] === 'color' || !empty($control['hover']);
        }

        return !empty($control['responsive']) && \in_array($variant, self::DEVICES, true);
    }

    /**
     * @param mixed $styles map of block type => values
     *
     * @return array<string, array<string, string>>
     */
    public static function sanitizeStyleMap($styles)
    {
        if (!\is_array($styles)) {
            return [];
        }

        $clean = [];

        foreach (array_keys(Schema::blocks()) as $type) {
            if (!isset($styles[$type])) {
                continue;
            }

            $values = self::sanitize($type, $styles[$type]);

            if (!empty($values)) {
                $clean[$type] = $values;
            }
        }

        return $clean;
    }

    private static function sanitizeValue(array $control, $value)
    {
        if ($value === '') {
            return null;
        }

        switch ($control['type']) {
            case 'color':
                return preg_match(self::COLOR_PATTERN, $value) ? $value : null;

            case 'unit':
                return self::sanitizeLength($control, $value);

            case 'number':
                if (!preg_match(self::NUMBER_PATTERN, $value)) {
                    return null;
                }

                $number = (float) $value;

                if ((isset($control['min']) && $number < $control['min']) || (isset($control['max']) && $number > $control['max'])) {
                    return null;
                }

                return $value;

            case 'select':
                foreach ($control['options'] as $option) {
                    if ($option['value'] === $value) {
                        return $value;
                    }
                }

                return null;

            default:
                return null;
        }
    }

    private static function sanitizeLength(array $control, $value)
    {
        if (!preg_match(self::LENGTH_PATTERN, $value, $matches)) {
            return null;
        }

        $unit = isset($matches[4]) ? $matches[4] : '';

        if ($unit === '') {
            // A bare number is only meaningful as zero.
            return (float) $matches[1] === 0.0 ? '0' : null;
        }

        if (isset($control['units']) && !\in_array($unit, $control['units'], true)) {
            return null;
        }

        if (isset($control['max']) && (float) $matches[1] > $control['max']) {
            return null;
        }

        return $value;
    }
}
