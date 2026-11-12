import { describe, expect, it } from 'vitest'

import { type Preset } from './schema'
import { matchesPreset, presetStatus } from './values'

const preset: Preset = { id: 'pill', label: 'Pill', values: { background: '#111827', radius: '999px' } }

describe('matchesPreset', () => {
  it('matches the exact preset values', () => {
    expect(matchesPreset(preset, { background: '#111827', radius: '999px' })).toBe(true)
  })

  it('does not match once a value is changed, added or removed', () => {
    expect(matchesPreset(preset, { background: '#000000', radius: '999px' })).toBe(false)
    expect(matchesPreset(preset, { background: '#111827', radius: '999px', fontWeight: '700' })).toBe(false)
    expect(matchesPreset(preset, { background: '#111827' })).toBe(false)
  })

  it('does not match when the block has no values', () => {
    expect(matchesPreset(preset, undefined)).toBe(false)
    expect(matchesPreset(preset, {})).toBe(false)
  })
})

describe('presetStatus', () => {
  const clean: Preset = { id: 'clean', label: 'Clean', values: { radius: '8px' } }
  const modern: Preset = { id: 'modern', label: 'Modern', values: { headerBackground: '#0f172a', radius: '12px' } }

  it('names the preset that matches exactly', () => {
    expect(presetStatus([clean, modern], { radius: '8px' })).toEqual({ modified: false, preset: clean })
  })

  it('names the preset the user started from and then added to', () => {
    expect(presetStatus([clean, modern], { headerBackground: '#0f172a', radius: '12px', stripeColor: '#f1f5f9' })).toEqual({
      modified: true,
      preset: modern
    })
  })

  it('reports custom values when a preset setting itself was changed', () => {
    expect(presetStatus([clean, modern], { radius: '10px' })).toEqual({ modified: true, preset: undefined })
  })

  it('reports nothing when there are no values', () => {
    expect(presetStatus([clean, modern], {})).toEqual({ modified: false, preset: undefined })
  })
})
