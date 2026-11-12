import { type SavePresetAction, type SavePresetActionArgs } from './savePresetAction.types'

/** "Save as preset" in the ⋯ menu: not in the free plugin. GutenStyle Pro replaces this module. */
export const useSavePresetAction = (_args: SavePresetActionArgs): SavePresetAction => ({ actionsFor: () => [], dialog: null })
