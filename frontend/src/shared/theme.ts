import { useSyncExternalStore } from 'react'

/**
 * Light or dark look for the Block Style screens (admin page and editor panel).
 * A per-user convenience kept in localStorage; the first visit follows the system setting.
 */
export type UiTheme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'gutenstyle:theme'

/** Browser storage; undefined when the browser blocks it. Tests pass their own. */
function defaultStorage(): Storage | undefined {
  try {
    return window.localStorage ?? undefined
  } catch {
    return undefined
  }
}

const systemTheme = (): UiTheme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'

export function readTheme(storage = defaultStorage()): UiTheme {
  try {
    const saved = storage?.getItem(THEME_STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // Blocked storage: fall back to the system setting.
  }
  return systemTheme()
}

const listeners = new Set<() => void>()
let current: UiTheme | undefined

export function setTheme(theme: UiTheme, storage = defaultStorage()): void {
  current = theme
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The choice then lasts until the page reloads.
  }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // A change in another tab (e.g. the admin page while the editor is open) applies here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return
    current = readTheme()
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const snapshot = (): UiTheme => (current ??= readTheme())

/** The current theme, shared by every Block Style screen on the page. */
export function useUiTheme(): [UiTheme, (theme: UiTheme) => void] {
  const theme = useSyncExternalStore(subscribe, snapshot, () => 'dark' as UiTheme)
  return [theme, next => setTheme(next)]
}

/** Class names for a Block Style UI root in the given theme. */
export const themeClass = (theme: UiTheme): string => (theme === 'light' ? 'gs-ui is-light' : 'gs-ui')
