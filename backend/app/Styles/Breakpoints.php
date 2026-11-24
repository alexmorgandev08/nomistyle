<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Custom tablet and mobile breakpoints (Settings › Responsive). Without them, Nomi Style uses the
 * breakpoints of WordPress and the theme (Scope::themeMediaQueries()).
 * frontend/src/shared/breakpoints.ts builds the same media queries for the admin preview.
 */
final class Breakpoints
{
    public const MIN = 320;

    public const MAX = 2400;

    /**
     * Valid custom breakpoints, or null to use the theme's.
     *
     * @param mixed $input ['tablet' => int, 'mobile' => int]
     *
     * @return array{tablet: int, mobile: int}|null
     */
    public static function sanitize($input)
    {
        if (!\is_array($input) || !isset($input['tablet'], $input['mobile'])) {
            return null;
        }

        $tablet = filter_var($input['tablet'], FILTER_VALIDATE_INT);
        $mobile = filter_var($input['mobile'], FILTER_VALIDATE_INT);

        if ($tablet === false || $mobile === false || $mobile < self::MIN || $tablet > self::MAX || $mobile >= $tablet) {
            return null;
        }

        return ['tablet' => $tablet, 'mobile' => $mobile];
    }

    /**
     * Media queries in the format WordPress core uses for its own breakpoints.
     *
     * @param array{tablet: int, mobile: int} $breakpoints valid breakpoints
     *
     * @return array{tablet: string, mobile: string}
     */
    public static function mediaQueries(array $breakpoints)
    {
        return [
            'tablet' => '@media (' . $breakpoints['mobile'] . 'px < width <= ' . $breakpoints['tablet'] . 'px)',
            'mobile' => '@media (width <= ' . $breakpoints['mobile'] . 'px)',
        ];
    }
}
