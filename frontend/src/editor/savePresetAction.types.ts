import { type ReactNode } from 'react'

import { type StyleValues } from '../shared/schema'
import { type StyleMenuAction } from './StyleMenu'

export interface SavePresetActionArgs {
  /** Users whose role may not edit styles cannot save presets. */
  canSave: boolean
  onSave: (label: string, values: StyleValues) => Promise<unknown>
}

export interface SavePresetAction {
  /** Menu actions for a block whose current look (global, post and block merged) is `values`. */
  actionsFor: (values: StyleValues) => StyleMenuAction[]
  /** The name dialog, rendered by the panel; null when closed. */
  dialog: ReactNode
}
