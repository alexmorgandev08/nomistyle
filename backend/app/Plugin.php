<?php

namespace GutenStyle;

// Prevent direct script access
if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Deps\BitApps\WPKit\Hooks\Hooks;
use GutenStyle\Deps\BitApps\WPKit\Http\RequestType;
use GutenStyle\Deps\BitApps\WPKit\Migration\MigrationHelper;
use GutenStyle\Deps\BitApps\WPKit\Utils\Capabilities;
use GutenStyle\Editor\EditorIntegration;
use GutenStyle\Frontend\StyleRenderer;
use GutenStyle\HTTP\Controllers\StylesController;
use GutenStyle\Providers\HookProvider;
use GutenStyle\Providers\InstallerProvider;
use GutenStyle\Styles\PostStyles;
use GutenStyle\Views\Layout;
use GutenStyle\Views\PluginPageActions;
use GutenStyle\Views\PreviewPage;

final class Plugin
{
    private static $_instance;

    public function __construct()
    {
        $this->registerInstaller();

        Hooks::addAction('plugins_loaded', [$this, 'loaded']);
    }

    public function registerInstaller()
    {
        $installerProvider = new InstallerProvider();
        $installerProvider->register();
    }

    public function loaded()
    {
        Hooks::doAction(Config::withPrefix('loaded'));

        Hooks::addAction('init', [$this, 'registerProviders'], 8);

        Hooks::addFilter('plugin_action_links_' . Config::get('BASENAME'), [new PluginPageActions(), 'renderActionLinks']);

        $this->maybeMigrateDB();
    }

    public function registerProviders()
    {
        if (RequestType::is('admin')) {
            new Layout();
        }

        new HookProvider();

        PostStyles::register();
        new EditorIntegration();
        Hooks::addAction('rest_api_init', [new StylesController(), 'registerRoutes']);

        if (!is_admin()) {
            new StyleRenderer();
            new PreviewPage();
        }
    }

    public static function maybeMigrateDB()
    {
        if (!Capabilities::check('manage_options')) {
            return;
        }

        if (version_compare(Config::getOption('db_version'), Config::DB_VERSION, '<')) {
            MigrationHelper::migrate(InstallerProvider::migration());
        }
    }

    public static function instance()
    {
        return self::$_instance;
    }

    public static function load()
    {
        if (self::$_instance !== null) {
            return false;
        }

        self::$_instance = new self();

        return true;
    }
}
