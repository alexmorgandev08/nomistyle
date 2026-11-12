import { create } from 'zustand'

import { adminData, type Config } from './data'

interface ConfigState {
  /** Unsaved edits, shown everywhere in the admin app. */
  draft: Config
  /** Last config the server confirmed. */
  saved: Config
  discard: () => void
  markSaved: (config: Config) => void
  setDraft: (config: Config) => void
}

/** The plugin config being edited. Shared by the header (save, discard) and every page. */
export const useConfigStore = create<ConfigState>()(set => ({
  discard: () => set(state => ({ draft: state.saved })),
  draft: adminData.config,
  markSaved: config => set({ draft: config, saved: config }),
  saved: adminData.config,
  setDraft: draft => set({ draft })
}))

export const useIsDirty = () => useConfigStore(state => JSON.stringify(state.saved) !== JSON.stringify(state.draft))
