<?php

namespace GutenStyle\src;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Views\Body;

final class Menu
{
    public static function getSideBarMenu(Body $body)
    {
        return [
            'Home' => [
                'type'       => 'menu',
                'title'      => __('GutenStyle', 'guten-style'),
                'name'       => __('GutenStyle', 'guten-style'),
                'capability' => 'manage_options',
                'slug'       => Config::SLUG,
                'callback'   => [$body, 'render'],
                'icon'       => 'dashicons-art',
                'position'   => '61',
            ],
        ];
    }
}
