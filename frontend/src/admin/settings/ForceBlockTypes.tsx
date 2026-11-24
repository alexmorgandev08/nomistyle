import { __ } from '@wordpress/i18n'

import { BlocksIcon } from '../settingsIcons'
import ProSettingRow from '../upgrade/ProSettingRow'
import { type SectionProps } from './types'

/** Nomi Style Pro's per-block Force Style, shown in the free plugin as an upgrade. */
export default function ForceBlockTypes(_props: SectionProps) {
  return (
    <ProSettingRow
      description={__('Give Nomi Style priority only for the block types that your theme overrides.', 'nomistyle')}
      icon={BlocksIcon}
      title={__('Force only some block types', 'nomistyle')}
    />
  )
}
