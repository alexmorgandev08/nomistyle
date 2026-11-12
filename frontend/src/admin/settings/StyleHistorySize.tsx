import { __ } from '@wordpress/i18n'

import { HistoryIcon } from '../settingsIcons'
import ProSettingRow from '../upgrade/ProSettingRow'
import { type SectionProps } from './types'

/** GutenStyle Pro's style history size, shown in the free plugin as an upgrade. */
export default function StyleHistorySize(_props: SectionProps) {
  return (
    <ProSettingRow
      description={__('Keep the last 5 to 100 changes to your global styles, and restore any of them.', 'guten-style')}
      icon={HistoryIcon}
      title={__('Style history size', 'guten-style')}
    />
  )
}
