import { Button, Notice } from '@wordpress/components'
import { __ } from '@wordpress/i18n'

import { type StyleValues } from '../shared/schema'
import { firstRowAsHeader, hasHeaderStyles, type TableRow } from './tableHeader'

interface TableHeaderNoticeProps {
  body?: TableRow[]
  /** Effective values for this table (global, post and block merged). */
  effective: StyleValues
  head?: TableRow[]
  setAttributes: (attributes: Record<string, unknown>) => void
}

/**
 * Header settings only style a real header row. Explains why they have no effect on a
 * table without one, and offers to turn the first row into the header.
 */
export default function TableHeaderNotice({ body = [], effective, head = [], setAttributes }: TableHeaderNoticeProps) {
  if (head.length > 0 || !hasHeaderStyles(effective)) return null

  const canConvert = body.length >= 2

  return (
    <Notice className="gs-block-panel__notice" isDismissible={false} status="warning">
      <p>{__('This table has no header row. Header styles apply only to a header row.', 'guten-style')}</p>
      {canConvert ? (
        <Button onClick={() => setAttributes(firstRowAsHeader(body))} size="compact" variant="secondary">
          {__('Make first row the header', 'guten-style')}
        </Button>
      ) : (
        <p>{__('Turn on Header section in the Settings tab.', 'guten-style')}</p>
      )}
    </Notice>
  )
}
