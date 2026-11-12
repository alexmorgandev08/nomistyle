<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Deps\BitApps\WPKit\Hooks\Hooks;
use GutenStyle\Deps\BitApps\WPKit\Utils\Capabilities;

final class Layout
{
    public function __construct()
    {
        Hooks::addAction('in_admin_header', [$this, 'removeAdminNotices']);
        Hooks::addAction('admin_menu', [$this, 'sideBarMenuItem']);
        Hooks::addAction('admin_enqueue_scripts', [new Head(), 'addHeadScripts'], 0);
        Hooks::addFilter('admin_body_class', [$this, 'addBodyClass']);
    }

    /**
     * Marks the GutenStyle admin page. Tailwind's `important` selector (tailwind.config.mjs) is scoped to it.
     *
     * @param string $classes
     *
     * @return string
     */
    public function addBodyClass($classes)
    {
        if (!self::isPluginPage()) {
            return $classes;
        }

        return $classes . ' ' . Config::SLUG . '-page';
    }

    public function sideBarMenuItem()
    {
        $menus = Hooks::applyFilter(Config::withPrefix('admin_sidebar_menu'), Config::get('SIDE_BAR_MENU'));
        global $submenu;

        foreach ($menus as $menu) {
            if (isset($menu['capability']) && Capabilities::check($menu['capability'])) {
                if ($menu['type'] === 'menu') {
                    add_menu_page(
                        $menu['title'],
                        $menu['name'],
                        $menu['capability'],
                        $menu['slug'],
                        $menu['callback'],
                        $menu['icon'],
                        $menu['position']
                    );
                } else {
                    $submenu[$menu['parent']][] = [$menu['name'], $menu['capability'], 'admin.php?page=' . $menu['slug']];
                }
            }
        }
    }

    public function removeAdminNotices()
    {
        if (!self::isPluginPage()) {
            return;
        }

        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
    }

    private static function isPluginPage()
    {
        global $plugin_page;

        return !empty($plugin_page) && strpos($plugin_page, Config::SLUG) !== false;
    }
}
