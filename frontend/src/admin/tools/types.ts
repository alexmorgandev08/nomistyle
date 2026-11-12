import { type ReactNode } from 'react'

/** One Tools page entry: an item in the tool list and the content shown when it is open. */
export interface ToolSection {
  /** Shown after the label, e.g. a PRO tag. */
  badge?: ReactNode
  icon: ReactNode
  /** Part of the URL: #/tools/<id>. */
  id: string
  label: string
  render: () => ReactNode
}
