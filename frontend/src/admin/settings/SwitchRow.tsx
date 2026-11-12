import { Switch } from 'antd'
import { type ReactNode, useId } from 'react'

import SettingRow from '../SettingRow'

interface SwitchRowProps {
  checked: boolean
  description: string
  icon?: ReactNode
  onChange: (checked: boolean) => void
  title: string
}

/** A setting that is on or off: the row's title names the switch for screen readers. */
export default function SwitchRow({ checked, description, icon, onChange, title }: SwitchRowProps) {
  const titleId = useId()

  return (
    <SettingRow description={description} icon={icon} title={title} titleId={titleId}>
      <div className="flex justify-end">
        <Switch aria-labelledby={titleId} checked={checked} onChange={onChange} />
      </div>
    </SettingRow>
  )
}
