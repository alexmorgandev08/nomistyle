import { __ } from '@wordpress/i18n'

import SectionPage from './SectionPage'
import { OverridesIcon } from './settingsIcons'
import OverridesTool from './tools/OverridesTool'
import { proTools } from './tools/proTools'
import { type ToolSection } from './tools/types'

const OVERRIDES: ToolSection = {
  icon: OverridesIcon,
  id: 'overrides',
  label: __('Overrides', 'nomistyle'),
  render: () => <OverridesTool />
}

const TOOLS = [OVERRIDES, ...proTools()]

/** Tools: a tool list on the left, the open tool on the right. The tool is in the URL (#/tools/overrides). */
export default function Tools() {
  return (
    <SectionPage
      basePath="tools"
      idPrefix="gs-tools"
      navLabel={__('Tools', 'nomistyle')}
      sections={TOOLS}
      title={__('Tools', 'nomistyle')}
    >
      {tool => tool.render()}
    </SectionPage>
  )
}
