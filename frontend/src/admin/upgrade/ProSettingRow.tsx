import { type ReactNode } from 'react'

import SettingRow from '../SettingRow'
import ProBadge from './ProBadge'
import UpgradeLink from './UpgradeLink'

interface ProSettingRowProps {
  description: string
  icon?: ReactNode
  title: string
}

/** A GutenStyle Pro setting shown in the free plugin: dimmed, with a PRO tag and an upgrade link. */
export default function ProSettingRow({ description, icon, title }: ProSettingRowProps) {
  return (
    <SettingRow badge={<ProBadge />} description={description} icon={icon} muted title={title}>
      <div className="flex justify-end">
        <UpgradeLink />
      </div>
    </SettingRow>
  )
}
