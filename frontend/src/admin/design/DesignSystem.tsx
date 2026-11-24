import { __ } from '@wordpress/i18n'

import UpgradeCard from '../upgrade/UpgradeCard'

/** The Design System tab in the free plugin: what Nomi Style Pro adds, and an upgrade link. */
export default function DesignSystem() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <UpgradeCard
        description={__('Define your brand once and use it in every block.', 'nomistyle')}
        features={[
          __('Up to 20 brand colors with names. They come first in every color picker.', 'nomistyle'),
          __('Heading, body and code fonts from Google Fonts, hosted on your own site.', 'nomistyle'),
          __('Small, medium and large steps for spacing and corner radius.', 'nomistyle'),
          __('A contrast check for color pairs and a live sample.', 'nomistyle')
        ]}
        title={__('Design System', 'nomistyle')}
      />
    </div>
  )
}
