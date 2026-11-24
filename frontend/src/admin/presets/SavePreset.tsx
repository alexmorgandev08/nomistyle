import { __ } from '@wordpress/i18n'

import { type StyleValues } from '../../shared/schema'
import { adminData } from '../data'
import ProBadge from '../upgrade/ProBadge'
import { SHOW_PRO_FEATURES } from '../upgrade/showProFeatures'

export interface SavePresetProps {
  onSave: (label: string, values: StyleValues) => Promise<unknown>
  values: StyleValues
}

/** "Save as preset" is a Nomi Style Pro feature: the free plugin shows it as a link to the upgrade page. */
export default function SavePreset(_props: SavePresetProps) {
  if (!SHOW_PRO_FEATURES) return null

  return (
    <a className="inline-flex items-center gap-1.5 text-xs" href={adminData.upgradeUrl} rel="noopener noreferrer" target="_blank">
      {__('Save your own presets', 'nomistyle')}
      <ProBadge />
    </a>
  )
}
