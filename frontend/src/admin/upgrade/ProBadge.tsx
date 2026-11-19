import { __ } from '@wordpress/i18n'

/** A small PRO tag: marks a Block Style Pro feature in the free plugin. */
export default function ProBadge() {
  return (
    <span className="gs-pro-badge" title={__('Available in Block Style Pro', 'blockstyle')}>
      {__('Pro', 'blockstyle')}
    </span>
  )
}
