import { describe, expect, it } from 'vitest'

import { deviceKeys } from './deviceKeys'

describe('device keys', () => {
  it('uses only the free controls', () => {
    expect(deviceKeys('list', { deviceValues: true })).toEqual([])
    expect(deviceKeys('heading', undefined)).toEqual(['h2FontSize', 'h3FontSize', 'h4FontSize'])
  })
})
