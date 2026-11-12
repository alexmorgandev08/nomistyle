import { __ } from '@wordpress/i18n'

/** A small PRO tag: marks a GutenStyle Pro feature in the free plugin. */
export default function ProBadge() {
  return (
    <span className="gs-pro-badge" title={__('Available in GutenStyle Pro', 'guten-style')}>
      {__('Pro', 'guten-style')}
    </span>
  )
}
