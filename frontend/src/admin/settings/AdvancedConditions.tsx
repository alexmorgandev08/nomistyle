import { __ } from '@wordpress/i18n'

import { FilterIcon } from '../settingsIcons'
import ProSettingRow from '../upgrade/ProSettingRow'
import { type SectionProps } from './types'

/** GutenStyle Pro's advanced conditions, shown in the free plugin as an upgrade. */
export default function AdvancedConditions(_props: SectionProps) {
  return (
    <ProSettingRow
      description={__('Apply styles only to posts in some categories or tags, or by some authors. Custom taxonomies are supported.', 'guten-style')}
      icon={FilterIcon}
      title={__('Advanced conditions', 'guten-style')}
    />
  )
}
