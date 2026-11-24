import { __ } from '@wordpress/i18n'

import SettingRow from '../SettingRow'
import { KeyIcon, PlugIcon, PuzzleIcon, SparkIcon, TransferIcon } from '../settingsIcons'
import ProBadge from '../upgrade/ProBadge'
import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'
import UpgradeCard from '../upgrade/UpgradeCard'
import UpgradeLink from '../upgrade/UpgradeLink'
import { type SettingsSection } from './types'

/**
 * The free plugin lists every Nomi Style Pro section with a PRO tag. Opening one shows what it does and
 * an upgrade link; there is no Pro code here (WordPress.org rules).
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const planSections = (): SettingsSection[] => !SHOW_PRO_FEATURES ? [] : [
  {
    badge: <ProBadge />,
    icon: PuzzleIcon,
    id: 'third-party',
    label: __('Third-party blocks', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Support for blocks from popular block plugins is coming to Nomi Style Pro.', 'nomistyle')}
        features={['GenerateBlocks', 'Kadence Blocks', 'Spectra', 'Stackable']}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: SparkIcon,
    id: 'ai',
    label: __('AI assistant', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Create and fix styles with AI. You use your own key from an AI provider and pay the provider directly.', 'nomistyle')}
        features={[
          __('Create a block style from a short description.', 'nomistyle'),
          __('Get help with Style Health issues.', 'nomistyle'),
          __('Build a design system from your website address.', 'nomistyle'),
          __('Works with OpenAI, Anthropic, Gemini, Grok, DeepSeek, Mistral, OpenRouter and Ollama.', 'nomistyle'),
          __('AI only suggests. Nothing changes until you apply it.', 'nomistyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: PlugIcon,
    id: 'mcp',
    label: __('MCP connection', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Let AI apps such as Claude, Cursor and VS Code read and change your styles.', 'nomistyle')}
        features={[
          __('Apps sign in with a WordPress application password.', 'nomistyle'),
          __('Choose read only, make changes, or ask before each change.', 'nomistyle'),
          __('See the connected apps and disconnect them at any time.', 'nomistyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: TransferIcon,
    id: 'import-export',
    label: __('Import & Export', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Move your styles to another site.', 'nomistyle')}
        features={[
          __('Export global styles, presets, the design system and settings to a .json file.', 'nomistyle'),
          __('Import a file from another site by drag and drop.', 'nomistyle'),
          __('Merge the imported styles with yours, or replace yours.', 'nomistyle')
        ]}
      />
    )
  }
]

/** The License section, shown last (after Settings › Advanced). */
export const licenseSection = (): SettingsSection | null => !SHOW_PRO_FEATURES ? null : ({
  icon: KeyIcon,
  id: 'license',
  label: __('License', 'nomistyle'),
  render: () => (
    <SettingRow
      description={__('Pro adds 12 more blocks, a design system, style tools and an AI assistant.', 'nomistyle')}
      icon={KeyIcon}
      title={__('You use Nomi Style Free', 'nomistyle')}
    >
      <div className="flex justify-end">
        <UpgradeLink primary />
      </div>
    </SettingRow>
  )
})
