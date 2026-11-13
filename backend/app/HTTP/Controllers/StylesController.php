<?php

namespace GutenStyle\HTTP\Controllers;

if (!defined('ABSPATH')) {
    exit;
}

use GutenStyle\Config;
use GutenStyle\Frontend\GlobalCssFile;
use GutenStyle\Styles\DataCleaner;
use GutenStyle\Styles\Overrides;
use GutenStyle\Styles\PostStyles;
use GutenStyle\Styles\StyleSettings;
use WP_Error;
use WP_Query;
use WP_REST_Request;
use WP_REST_Server;

/**
 * REST endpoints for the GutenStyle admin screen.
 * Registered directly (not through the WPKit router) so every route gets a real permission check.
 */
final class StylesController
{
    public static function restNamespace()
    {
        return strtolower(Config::SLUG) . '/v1';
    }

    public function registerRoutes()
    {
        $isAdmin = function () {
            return current_user_can('manage_options');
        };

        register_rest_route(
            self::restNamespace(),
            '/config',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'getConfig'],
                    'permission_callback' => $isAdmin,
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [$this, 'saveConfig'],
                    'permission_callback' => $isAdmin,
                ],
            ]
        );

        register_rest_route(
            self::restNamespace(),
            '/exclusions',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'getExclusions'],
                    'permission_callback' => $isAdmin,
                ],
                [
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => [$this, 'setExclusion'],
                    'permission_callback' => $isAdmin,
                    'args'                => [
                        'id'       => ['type' => 'integer', 'required' => true, 'minimum' => 1],
                        'excluded' => ['type' => 'boolean', 'required' => true],
                    ],
                ],
            ]
        );

        register_rest_route(
            self::restNamespace(),
            '/css',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'getCssFile'],
                    'permission_callback' => $isAdmin,
                ],
                [
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => [$this, 'regenerateCss'],
                    'permission_callback' => $isAdmin,
                ],
            ]
        );

        register_rest_route(
            self::restNamespace(),
            '/overrides',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'getOverrides'],
                'permission_callback' => $isAdmin,
                'args'                => [
                    'page'    => ['type' => 'integer', 'default' => 1, 'minimum' => 1],
                    'perPage' => ['type' => 'integer', 'default' => 20, 'minimum' => 1, 'maximum' => 100],
                ],
            ]
        );

        register_rest_route(
            self::restNamespace(),
            '/overrides/(?P<id>\\d+)',
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'removeOverrides'],
                'permission_callback' => function (WP_REST_Request $request) {
                    return current_user_can('manage_options') && current_user_can('edit_post', (int) $request['id']);
                },
            ]
        );

        register_rest_route(
            self::restNamespace(),
            '/reset',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'reset'],
                'permission_callback' => $isAdmin,
            ]
        );
    }

    public function getConfig()
    {
        return rest_ensure_response(StyleSettings::get());
    }

    public function saveConfig(WP_REST_Request $request)
    {
        $body = $request->get_json_params();

        if (!\is_array($body)) {
            return new WP_Error('guten_style_invalid', __('Invalid settings payload.', 'guten-style'), ['status' => 400]);
        }

        $settings = StyleSettings::save($body);
        GlobalCssFile::sync($settings);

        return rest_ensure_response($settings);
    }

    /**
     * Whether the cached CSS file is in use (Settings › Advanced).
     */
    public function getCssFile()
    {
        return rest_ensure_response(['inUse' => GlobalCssFile::url() !== null]);
    }

    /**
     * Builds the cached CSS file again from the saved settings.
     */
    public function regenerateCss()
    {
        return rest_ensure_response(['inUse' => GlobalCssFile::sync(StyleSettings::get())]);
    }

    /**
     * Tools › Overrides: one page of posts with a post style or block styles.
     *
     * @param WP_REST_Request $request request with page and perPage
     */
    public function getOverrides(WP_REST_Request $request)
    {
        return rest_ensure_response(Overrides::find((int) $request['page'], (int) $request['perPage']));
    }

    /**
     * Removes a post's post style and block styles, after saving a revision.
     *
     * @param WP_REST_Request $request request with the post ID
     */
    public function removeOverrides(WP_REST_Request $request)
    {
        $result = Overrides::remove((int) $request['id']);

        if ($result === null) {
            return new WP_Error('guten_style_not_found', __('The post does not exist.', 'guten-style'), ['status' => 404]);
        }

        return rest_ensure_response($result);
    }

    /**
     * Reset everything: deletes global styles, settings, post styles and exclusions.
     */
    public function reset()
    {
        DataCleaner::resetStyles();

        return rest_ensure_response(StyleSettings::get());
    }

    public function getExclusions()
    {
        $query = new WP_Query(
            [
                'post_type'      => 'any',
                'post_status'    => ['publish', 'draft', 'pending', 'private', 'future'],
                'posts_per_page' => 200,
                // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- admin-only list, at most 200 posts.
                'meta_key'       => PostStyles::META_DISABLED,
                // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- admin-only list, at most 200 posts.
                'meta_value'     => '1',
                'no_found_rows'  => true,
            ]
        );

        return rest_ensure_response(array_map([$this, 'formatPost'], $query->posts));
    }

    public function setExclusion(WP_REST_Request $request)
    {
        $postId = (int) $request->get_param('id');

        if (!get_post($postId) || !current_user_can('edit_post', $postId)) {
            return new WP_Error('guten_style_forbidden', __('You cannot edit this post.', 'guten-style'), ['status' => 403]);
        }

        PostStyles::setDisabled($postId, (bool) $request->get_param('excluded'));

        return $this->getExclusions();
    }

    private function formatPost($post)
    {
        $postType = get_post_type_object($post->post_type);

        return [
            'id'       => $post->ID,
            'title'    => get_the_title($post) ?: __('(no title)', 'guten-style'),
            'type'     => $postType ? $postType->labels->singular_name : $post->post_type,
            'editUrl'  => get_edit_post_link($post->ID, 'raw'),
            'viewUrl'  => get_permalink($post),
        ];
    }
}
