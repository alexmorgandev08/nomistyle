import { type ReactNode } from 'react'

import SettingRow from '../SettingRow'
import ProBadge from './ProBadge'
import { SHOW_PRO_FEATURES } from './showProFeatures'
import UpgradeLink from './UpgradeLink'

interface ProSettingRowProps {
  description: string
  icon?: ReactNode
  title: string
}

/** A Block Style Pro setting shown in the free plugin: dimmed, with a PRO tag and an upgrade link. */
export default function ProSettingRow({ description, icon, title }: ProSettingRowProps) {
  if (!SHOW_PRO_FEATURES) return null

  return (
    <SettingRow badge={<ProBadge />} description={description} icon={icon} muted title={title}>
      <div className="flex justify-end">
        <UpgradeLink />
      </div>
    </SettingRow>
  )
}
