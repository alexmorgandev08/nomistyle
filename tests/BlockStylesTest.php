<?php

declare(strict_types=1);

use GutenStyle\Styles\BlockStyles;
use PHPUnit\Framework\TestCase;

final class BlockStylesTest extends TestCase
{
    /**
     * A table with a block style, inside a group with a list that has one too, and a plain paragraph.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function blocks(): array
    {
        return [
            ['blockName' => 'core/paragraph', 'attrs' => ['align' => 'left'], 'innerBlocks' => []],
            [
                'blockName'   => 'core/group',
                'attrs'       => [],
                'innerBlocks' => [
                    ['blockName' => 'core/table', 'attrs' => ['hasFixedLayout' => true, 'gutenStyle' => ['values' => ['radius' => '8px']]], 'innerBlocks' => []],
                    ['blockName' => 'core/list', 'attrs' => ['gutenStyle' => ['values' => ['markerStyle' => 'check']]], 'innerBlocks' => []],
                ],
            ],
        ];
    }

    public function test_counts_block_styles_in_inner_blocks(): void
    {
        $this->assertSame(2, BlockStyles::count(self::blocks()));
        $this->assertSame(0, BlockStyles::count([]));
    }

    public function test_strips_only_the_block_style_attribute(): void
    {
        $stripped = BlockStyles::strip(self::blocks());

        $this->assertSame(0, BlockStyles::count($stripped));
        $this->assertSame(['align' => 'left'], $stripped[0]['attrs']);
        $this->assertSame(['hasFixedLayout' => true], $stripped[1]['innerBlocks'][0]['attrs']);
        $this->assertSame([], $stripped[1]['innerBlocks'][1]['attrs']);
        $this->assertSame('core/table', $stripped[1]['innerBlocks'][0]['blockName']);
    }
}
