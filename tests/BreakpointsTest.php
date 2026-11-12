<?php

declare(strict_types=1);

use GutenStyle\Styles\Breakpoints;
use PHPUnit\Framework\TestCase;

final class BreakpointsTest extends TestCase
{
    public function test_keeps_valid_breakpoints(): void
    {
        $this->assertSame(['tablet' => 1024, 'mobile' => 600], Breakpoints::sanitize(['tablet' => '1024', 'mobile' => 600]));
    }

    /**
     * @dataProvider invalidBreakpoints
     *
     * @param mixed $input
     */
    public function test_rejects_invalid_breakpoints($input): void
    {
        $this->assertNull(Breakpoints::sanitize($input));
    }

    /**
     * @return array<string, array{0: mixed}>
     */
    public static function invalidBreakpoints(): array
    {
        return [
            'not an array'           => ['782'],
            'missing mobile'         => [['tablet' => 782]],
            'not a number'           => [['tablet' => '782px', 'mobile' => 480]],
            'mobile not below tablet' => [['tablet' => 480, 'mobile' => 480]],
            'mobile below minimum'   => [['tablet' => 782, 'mobile' => 200]],
            'tablet above maximum'   => [['tablet' => 5000, 'mobile' => 480]],
            'decimal'                => [['tablet' => 782.5, 'mobile' => 480]],
        ];
    }

    public function test_builds_media_queries_in_the_wordpress_core_format(): void
    {
        $this->assertSame(
            ['tablet' => '@media (480px < width <= 782px)', 'mobile' => '@media (width <= 480px)'],
            Breakpoints::mediaQueries(['tablet' => 782, 'mobile' => 480])
        );
    }
}
