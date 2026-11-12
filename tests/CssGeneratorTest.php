<?php

declare(strict_types=1);

use GutenStyle\Styles\CssGenerator;
use PHPUnit\Framework\TestCase;

/**
 * The same fixtures are checked by frontend/src/shared/css.test.ts, which keeps
 * the editor preview (TypeScript) and the front end (PHP) producing identical CSS.
 */
final class CssGeneratorTest extends TestCase
{
    public static function fixtureCases(): array
    {
        $cases = json_decode(file_get_contents(__DIR__ . '/fixtures/css-cases.json'), true);
        $data  = [];

        foreach ($cases as $case) {
            $data[$case['name']] = [$case];
        }

        return $data;
    }

    /**
     * @dataProvider fixtureCases
     */
    public function test_generates_expected_css(array $case): void
    {
        $css = CssGenerator::generate($case['type'], $case['values'], $case['root'], $case['important'], $case['mediaQueries']);

        $this->assertSame($case['expected'], $css);
    }

    public function test_unknown_block_type_produces_nothing(): void
    {
        $this->assertSame('', CssGenerator::generate('carousel', ['background' => '#000'], '.x'));
    }

    public function test_responsive_values_need_a_media_query(): void
    {
        $css = CssGenerator::generate('table', ['cellPaddingY@mobile' => '8px'], '.gs.gs-table');

        $this->assertSame('', $css);
    }

    public function test_presets_only_use_known_controls(): void
    {
        foreach (GutenStyle\Styles\Schema::blocks() as $type => $block) {
            foreach ($block['presets'] as $preset) {
                $this->assertSame(
                    $preset['values'],
                    GutenStyle\Styles\ValueSanitizer::sanitize($type, $preset['values']),
                    "Preset {$type}/{$preset['id']} contains values the sanitizer rejects"
                );
            }
        }
    }
}
