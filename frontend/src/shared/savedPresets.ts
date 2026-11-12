import { type SavedPresetsApi } from './savedPresets.types'

const unavailable = () => Promise.reject(new Error('Saved presets need GutenStyle Pro.'))

/** Presets that users saved, for a block type: none in the free plugin. GutenStyle Pro replaces this module. */
export const useSavedPresets = (_type: string): SavedPresetsApi => ({ presets: [], remove: unavailable, save: unavailable })

export { type SavedPresetsApi } from './savedPresets.types'
