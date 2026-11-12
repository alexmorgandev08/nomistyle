import { type ReactNode } from 'react'

import { type Config } from '../data'

export interface SectionProps {
  config: Config
  onChange: (config: Config) => void
}

/** One Settings section: an entry in the section list and the content shown when it is open. */
export interface SettingsSection {
  /** Shown after the label, e.g. a PRO tag. */
  badge?: ReactNode
  icon: ReactNode
  /** Part of the URL: #/settings/<id>. */
  id: string
  label: string
  render: (props: SectionProps) => ReactNode
}
