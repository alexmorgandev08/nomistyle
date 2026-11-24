import { __ } from '@wordpress/i18n'

import { AccessibilityIcon, HealthIcon, HistoryIcon, SearchIcon } from '../settingsIcons'
import ProBadge from '../upgrade/ProBadge'
import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'
import UpgradeCard from '../upgrade/UpgradeCard'
import { type ToolSection } from './types'

/**
 * The free plugin lists the Nomi Style Pro tools with a PRO tag. Opening one shows what it does and an
 * upgrade link; there is no Pro code here (WordPress.org rules).
 * A function, not a module-level array: top-level __() calls would keep this file in the Pro build.
 */
export const proTools = (): ToolSection[] => !SHOW_PRO_FEATURES ? [] : [
  {
    badge: <ProBadge />,
    icon: HealthIcon,
    id: 'health',
    label: __('Style Health', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Get a score from 0 to 100 for your styles, and suggestions to make them better.', 'nomistyle')}
        features={[
          __('See scores for consistency, overrides, readability and cleanup.', 'nomistyle'),
          __('Compare each suggestion before and after you apply it.', 'nomistyle'),
          __('Fix a problem with one click, or ignore it. You can undo each fix.', 'nomistyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: SearchIcon,
    id: 'inspector',
    label: __('Style Inspector', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Select a post and see which style each block uses: theme, global, post or block.', 'nomistyle')}
        features={[
          __('Find properties that the theme overrides.', 'nomistyle'),
          __('Fix them with Force Style. You can undo each fix.', 'nomistyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: AccessibilityIcon,
    id: 'accessibility',
    label: __('Accessibility', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('Find styles that make your content hard to read or use.', 'nomistyle')}
        features={[
          __('Find low contrast, very small text, hard-to-read tables and missing focus outlines.', 'nomistyle'),
          __('See a sample of each problem and fix it with one click.', 'nomistyle'),
          __('Change the checks, for example the minimum text size.', 'nomistyle')
        ]}
      />
    )
  },
  {
    badge: <ProBadge />,
    icon: HistoryIcon,
    id: 'history',
    label: __('Style history', 'nomistyle'),
    render: () => (
      <UpgradeCard
        description={__('See each change to your global styles, with the values before and after.', 'nomistyle')}
        features={[
          __('Restore any earlier version.', 'nomistyle'),
          __('Approve or reject changes from connected AI apps.', 'nomistyle')
        ]}
      />
    )
  }
]
