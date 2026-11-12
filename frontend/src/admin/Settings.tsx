import { __ } from '@wordpress/i18n'
import { type Config } from './data'
import BlockEditorSection from './settings/BlockEditorSection'
import ForceStyleSection from './settings/ForceStyleSection'
import AdvancedSection from './settings/AdvancedSection'
import { licenseSection, planSections } from './settings/planSections'
import SectionPage from './SectionPage'
import ResponsiveSection from './settings/ResponsiveSection'
import ThemeSection from './settings/ThemeSection'
import { type SettingsSection } from './settings/types'
import WhereItApplies from './settings/WhereItApplies'
import { AdvancedIcon, DevicesIcon, ForceIcon, LayersIcon, ScopeIcon, ThemeIcon } from './settingsIcons'

interface SettingsProps {
  config: Config
  onChange: (config: Config) => void
}

/** Sections in both plans. */
const CORE_SECTIONS: SettingsSection[] = [
  { icon: ScopeIcon, id: 'scope', label: __('Where it applies', 'guten-style'), render: props => <WhereItApplies {...props} /> },
  { icon: ForceIcon, id: 'force', label: __('Force Style', 'guten-style'), render: props => <ForceStyleSection {...props} /> },
  { icon: DevicesIcon, id: 'responsive', label: __('Responsive', 'guten-style'), render: props => <ResponsiveSection {...props} /> },
  { icon: LayersIcon, id: 'editor', label: __('Block editor', 'guten-style'), render: props => <BlockEditorSection {...props} /> },
  { icon: ThemeIcon, id: 'theme', label: __('Theme', 'guten-style'), render: props => <ThemeSection {...props} /> }
]

const ADVANCED_SECTION: SettingsSection = {
  icon: AdvancedIcon,
  id: 'advanced',
  label: __('Advanced', 'guten-style'),
  render: props => <AdvancedSection {...props} />
}

/** Order from the spec: core sections, the plan's feature sections, Advanced, then License. */
const SECTIONS = [...CORE_SECTIONS, ...planSections(), ADVANCED_SECTION, licenseSection()]

/** Settings: a section list on the left, the open section on the right. The section is in the URL (#/settings/license). */
export default function Settings({ config, onChange }: SettingsProps) {
  return (
    <SectionPage
      basePath="settings"
      idPrefix="gs-settings"
      navLabel={__('Settings sections', 'guten-style')}
      sections={SECTIONS}
      title={__('Settings', 'guten-style')}
    >
      {section => section.render({ config, onChange })}
    </SectionPage>
  )
}
