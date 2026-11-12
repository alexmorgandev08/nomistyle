<?php

declare(strict_types=1);

use GutenStyle\Styles\AdvancedOptions;
use PHPUnit\Framework\TestCase;

final class AdvancedOptionsTest extends TestCase
{
    public function test_defaults_keep_todays_behavior_and_keep_data_on_uninstall(): void
    {
        $this->assertSame(
            ['cssFile' => false, 'onlyUsedBlocks' => true, 'contentSelector' => '', 'deleteOnUninstall' => false],
            AdvancedOptions::sanitize(null)
        );
    }

    public function test_keeps_valid_options(): void
    {
        $options = AdvancedOptions::sanitize(
            ['cssFile' => true, 'onlyUsedBlocks' => false, 'contentSelector' => '  .entry-content   >  main ', 'deleteOnUninstall' => 1]
        );

        $this->assertTrue($options['cssFile']);
        $this->assertFalse($options['onlyUsedBlocks']);
        $this->assertSame('.entry-content > main', $options['contentSelector']);
        $this->assertTrue($options['deleteOnUninstall']);
    }

    /**
     * @dataProvider safeSelectors
     */
    public function test_accepts_safe_selectors(string $selector): void
    {
        $this->assertSame($selector, AdvancedOptions::sanitizeSelector($selector));
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function safeSelectors(): array
    {
        return [
            'class'          => ['.entry-content'],
            'id and element' => ['#main article'],
            'attribute'      => ['[data-content=post]'],
            'pseudo'         => ['main:is(.post)'],
            'combinators'    => ['.site > .content ~ .wrap + div'],
        ];
    }

    /**
     * @dataProvider unsafeSelectors
     *
     * @param mixed $selector
     */
    public function test_rejects_selectors_that_could_add_css($selector): void
    {
        $this->assertSame('', AdvancedOptions::sanitizeSelector($selector));
    }

    /**
     * @return array<string, array{0: mixed}>
     */
    public static function unsafeSelectors(): array
    {
        return [
            'closes the rule'    => ['.x{} body{display:none}'],
            'semicolon'          => ['.x;color:red'],
            'at-rule'            => ['@import url(x)'],
            'quotes'             => ['[data-x="y"]'],
            'comma list'         => ['.a, .b'],
            'closing style tag'  => ['</style><script>'],
            'comment'            => ['.a/* x */'],
            'too long'           => [str_repeat('.a', 101)],
            'not a string'       => [['.a']],
        ];
    }

    public function test_puts_the_content_selector_in_front_of_the_block_selector(): void
    {
        $this->assertSame('.entry-content .gs.gs-table', AdvancedOptions::scopedSelector('.entry-content', '.gs.gs-table'));
        $this->assertSame('.gs.gs-table', AdvancedOptions::scopedSelector('', '.gs.gs-table'));
    }
}
