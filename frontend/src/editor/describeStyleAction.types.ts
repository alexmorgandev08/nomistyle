import { type ReactNode } from 'react'

import { type StyleValues } from '../shared/schema'
import { type StyleMenuAction } from './StyleMenu'

export interface DescribeStyleArgs {
  /** Whether the level being edited can change (not the read-only global level). */
  canApply: boolean
  onApply: (values: StyleValues) => void
  type: string
}

export interface DescribeStyleAction {
  actions: StyleMenuAction[]
  /** The dialog, rendered by the panel; null when closed. */
  dialog: ReactNode
}
