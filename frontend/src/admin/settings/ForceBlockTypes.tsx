import { __ } from '@wordpress/i18n'

import { BlocksIcon } from '../settingsIcons'
import ProSettingRow from '../upgrade/ProSettingRow'
import { type SectionProps } from './types'

/** Block Style Pro's per-block Force Style, shown in the free plugin as an upgrade. */
export default function ForceBlockTypes(_props: SectionProps) {
  return (
    <ProSettingRow
      description={__('Give Block Style priority only for the block types that your theme overrides.', 'blockstyle')}
      icon={BlocksIcon}
      title={__('Force only some block types', 'blockstyle')}
    />
  )
}
