import { type SavePresetAction, type SavePresetActionArgs } from './savePresetAction.types'

/** "Save as preset" in the ⋯ menu: not in the free plugin. Block Style Pro replaces this module. */
export const useSavePresetAction = (_args: SavePresetActionArgs): SavePresetAction => ({ actionsFor: () => [], dialog: null })
