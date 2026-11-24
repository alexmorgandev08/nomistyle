<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Block editor options (Settings › Block editor): what the Nomi Style panels show and who sees them.
 * Pure functions, so they work without WordPress (tests); StyleSettings passes in the site's roles.
 */
final class EditorOptions
{
    /**
     * The options when nothing is saved: everything shown and allowed.
     *
     * @param string[] $defaultRoles roles that can edit styles when nothing is saved
     *
     * @return array{showSource: bool, allowPostStyles: bool, allowBlockStyles: bool, roles: string[]}
     */
    public static function defaults(array $defaultRoles)
    {
        return [
            'showSource'       => true,
            'allowPostStyles'  => true,
            'allowBlockStyles' => true,
            'roles'            => array_values($defaultRoles),
        ];
    }

    /**
     * Valid options. Unknown roles are dropped; missing fields get their defaults.
     *
     * @param mixed    $input        saved or submitted options
     * @param string[] $knownRoles   the site's role names
     * @param string[] $defaultRoles roles that can edit styles when nothing is saved
     *
     * @return array{showSource: bool, allowPostStyles: bool, allowBlockStyles: bool, roles: string[]}
     */
    public static function sanitize($input, array $knownRoles, array $defaultRoles)
    {
        $options = self::defaults($defaultRoles);

        if (!\is_array($input)) {
            return $options;
        }

        foreach (['showSource', 'allowPostStyles', 'allowBlockStyles'] as $key) {
            if (\array_key_exists($key, $input)) {
                $options[$key] = (bool) $input[$key];
            }
        }

        if (isset($input['roles']) && \is_array($input['roles'])) {
            $roles = array_filter(
                $input['roles'],
                static function ($role) use ($knownRoles) {
                    return \is_string($role) && \in_array($role, $knownRoles, true);
                }
            );

            $options['roles'] = array_values(array_unique($roles));
        }

        return $options;
    }

    /**
     * Whether a user sees the Nomi Style editor panels. Administrators always do, so nobody is locked out.
     *
     * @param string[] $userRoles    the user's roles
     * @param string[] $allowedRoles roles that can edit styles
     * @param bool     $isAdmin      whether the user can manage options
     *
     * @return bool
     */
    public static function userCanEdit(array $userRoles, array $allowedRoles, $isAdmin)
    {
        return $isAdmin || array_intersect($userRoles, $allowedRoles) !== [];
    }
}
