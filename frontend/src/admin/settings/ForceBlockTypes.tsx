import { __ } from '@wordpress/i18n'

import { BlocksIcon } from '../settingsIcons'
import ProSettingRow from '../upgrade/ProSettingRow'
import { type SectionProps } from './types'

/** GutenStyle Pro's per-block Force Style, shown in the free plugin as an upgrade. */
export default function ForceBlockTypes(_props: SectionProps) {
  return (
    <ProSettingRow
      description={__('Give GutenStyle priority only for the block types that your theme overrides.', 'guten-style')}
      icon={BlocksIcon}
      title={__('Force only some block types', 'guten-style')}
    />
  )
}
