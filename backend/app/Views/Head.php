<?php

namespace GutenStyle\Views;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Styles\StyleSettings;

class Head
{
    public function addHeadScripts($currentScreen)
    {
        if (strpos($currentScreen, Config::SLUG) === false) {
            return;
        }

        $data = array_merge(
            Assets::sharedData(),
            Assets::adminSettingsData(),
            [
                'postTypes'  => StyleSettings::availablePostTypes(),
                'previewUrl' => PreviewPage::url(),
                'version'    => Config::VERSION,
            ]
        );

        Assets::enqueue('admin', 'gutenStyleAdmin', $data);
    }
}
