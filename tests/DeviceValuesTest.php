<?php

declare(strict_types=1);

use GutenStyle\Styles\DeviceValues;
use PHPUnit\Framework\TestCase;

final class DeviceValuesTest extends TestCase
{
    private const BLOCK = [
        'sections' => [
            ['controls' => [
                ['key' => 'h2FontSize', 'responsive' => true, 'freeResponsive' => true],
                ['key' => 'marginTop', 'responsive' => true],
                ['key' => 'color'],
            ]],
        ],
    ];

    public function test_lists_free_and_all_device_controls(): void
    {
        $this->assertSame(['h2FontSize'], DeviceValues::freeKeys(self::BLOCK));
        $this->assertSame(['h2FontSize', 'marginTop'], DeviceValues::allKeys(self::BLOCK));
    }

    public function test_drops_device_values_of_controls_that_are_not_allowed(): void
    {
        $values = [
            'h2FontSize'        => '32px',
            'h2FontSize@tablet' => '28px',
            'marginTop'         => '2em',
            'marginTop@mobile'  => '1em',
            'color@hover'       => '#000',
        ];

        $this->assertSame(
            ['h2FontSize' => '32px', 'h2FontSize@tablet' => '28px', 'marginTop' => '2em', 'color@hover' => '#000'],
            DeviceValues::filter($values, ['h2FontSize'])
        );
    }

    public function test_keeps_every_device_value_when_all_are_allowed(): void
    {
        $values = ['marginTop@mobile' => '1em', 'h2FontSize@tablet' => '28px'];

        $this->assertSame($values, DeviceValues::filter($values, ['h2FontSize', 'marginTop']));
    }
}
