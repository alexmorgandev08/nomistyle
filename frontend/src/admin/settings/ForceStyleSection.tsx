import { __ } from '@wordpress/i18n'

import { ForceIcon } from '../settingsIcons'
import ForceBlockTypes from './ForceBlockTypes'
import SwitchRow from './SwitchRow'
import { type SectionProps } from './types'

/** Force Style: one switch for every block, and (Pro) a choice of block types. */
export default function ForceStyleSection({ config, onChange }: SectionProps) {
  return (
    <>
      <SwitchRow
        checked={config.forceStyle}
        description={__('Use this if your theme or another plugin is overriding the Nomi Style design. It gives GutenStyle\'s settings priority by marking them !important.', 'nomistyle')}
        icon={ForceIcon}
        onChange={forceStyle => onChange({ ...config, forceStyle })}
        title={__('Force Nomi Style', 'nomistyle')}
      />
      <ForceBlockTypes config={config} onChange={onChange} />
    </>
  )
}
