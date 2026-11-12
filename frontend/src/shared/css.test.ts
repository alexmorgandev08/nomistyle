import { describe, expect, it } from 'vitest'

import cases from '../../../tests/fixtures/css-cases.json'
import { generateCss, type MediaQueries } from './css'
import { schema, type StyleValues } from './schema'
import { knownValues } from './values'

interface FixtureCase {
  expected: string
  important: boolean
  mediaQueries: MediaQueries
  name: string
  root: string
  type: string
  values: StyleValues
}

// Fixtures are produced by the PHP generator (scripts/generate-css-fixtures.php).
describe('generateCss matches the PHP generator', () => {
  it.each(cases as unknown as FixtureCase[])('$name', ({ expected, important, mediaQueries, root, type, values }) => {
    expect(generateCss(type, values, root, important, mediaQueries)).toBe(expected)
  })
})

describe('knownValues', () => {
  it('drops unknown keys and devices on non-responsive controls', () => {
    expect(
      knownValues('table', {
        'cellPaddingY@tablet': '10px',
        'headerBackground@mobile': '#000',
        bogus: '1',
        headerBackground: '#111'
      })
    ).toEqual({ 'cellPaddingY@tablet': '10px', headerBackground: '#111' })
  })

  it('drops values the PHP sanitizer would reject', () => {
    expect(
      knownValues('table', {
        cellPaddingY: '12',
        gridLines: 'diagonal',
        headerBackground: 'url(https://example.com/x.png)',
        headerTextColor: 'red;}</style>',
        radius: '500px'
      })
    ).toEqual({})
    expect(knownValues('table', { cellTextColor: 'var(--wp--preset--color--contrast)', radius: '0' })).toEqual({
      cellTextColor: 'var(--wp--preset--color--contrast)',
      radius: '0'
    })
  })

  it('keeps hover values only for hover-capable controls', () => {
    expect(knownValues('table', { 'headerBackground@hover': '#000000', 'radius@hover': '8px' })).toEqual({
      'headerBackground@hover': '#000000'
    })
  })

  it('every preset only uses known controls', () => {
    Object.entries(schema.blocks).forEach(([type, block]) => {
      block.presets.forEach(preset => {
        expect(knownValues(type, preset.values)).toEqual(preset.values)
      })
    })
  })
})
