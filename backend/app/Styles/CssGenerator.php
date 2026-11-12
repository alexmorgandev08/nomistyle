<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Turns sanitized style values into CSS. Mirrors frontend/src/shared/css.ts —
 * both must produce identical output for the same input (see tests/fixtures/css-cases.json).
 *
 * Selector convention in the schema: "&" is the block root; any selector not
 * starting with "&" is treated as a descendant of the root.
 */
final class CssGenerator
{
    private const PLACEHOLDER_PATTERN = '/\{([A-Za-z0-9]+)(?:\|([^}]*))?\}/';

    /**
     * @param string                $type         block schema key, e.g. "table"
     * @param array<string, string> $values       sanitized values
     * @param string                $root         root selector, e.g. ".gs.gs-table"
     * @param bool                  $important    append !important to every declaration (Force Style)
     * @param array<string, string> $mediaQueries device => media query, e.g. ["tablet" => "@media (...)"]
     *
     * Values keyed "name@hover" are written for the root's :hover state.
     */
    public static function generate($type, array $values, $root, $important = false, array $mediaQueries = [])
    {
        $block = Schema::block($type);

        if (!$block || empty($values)) {
            return '';
        }

        $parts = [
            self::render(self::collect($block, $values, ''), $root, $important),
            // Hover values apply on every screen size, so they sit outside the media queries.
            self::render(self::collect($block, $values, '@' . ValueSanitizer::HOVER), $root . ':hover', $important),
        ];

        foreach (ValueSanitizer::DEVICES as $device) {
            if (empty($mediaQueries[$device])) {
                continue;
            }

            $css = self::render(self::collect($block, $values, '@' . $device), $root, $important);

            if ($css !== '') {
                $parts[] = $mediaQueries[$device] . '{' . $css . '}';
            }
        }

        return implode("\n", array_filter($parts, 'strlen'));
    }

    /**
     * @return array<string, array<string, string>> selector => [property => value]
     */
    private static function collect(array $block, array $values, $suffix)
    {
        $rules = [];

        foreach ($block['sections'] as $section) {
            foreach ($section['controls'] as $control) {
                if ($suffix !== '' && !ValueSanitizer::supportsVariant($control, substr($suffix, 1))) {
                    continue;
                }

                $key = $control['key'] . $suffix;

                if (!isset($values[$key]) || $values[$key] === '') {
                    continue;
                }

                $value = $values[$key];

                if (!empty($control['targets'])) {
                    foreach ($control['targets'] as $target) {
                        $rules[$target['selector']][$target['property']] = $value;
                    }
                }

                if ($control['type'] === 'select' && !empty($control['options'])) {
                    foreach ($control['options'] as $option) {
                        if ($option['value'] === $value && !empty($option['css'])) {
                            self::merge($rules, $option['css'], $values);
                        }
                    }
                }

                if (!empty($control['extra'])) {
                    self::merge($rules, $control['extra'], $values);
                }
            }
        }

        return $rules;
    }

    private static function merge(array &$rules, array $css, array $values)
    {
        foreach ($css as $selector => $declarations) {
            foreach ($declarations as $property => $template) {
                $rules[$selector][$property] = self::interpolate($template, $values);
            }
        }
    }

    private static function interpolate($template, array $values)
    {
        return preg_replace_callback(
            self::PLACEHOLDER_PATTERN,
            function ($matches) use ($values) {
                if (isset($values[$matches[1]]) && $values[$matches[1]] !== '') {
                    return $values[$matches[1]];
                }

                return isset($matches[2]) ? $matches[2] : '';
            },
            $template
        );
    }

    private static function render(array $rules, $root, $important)
    {
        $css = [];

        foreach ($rules as $selector => $declarations) {
            $lines = [];

            foreach ($declarations as $property => $value) {
                $lines[] = $property . ':' . $value . ($important ? '!important' : '');
            }

            $css[] = self::resolveSelector($root, $selector) . '{' . implode(';', $lines) . '}';
        }

        return implode("\n", $css);
    }

    private static function resolveSelector($root, $selector)
    {
        $resolved = [];

        foreach (explode(',', $selector) as $part) {
            $part = trim($part);

            $resolved[] = strpos($part, '&') === 0 ? $root . substr($part, 1) : $root . ' ' . $part;
        }

        return implode(',', $resolved);
    }
}
