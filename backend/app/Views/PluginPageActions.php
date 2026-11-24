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
                'title' => __('Settings', 'nomistyle'),
            ],
            [
                'url'   => 'https://wordpress.org/support/plugin/nomistyle/',
                'title' => __('Support', 'nomistyle'),
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
