<?php

declare(strict_types=1);

use GutenStyle\Styles\ValueSanitizer;
use PHPUnit\Framework\TestCase;

final class ValueSanitizerTest extends TestCase
{
    public function test_keeps_valid_values(): void
    {
        $values = [
            'headerBackground'   => '#1e293b',
            'headerTextColor'    => 'rgba(255, 255, 255, 0.9)',
            'cellTextColor'      => 'var(--wp--preset--color--contrast)',
            'cellPaddingY'       => '12px',
            'cellPaddingY@tablet' => '0.75em',
            'radius'             => '0',
            'gridLines'          => 'rows',
        ];

        $this->assertSame($values, ValueSanitizer::sanitize('table', $values));
    }

    /**
     * @dataProvider invalidValues
     */
    public function test_drops_invalid_values(string $key, $value): void
    {
        $this->assertSame([], ValueSanitizer::sanitize('table', [$key => $value]));
    }

    public static function invalidValues(): array
    {
        return [
            'unknown control'            => ['backgroundImage', 'url(x)'],
            'css injection in color'     => ['headerBackground', 'red;}</style><script>alert(1)</script>'],
            'expression in color'        => ['headerBackground', 'var(--evil); background:url(x)'],
            'unit not allowed'           => ['radius', '2em'],
            'over max'                   => ['radius', '500px'],
            'bare number'                => ['cellPaddingY', '12'],
            'unknown select option'      => ['gridLines', 'diagonal'],
            'device on non-responsive'   => ['headerBackground@mobile', '#000'],
            'unknown device'             => ['cellPaddingY@watch', '4px'],
            'array value'                => ['headerBackground', ['#000']],
            'empty string'               => ['headerBackground', ''],
        ];
    }

    public function test_media_only_controls_need_a_device(): void
    {
        $this->assertSame([], ValueSanitizer::sanitize('table', ['mobileLayout' => 'stack']));
        $this->assertSame(['mobileLayout@mobile' => 'stack'], ValueSanitizer::sanitize('table', ['mobileLayout@mobile' => 'stack']));
    }

    public function test_hover_values_only_for_hover_capable_controls(): void
    {
        $this->assertSame(['headerBackground@hover' => '#000000'], ValueSanitizer::sanitize('table', ['headerBackground@hover' => '#000000']));
        $this->assertSame([], ValueSanitizer::sanitize('table', ['radius@hover' => '8px']));
        $this->assertSame([], ValueSanitizer::sanitize('table', ['headerBackground@focus' => '#000000']));
    }

    public function test_number_respects_range(): void
    {
        $this->assertSame(['lineHeight' => '1.6'], ValueSanitizer::sanitize('list', ['lineHeight' => '1.6']));
        $this->assertSame([], ValueSanitizer::sanitize('list', ['lineHeight' => '9']));
    }

    public function test_style_map_drops_unknown_block_types_and_empty_maps(): void
    {
        $map = ValueSanitizer::sanitizeStyleMap(
            [
                'table'    => ['headerBackground' => '#000'],
                'quote'    => ['nope' => '1'],
                'carousel' => ['background' => '#fff'],
            ]
        );

        $this->assertSame(['table' => ['headerBackground' => '#000']], $map);
    }
}
