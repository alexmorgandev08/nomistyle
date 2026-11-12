<?php

namespace GutenStyle\Editor;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Deps\BitApps\WPKit\Hooks\Hooks;
use GutenStyle\Styles\Schema;
use GutenStyle\Styles\Scope;
use GutenStyle\Styles\EditorOptions;
use GutenStyle\Styles\StyleSettings;
use GutenStyle\Views\Assets;

/**
 * Loads the GutenStyle sidebar panels in the post editor and registers the
 * `gutenStyle` block attribute on supported core blocks.
 */
final class EditorIntegration
{
    public function __construct()
    {
        Hooks::addFilter('register_block_type_args', [$this, 'addBlockAttribute'], 10, 2);
        Hooks::addAction('enqueue_block_editor_assets', [$this, 'enqueue']);
    }

    public function addBlockAttribute($args, $blockName)
    {
        if (isset(Schema::blockNameMap()[$blockName])) {
            $args['attributes']['gutenStyle'] = ['type' => 'object'];
        }

        return $args;
    }

    public function enqueue()
    {
        $screen = \function_exists('get_current_screen') ? get_current_screen() : null;

        // Post editor only: the site editor edits templates, which have no post-level scope.
        if (!$screen || $screen->base !== 'post') {
            return;
        }

        Assets::enqueue(
            'editor',
            'gutenStyleEditor',
            array_merge(
                Assets::sharedData(),
                [
                    'canEditStyles'     => EditorOptions::userCanEdit(
                        (array) wp_get_current_user()->roles,
                        StyleSettings::get()['editor']['roles'],
                        current_user_can('manage_options')
                    ),
                    'canManage'         => current_user_can('manage_options'),
                    // Conditions such as categories are checked once, when the editor opens.
                    'matchesConditions' => Scope::matchesConditions((int) get_the_ID()),
                    'version'           => Config::VERSION,
                ]
            )
        );
    }
}
