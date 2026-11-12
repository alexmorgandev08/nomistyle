<?php

declare(strict_types=1);

use GutenStyle\Styles\EditorOptions;
use PHPUnit\Framework\TestCase;

final class EditorOptionsTest extends TestCase
{
    private const KNOWN = ['administrator', 'editor', 'author', 'contributor', 'subscriber'];

    private const DEFAULT_ROLES = ['administrator', 'editor', 'author', 'contributor'];

    public function test_uses_defaults_when_nothing_is_saved(): void
    {
        $this->assertSame(
            ['showSource' => true, 'allowPostStyles' => true, 'allowBlockStyles' => true, 'roles' => self::DEFAULT_ROLES],
            EditorOptions::sanitize(null, self::KNOWN, self::DEFAULT_ROLES)
        );
    }

    public function test_keeps_switches_turned_off(): void
    {
        $options = EditorOptions::sanitize(['showSource' => false, 'allowPostStyles' => 0], self::KNOWN, self::DEFAULT_ROLES);

        $this->assertFalse($options['showSource']);
        $this->assertFalse($options['allowPostStyles']);
        $this->assertTrue($options['allowBlockStyles']);
    }

    public function test_drops_unknown_and_duplicate_roles(): void
    {
        $options = EditorOptions::sanitize(['roles' => ['editor', 'hacker', 'editor', 42]], self::KNOWN, self::DEFAULT_ROLES);

        $this->assertSame(['editor'], $options['roles']);
    }

    public function test_an_empty_role_list_stays_empty(): void
    {
        $this->assertSame([], EditorOptions::sanitize(['roles' => []], self::KNOWN, self::DEFAULT_ROLES)['roles']);
    }

    public function test_users_with_an_allowed_role_can_edit(): void
    {
        $this->assertTrue(EditorOptions::userCanEdit(['author'], ['editor', 'author'], false));
        $this->assertFalse(EditorOptions::userCanEdit(['contributor'], ['editor', 'author'], false));
    }

    public function test_administrators_can_always_edit(): void
    {
        $this->assertTrue(EditorOptions::userCanEdit(['administrator'], [], true));
    }
}
