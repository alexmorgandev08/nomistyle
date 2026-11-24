import { type StyleValues } from '../shared/schema'
import { knownValues } from '../shared/values'

/**
 * Copy / paste of a block's Nomi Style settings. Stored in localStorage so a style
 * can be pasted in another post; reading always re-validates against the schema.
 */
export const STORAGE_KEY = 'gutenstyle:clipboard'

export interface CopiedStyle {
  type: string
  values: StyleValues
}

/** Browser storage; undefined when the browser blocks it. Tests pass their own. */
function defaultStorage(): Storage | undefined {
  try {
    return window.localStorage ?? undefined
  } catch {
    return undefined
  }
}

export function copyStyle(type: string, values: StyleValues, storage = defaultStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ type, values }))
  } catch {
    // Storage can be full or blocked; copying then simply does nothing.
  }
}

/** The copied style, only when it was copied from the same block type. */
export function readCopiedStyle(type: string, storage = defaultStorage()): CopiedStyle | null {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null') as Partial<CopiedStyle> | null
    if (!parsed || parsed.type !== type) return null
    return { type, values: knownValues(type, parsed.values) }
  } catch {
    return null
  }
}
