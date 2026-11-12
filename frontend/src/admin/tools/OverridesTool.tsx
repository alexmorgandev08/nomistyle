import { __, _n, sprintf } from '@wordpress/i18n'
import { App, Button, Popconfirm, Table, type TableColumnsType } from 'antd'
import { useState } from 'react'

import { type OverridePost } from '../data'
import { useOverrides, useRemoveOverrides } from '../queries'

const PER_PAGE = 20

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/** A dash for none; translation tools need the literal _n() strings at each call, so they stay there. */
const NONE = '–'

/** Tools › Overrides: posts with a post style or block styles. Open a post, or remove its overrides. */
export default function OverridesTool() {
  const [page, setPage] = useState(1)
  const overrides = useOverrides(page, PER_PAGE)
  const remove = useRemoveOverrides()
  const { message } = App.useApp()

  const removePost = (post: OverridePost) =>
    remove.mutateAsync(post.id).then(
      ({ revisionId }) => {
        void message.success(
          revisionId
            ? __('Styles removed. To get them back, restore the last revision of the post.', 'guten-style')
            : __('Styles removed.', 'guten-style')
        )
        // The last row of a page is gone: show the page before it.
        if (overrides.data?.items.length === 1 && page > 1) setPage(page - 1)
      },
      () => void message.error(__('The styles were not removed. Try again.', 'guten-style'))
    )

  const columns: TableColumnsType<OverridePost> = [
    {
      key: 'title',
      render: (_, post) => (
        <div className="flex flex-col">
          <a className="font-medium" href={post.editUrl}>
            {post.title || __('(no title)', 'guten-style')}
          </a>
          <small className="opacity-70">
            {post.type} · {post.status}
          </small>
        </div>
      ),
      title: __('Post', 'guten-style')
    },
    {
      dataIndex: 'postStyles',
      render: (count: number) =>
        count > 0
          ? /* translators: %d: number of block types */
            sprintf(_n('%d block type', '%d block types', count, 'guten-style'), count)
          : NONE,
      title: __('Post style', 'guten-style')
    },
    {
      dataIndex: 'blockStyles',
      render: (count: number) =>
        count > 0
          ? /* translators: %d: number of blocks */
            sprintf(_n('%d block', '%d blocks', count, 'guten-style'), count)
          : NONE,
      title: __('Block styles', 'guten-style')
    },
    {
      dataIndex: 'modified',
      render: (modified: string) => dateFormat.format(new Date(modified)),
      title: __('Last edited', 'guten-style')
    },
    {
      align: 'right',
      key: 'actions',
      render: (_, post) => (
        <div className="flex justify-end gap-2">
          <Button href={post.viewUrl} rel="noopener noreferrer" size="small" target="_blank">
            {__('View', 'guten-style')}
          </Button>
          <Popconfirm
            description={__('This removes the post style and all block styles of this post. A revision is saved first.', 'guten-style')}
            okButtonProps={{ danger: true }}
            okText={__('Remove', 'guten-style')}
            onConfirm={() => removePost(post)}
            title={__('Remove the overrides?', 'guten-style')}
          >
            <Button color="danger" size="small" variant="outlined">
              {__('Remove', 'guten-style')}
            </Button>
          </Popconfirm>
        </div>
      ),
      title: <span className="sr-only">{__('Actions', 'guten-style')}</span>
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0">
        {__('These posts have a post style or block styles. These styles override your global styles. Remove them to use only the global styles.', 'guten-style')}
      </p>
      <Table<OverridePost>
        columns={columns}
        dataSource={overrides.data?.items}
        loading={overrides.isFetching}
        locale={{
          emptyText: overrides.isError
            ? __('The list did not load. Reload the page and try again.', 'guten-style')
            : __('No posts have overrides. All posts use the global styles.', 'guten-style')
        }}
        onChange={pagination => setPage(pagination.current ?? 1)}
        pagination={{ current: page, hideOnSinglePage: true, pageSize: PER_PAGE, showSizeChanger: false, total: overrides.data?.total }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </div>
  )
}
