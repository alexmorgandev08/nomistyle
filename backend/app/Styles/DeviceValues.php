<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Which controls use their tablet and mobile values. GutenStyle allows device values for the
 * controls marked "freeResponsive" in the schema; add-ons can allow more with the
 * GUTEN_STYLE_device_controls filter (Schema::deviceKeys()). Other device values stay saved but
 * are not output. frontend/src/shared/deviceValues.ts does the same for the admin and editor.
 */
final class DeviceValues
{
    private const DEVICES = ['tablet', 'mobile'];

    /**
     * Keys of controls whose device values GutenStyle outputs.
     *
     * @param array<string, mixed> $block block schema
     *
     * @return string[]
     */
    public static function freeKeys(array $block)
    {
        return self::keys($block, true);
    }

    /**
     * Keys of every control that can have device values.
     *
     * @param array<string, mixed> $block block schema
     *
     * @return string[]
     */
    public static function allKeys(array $block)
    {
        return self::keys($block, false);
    }

    /**
     * The values without tablet and mobile values of controls that are not allowed.
     *
     * @param array<string, string> $values      style values, e.g. ["fontSize@tablet" => "14px"]
     * @param string[]              $allowedKeys controls whose device values are output
     *
     * @return array<string, string>
     */
    public static function filter(array $values, array $allowedKeys)
    {
        $kept = [];

        foreach ($values as $key => $value) {
            $parts = explode('@', (string) $key, 2);

            if (isset($parts[1]) && \in_array($parts[1], self::DEVICES, true) && !\in_array($parts[0], $allowedKeys, true)) {
                continue;
            }

            $kept[$key] = $value;
        }

        return $kept;
    }

    /**
     * Keys of responsive controls, optionally only the free ones.
     *
     * @param array<string, mixed> $block    block schema
     * @param bool                 $freeOnly only controls marked "freeResponsive"
     *
     * @return string[]
     */
    private static function keys(array $block, $freeOnly)
    {
        $keys = [];

        foreach ($block['sections'] ?? [] as $section) {
            foreach ($section['controls'] ?? [] as $control) {
                if (!empty($control['responsive']) && (!$freeOnly || !empty($control['freeResponsive']))) {
                    $keys[] = $control['key'];
                }
            }
        }

        return $keys;
    }
}
