import { beforeEach, describe, expect, it, vi } from 'vitest'

import { readTheme, setTheme, THEME_STORAGE_KEY, themeClass } from './theme'

function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    clear: () => items.clear(),
    getItem: key => items.get(key) ?? null,
    key: index => [...items.keys()][index] ?? null,
    get length() {
      return items.size
    },
    removeItem: key => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value))
  }
}

const prefersLight = (light: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: light && query.includes('light') }))

describe('ui theme', () => {
  let storage: Storage
  beforeEach(() => {
    storage = memoryStorage()
    vi.unstubAllGlobals()
  })

  it('follows the system setting until the user picks one', () => {
    prefersLight(true)
    expect(readTheme(storage)).toBe('light')
    prefersLight(false)
    expect(readTheme(storage)).toBe('dark')
  })

  it('remembers the theme the user picked', () => {
    prefersLight(false)
    setTheme('light', storage)
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(readTheme(storage)).toBe('light')
  })

  it('ignores unknown stored values', () => {
    prefersLight(false)
    storage.setItem(THEME_STORAGE_KEY, 'neon')
    expect(readTheme(storage)).toBe('dark')
  })

  it('gives the light theme its own class', () => {
    expect(themeClass('dark')).toBe('gs-ui')
    expect(themeClass('light')).toBe('gs-ui is-light')
  })
})
