<?php

namespace GutenStyle\Styles;

if (!defined('ABSPATH')) {
    exit;
}

use WP_Post;

/**
 * Tools › Overrides: posts with a post style or block styles, and removing them.
 */
final class Overrides
{
    /**
     * Post content holds block styles in this block attribute.
     */
    private const CONTENT_MARKER = '"gutenStyle"';

    /**
     * One page of posts with overrides, the most recently edited first.
     *
     * @param int $page    page number, from 1
     * @param int $perPage posts per page
     *
     * @return array{items: array<int, array<string, mixed>>, total: int}
     */
    public static function find($page, $perPage)
    {
        global $wpdb;

        $types = array_column(StyleSettings::availablePostTypes(), 'name');

        if ($types === []) {
            return ['items' => [], 'total' => 0];
        }

        // One %s per post type; the values themselves are prepared below.
        $typeList = implode(', ', array_fill(0, \count($types), '%s'));
        $where    = "p.post_type IN ({$typeList})
            AND p.post_status NOT IN ('trash', 'auto-draft', 'inherit')
            AND (
                p.post_content LIKE %s
                OR EXISTS (
                    SELECT 1 FROM {$wpdb->postmeta} m
                    WHERE m.post_id = p.ID AND m.meta_key = %s AND m.meta_value NOT IN ('', '{}', '[]')
                )
            )";
        $args     = array_merge($types, ['%' . $wpdb->esc_like(self::CONTENT_MARKER) . '%', PostStyles::META_STYLES]);

        // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- $where holds only placeholders; the admin tool needs fresh data.
        $total = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->posts} p WHERE {$where}", $args));
        $ids   = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT p.ID FROM {$wpdb->posts} p WHERE {$where} ORDER BY p.post_modified DESC LIMIT %d OFFSET %d",
                array_merge($args, [$perPage, ($page - 1) * $perPage])
            )
        );
        // phpcs:enable

        $items = [];

        foreach ($ids as $id) {
            $post = get_post((int) $id);

            if ($post instanceof WP_Post) {
                $items[] = self::item($post);
            }
        }

        return ['items' => $items, 'total' => $total];
    }

    /**
     * Removes a post's post style and block styles. A revision of the post is saved first, so the
     * styles can be restored from the post's revisions.
     *
     * @param int $postId post ID
     *
     * @return array{revisionId: int|null}|null null when the post does not exist
     */
    public static function remove($postId)
    {
        $post = get_post($postId);

        if (!$post instanceof WP_Post) {
            return null;
        }

        $revisionId = self::saveRevision($post);
        $blocks     = parse_blocks($post->post_content);

        delete_post_meta($post->ID, PostStyles::META_STYLES);

        if (BlockStyles::count($blocks) > 0) {
            // wp_update_post() expects slashed data.
            wp_update_post(wp_slash(['ID' => $post->ID, 'post_content' => serialize_blocks(BlockStyles::strip($blocks))]));
        }

        return ['revisionId' => $revisionId];
    }

    /**
     * A row of the Overrides list.
     *
     * @param WP_Post $post post
     *
     * @return array<string, mixed>
     */
    private static function item(WP_Post $post)
    {
        $type   = get_post_type_object($post->post_type);
        $status = get_post_status_object($post->post_status);

        return [
            'id'          => $post->ID,
            'title'       => get_the_title($post),
            'type'        => $type ? $type->labels->singular_name : $post->post_type,
            'status'      => $status ? $status->label : $post->post_status,
            'editUrl'     => (string) get_edit_post_link($post->ID, 'raw'),
            'viewUrl'     => (string) get_permalink($post),
            'postStyles'  => \count(PostStyles::get($post->ID)),
            'blockStyles' => BlockStyles::count(parse_blocks($post->post_content)),
            'modified'    => (string) get_post_modified_time('c', false, $post),
        ];
    }

    /**
     * Saves a revision of the post as it is now, even when the latest revision is the same.
     * Post styles are part of revisions (PostStyles registers them with revisions_enabled).
     * Also used by GutenStyle Pro's Style Inspector before it changes a block.
     *
     * @param WP_Post $post post
     *
     * @return int|null revision ID, or null when the post type keeps no revisions
     */
    public static function saveRevision(WP_Post $post)
    {
        if (!wp_revisions_enabled($post)) {
            return null;
        }

        add_filter('wp_save_post_revision_check_for_changes', '__return_false');
        $revisionId = wp_save_post_revision($post->ID);
        remove_filter('wp_save_post_revision_check_for_changes', '__return_false');

        return \is_int($revisionId) && $revisionId > 0 ? $revisionId : null;
    }
}
