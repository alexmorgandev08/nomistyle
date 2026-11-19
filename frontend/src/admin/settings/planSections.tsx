import { __ } from '@wordpress/i18n'

import SettingRow from '../SettingRow'
import { KeyIcon, PlugIcon, PuzzleIcon, SparkIcon, TransferIcon } from '../settingsIcons'
import ProBadge from '../upgrade/ProBadge'
import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'
import UpgradeCard from '../upgrade/UpgradeCard'
import UpgradeLink from '../upgrade/UpgradeLink'
import { type SettingsSection } from './types'

/**
 * The free plugin lists every Block Style Pro section with a PRO tag. Opening one shows what it does and
 * an upgrade link; there is no Pro code here (WordPress.org rules).
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const planSections = (): SettingsSection[] => !SHOW_PRO_FEATURES ? [] : [
  {
    badge: <ProBadge />,
    icon: PuzzleIcon,
    id: 'third-party',
    label: __('Third-party blocks', 'blockstyle'),
    render: () => (
      <UpgradeCard
        description={__('Support for blocks from popular block plugins is coming to Block Style Pro.', 'blockstyle')}
        features={['GenerateBlocks', 'Kadence Blocks', 'Spectra', 'Stackable']}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: SparkIcon,
    id: 'ai',
    label: __('AI assistant', 'blockstyle'),
    render: () => (
      <UpgradeCard
        description={__('Create and fix styles with AI. You use your own key from an AI provider and pay the provider directly.', 'blockstyle')}
        features={[
          __('Create a block style from a short description.', 'blockstyle'),
          __('Get help with Style Health issues.', 'blockstyle'),
          __('Build a design system from your website address.', 'blockstyle'),
          __('Works with OpenAI, Anthropic, Gemini, Grok, DeepSeek, Mistral, OpenRouter and Ollama.', 'blockstyle'),
          __('AI only suggests. Nothing changes until you apply it.', 'blockstyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: PlugIcon,
    id: 'mcp',
    label: __('MCP connection', 'blockstyle'),
    render: () => (
      <UpgradeCard
        description={__('Let AI apps such as Claude, Cursor and VS Code read and change your styles.', 'blockstyle')}
        features={[
          __('Apps sign in with a WordPress application password.', 'blockstyle'),
          __('Choose read only, make changes, or ask before each change.', 'blockstyle'),
          __('See the connected apps and disconnect them at any time.', 'blockstyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: TransferIcon,
    id: 'import-export',
    label: __('Import & Export', 'blockstyle'),
    render: () => (
      <UpgradeCard
        description={__('Move your styles to another site.', 'blockstyle')}
        features={[
          __('Export global styles, presets, the design system and settings to a .json file.', 'blockstyle'),
          __('Import a file from another site by drag and drop.', 'blockstyle'),
          __('Merge the imported styles with yours, or replace yours.', 'blockstyle')
        ]}
      />
    )
  }
]

/** The License section, shown last (after Settings › Advanced). */
export const licenseSection = (): SettingsSection | null => !SHOW_PRO_FEATURES ? null : ({
  icon: KeyIcon,
  id: 'license',
  label: __('License', 'blockstyle'),
  render: () => (
    <SettingRow
      description={__('Pro adds 12 more blocks, a design system, style tools and an AI assistant.', 'blockstyle')}
      icon={KeyIcon}
      title={__('You use Block Style Free', 'blockstyle')}
    >
      <div className="flex justify-end">
        <UpgradeLink primary />
      </div>
    </SettingRow>
  )
})
