<?php
// Regenerates tests/fixtures/css-cases.json from scripts/css-fixture-inputs.json using the PHP generator.
// Review the diff before committing: the TypeScript test (frontend/src/shared/css.test.ts) must match it.
define('ABSPATH', __DIR__ . '/');
require dirname(__DIR__) . '/vendor/autoload.php';

use GutenStyle\Styles\CssGenerator;

$mediaQueries = ['tablet' => '@media (480px < width <= 782px)', 'mobile' => '@media (width <= 480px)'];
$cases        = json_decode(file_get_contents(__DIR__ . '/css-fixture-inputs.json'), true);

foreach ($cases as &$case) {
    $case['mediaQueries'] = $mediaQueries;
    $case['expected']     = CssGenerator::generate($case['type'], $case['values'], $case['root'], $case['important'], $mediaQueries);
}

file_put_contents(dirname(__DIR__) . '/tests/fixtures/css-cases.json', json_encode($cases, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
echo count($cases) . " cases written\n";
