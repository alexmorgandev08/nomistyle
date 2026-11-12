import { __ } from '@wordpress/i18n'

import { DevicesIcon } from '../settingsIcons'
import ProSettingRow from '../upgrade/ProSettingRow'
import { type SectionProps } from './types'

/** GutenStyle Pro's extra device values, shown in the free plugin as an upgrade. */
export default function DeviceValues(_props: SectionProps) {
  return (
    <ProSettingRow
      description={__('Set different spacing, padding and corner radius for tablet and mobile.', 'guten-style')}
      icon={DevicesIcon}
      title={__('Device values for spacing, padding and radius', 'guten-style')}
    />
  )
}
