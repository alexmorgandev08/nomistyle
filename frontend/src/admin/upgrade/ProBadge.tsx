import { __ } from '@wordpress/i18n'

/** A small PRO tag: marks a Nomi Style Pro feature in the free plugin. */
export default function ProBadge() {
  return (
    <span className="gs-pro-badge" title={__('Available in Nomi Style Pro', 'nomistyle')}>
      {__('Pro', 'nomistyle')}
    </span>
  )
}
