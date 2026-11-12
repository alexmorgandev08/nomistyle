<?php

use GutenStyle\Config;
use GutenStyle\Deps\BitApps\WPKit\Migration\Migration;
use GutenStyle\Styles\DataCleaner;

if (! defined('ABSPATH')) {
    exit;
}

final class GutenStylePluginOptions extends Migration
{
    public function up(): void
    {
        Config::updateOption('db_version', Config::DB_VERSION, true);
        Config::updateOption('installed', time(), true);
        Config::updateOption('version', Config::VERSION, true);
    }

    /**
     * Runs on uninstall. Data is kept unless Settings › Advanced › Delete data on uninstall is on,
     * so reinstalling GutenStyle brings everything back.
     */
    public function down(): void
    {
        if (DataCleaner::deletesDataOnUninstall()) {
            DataCleaner::deleteAll();
        }
    }
}
