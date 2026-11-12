import { __ } from '@wordpress/i18n'

import SettingRow from '../SettingRow'
import { KeyIcon, PlugIcon, PuzzleIcon, SparkIcon, TransferIcon } from '../settingsIcons'
import ProBadge from '../upgrade/ProBadge'
import UpgradeCard from '../upgrade/UpgradeCard'
import UpgradeLink from '../upgrade/UpgradeLink'
import { type SettingsSection } from './types'

/**
 * The free plugin lists every GutenStyle Pro section with a PRO tag. Opening one shows what it does and
 * an upgrade link; there is no Pro code here (WordPress.org rules).
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const planSections = (): SettingsSection[] => [
  {
    badge: <ProBadge />,
    icon: PuzzleIcon,
    id: 'third-party',
    label: __('Third-party blocks', 'guten-style'),
    render: () => (
      <UpgradeCard
        description={__('Support for blocks from popular block plugins is coming to GutenStyle Pro.', 'guten-style')}
        features={['GenerateBlocks', 'Kadence Blocks', 'Spectra', 'Stackable']}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: SparkIcon,
    id: 'ai',
    label: __('AI assistant', 'guten-style'),
    render: () => (
      <UpgradeCard
        description={__('Create and fix styles with AI. You use your own key from an AI provider and pay the provider directly.', 'guten-style')}
        features={[
          __('Create a block style from a short description.', 'guten-style'),
          __('Get help with Style Health issues.', 'guten-style'),
          __('Build a design system from your website address.', 'guten-style'),
          __('Works with OpenAI, Anthropic, Gemini, Grok, DeepSeek, Mistral, OpenRouter and Ollama.', 'guten-style'),
          __('AI only suggests. Nothing changes until you apply it.', 'guten-style')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: PlugIcon,
    id: 'mcp',
    label: __('MCP connection', 'guten-style'),
    render: () => (
      <UpgradeCard
        description={__('Let AI apps such as Claude, Cursor and VS Code read and change your styles.', 'guten-style')}
        features={[
          __('Apps sign in with a WordPress application password.', 'guten-style'),
          __('Choose read only, make changes, or ask before each change.', 'guten-style'),
          __('See the connected apps and disconnect them at any time.', 'guten-style')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: TransferIcon,
    id: 'import-export',
    label: __('Import & Export', 'guten-style'),
    render: () => (
      <UpgradeCard
        description={__('Move your styles to another site.', 'guten-style')}
        features={[
          __('Export global styles, presets, the design system and settings to a .json file.', 'guten-style'),
          __('Import a file from another site by drag and drop.', 'guten-style'),
          __('Merge the imported styles with yours, or replace yours.', 'guten-style')
        ]}
      />
    )
  }
]

/** The License section, shown last (after Settings › Advanced). */
export const licenseSection = (): SettingsSection => ({
  icon: KeyIcon,
  id: 'license',
  label: __('License', 'guten-style'),
  render: () => (
    <SettingRow
      description={__('Pro adds 12 more blocks, a design system, style tools and an AI assistant.', 'guten-style')}
      icon={KeyIcon}
      title={__('You use GutenStyle Free', 'guten-style')}
    >
      <div className="flex justify-end">
        <UpgradeLink primary />
      </div>
    </SettingRow>
  )
})
