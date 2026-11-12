import { beforeEach, describe, expect, it } from 'vitest'

import { copyStyle, readCopiedStyle, STORAGE_KEY } from './styleClipboard'

/** In-memory Storage, so the tests do not depend on the runtime's localStorage. */
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

describe('style clipboard', () => {
  let storage: Storage
  beforeEach(() => {
    storage = memoryStorage()
  })

  it('pastes a style copied from the same block type', () => {
    copyStyle('table', { headerBackground: '#111827', radius: '8px' }, storage)
    expect(readCopiedStyle('table', storage)).toEqual({ type: 'table', values: { headerBackground: '#111827', radius: '8px' } })
  })

  it('offers nothing for a different block type', () => {
    copyStyle('table', { radius: '8px' }, storage)
    expect(readCopiedStyle('quote', storage)).toBeNull()
  })

  it('drops values that are no longer valid', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ type: 'table', values: { headerBackground: 'url(x)', radius: '8px' } }))
    expect(readCopiedStyle('table', storage)?.values).toEqual({ radius: '8px' })
  })

  it('survives broken storage content', () => {
    storage.setItem(STORAGE_KEY, '{not json')
    expect(readCopiedStyle('table', storage)).toBeNull()
  })

  it('does nothing when storage is full or blocked', () => {
    const blocked = { ...memoryStorage(), getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('full') } }
    expect(() => copyStyle('table', { radius: '8px' }, blocked)).not.toThrow()
    expect(readCopiedStyle('table', blocked)).toBeNull()
  })
})
