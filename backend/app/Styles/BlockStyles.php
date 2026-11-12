<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Block styles saved in post content (the "gutenStyle" block attribute). Works on the arrays
 * parse_blocks() returns, so it needs no WordPress functions (tests).
 */
final class BlockStyles
{
    private const ATTRIBUTE = 'gutenStyle';

    /**
     * How many blocks have a block style, inner blocks included.
     *
     * @param array<int, array<string, mixed>> $blocks parsed blocks
     *
     * @return int
     */
    public static function count(array $blocks)
    {
        $count = 0;

        foreach ($blocks as $block) {
            if (!empty($block['attrs'][self::ATTRIBUTE])) {
                ++$count;
            }

            if (!empty($block['innerBlocks'])) {
                $count += self::count($block['innerBlocks']);
            }
        }

        return $count;
    }

    /**
     * The blocks without their block styles. Nothing else changes.
     *
     * @param array<int, array<string, mixed>> $blocks parsed blocks
     *
     * @return array<int, array<string, mixed>>
     */
    public static function strip(array $blocks)
    {
        foreach ($blocks as $index => $block) {
            if (isset($block['attrs'][self::ATTRIBUTE])) {
                unset($blocks[$index]['attrs'][self::ATTRIBUTE]);
            }

            if (!empty($block['innerBlocks'])) {
                $blocks[$index]['innerBlocks'] = self::strip($block['innerBlocks']);
            }
        }

        return $blocks;
    }
}
