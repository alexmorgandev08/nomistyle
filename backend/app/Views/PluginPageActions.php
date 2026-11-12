<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;

class PluginPageActions
{
    public function getActionLinks()
    {
        return [
            [
                'url'   => admin_url('admin.php?page=' . Config::SLUG),
                'title' => __('Settings', 'guten-style'),
            ],
            [
                'url'   => 'https://wordpress.org/support/plugin/guten-style/',
                'title' => __('Support', 'guten-style'),
            ],
        ];
    }

    public function renderActionLinks($links)
    {
        $actionLinks = [];
        foreach ($this->getActionLinks() as $link) {
            $actionLinks[] = '<a href="' . esc_url($link['url']) . '">' . esc_html($link['title']) . '</a>';
        }

        return array_merge($actionLinks, $links);
    }
}
