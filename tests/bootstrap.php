<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once dirname(__DIR__) . '/vendor/autoload.php';
require_once __DIR__ . '/wp-stubs.php';

if (file_exists(dirname(__DIR__) . '/tests.config.php')) {
    require_once dirname(__DIR__) . '/tests.config.php';
}
