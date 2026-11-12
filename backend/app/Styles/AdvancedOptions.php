<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Advanced options (Settings › Advanced): how GutenStyle outputs its CSS, and what uninstall deletes.
 * Pure functions, so they work without WordPress (tests). frontend/src/shared/settings.ts checks
 * the content selector with the same pattern.
 */
final class AdvancedOptions
{
    public const SELECTOR_MAX_LENGTH = 200;

    /**
     * Characters a content selector may use: classes, IDs, elements, attribute and pseudo selectors,
     * and combinators. No braces, semicolons, quotes, at-rules or commas, so it cannot add CSS rules.
     */
    public const SELECTOR_PATTERN = '/^[A-Za-z0-9_\-.#:>+~*\[\]=() ]+$/';

    /**
     * The options when nothing is saved.
     *
     * @return array{cssFile: bool, onlyUsedBlocks: bool, contentSelector: string, deleteOnUninstall: bool}
     */
    public static function defaults()
    {
        return [
            'cssFile'           => false,
            'onlyUsedBlocks'    => true,
            'contentSelector'   => '',
            'deleteOnUninstall' => false,
        ];
    }

    /**
     * Valid options; missing or invalid fields get their defaults.
     *
     * @param mixed $input saved or submitted options
     *
     * @return array{cssFile: bool, onlyUsedBlocks: bool, contentSelector: string, deleteOnUninstall: bool}
     */
    public static function sanitize($input)
    {
        $options = self::defaults();

        if (!\is_array($input)) {
            return $options;
        }

        foreach (['cssFile', 'onlyUsedBlocks', 'deleteOnUninstall'] as $key) {
            if (\array_key_exists($key, $input)) {
                $options[$key] = (bool) $input[$key];
            }
        }

        if (isset($input['contentSelector'])) {
            $options['contentSelector'] = self::sanitizeSelector($input['contentSelector']);
        }

        return $options;
    }

    /**
     * A safe content selector, or '' when the input is not one.
     *
     * @param mixed $selector user input, e.g. ".entry-content"
     *
     * @return string
     */
    public static function sanitizeSelector($selector)
    {
        if (!\is_string($selector)) {
            return '';
        }

        $selector = trim((string) preg_replace('/\s+/', ' ', $selector));

        if ($selector === '' || \strlen($selector) > self::SELECTOR_MAX_LENGTH || !preg_match(self::SELECTOR_PATTERN, $selector)) {
            return '';
        }

        return $selector;
    }

    /**
     * The selector every front-end rule starts with: the block's own, after the content selector if set.
     *
     * @param string $contentSelector sanitized content selector
     * @param string $blockSelector   e.g. ".gs.gs-table"
     *
     * @return string
     */
    public static function scopedSelector($contentSelector, $blockSelector)
    {
        return $contentSelector === '' ? $blockSelector : $contentSelector . ' ' . $blockSelector;
    }
}
