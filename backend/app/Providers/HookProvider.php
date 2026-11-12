<?php

namespace GutenStyle\Providers;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Deps\BitApps\WPKit\Hooks\Hooks;
use GutenStyle\Deps\BitApps\WPKit\Http\RequestType;
use GutenStyle\Deps\BitApps\WPKit\Http\Router\Router;

class HookProvider
{
    private $_pluginBackend;

    public function __construct()
    {
        $this->_pluginBackend = Config::get('BASEDIR') . DIRECTORY_SEPARATOR;
        Hooks::addAction('rest_api_init', [$this, 'loadAppApiHooks']);
    }

    public function loadAppApiHooks()
    {
        if (
            is_readable($this->_pluginBackend . 'hooks' . DIRECTORY_SEPARATOR . 'api.php')
            && RequestType::is(RequestType::API)
        ) {
            $router = new Router(RequestType::API, Config::REST_NAMESPACE, 'v1');
            include $this->_pluginBackend . 'hooks' . DIRECTORY_SEPARATOR . 'api.php';
            $router->register();
        }
    }
}
