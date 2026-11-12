import { __ } from '@wordpress/i18n'

import UpgradeCard from '../upgrade/UpgradeCard'

/** The Design System tab in the free plugin: what GutenStyle Pro adds, and an upgrade link. */
export default function DesignSystem() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <UpgradeCard
        description={__('Define your brand once and use it in every block.', 'guten-style')}
        features={[
          __('Up to 20 brand colors with names. They come first in every color picker.', 'guten-style'),
          __('Heading, body and code fonts from Google Fonts, hosted on your own site.', 'guten-style'),
          __('Small, medium and large steps for spacing and corner radius.', 'guten-style'),
          __('A contrast check for color pairs and a live sample.', 'guten-style')
        ]}
        title={__('Design System', 'guten-style')}
      />
    </div>
  )
}
