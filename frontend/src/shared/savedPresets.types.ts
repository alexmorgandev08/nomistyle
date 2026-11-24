import { type Preset, type StyleValues } from './schema'

/** Presets that users saved (Nomi Style Pro). The free build has none. */
export interface SavedPresetsApi {
  presets: Preset[]
  remove: (id: string) => Promise<void>
  save: (label: string, values: StyleValues) => Promise<Preset>
}
