import { describe, expect, it } from 'vitest'

import {
  breakpointsFromQueries,
  defaultLevel,
  editableLevels,
  type EditorOptions,
  isValidBreakpoints,
  isValidContentSelector,
  mediaQueriesFor,
  visiblePalette
} from './settings'

const ALL_ON: EditorOptions = { allowBlockStyles: true, allowPostStyles: true, roles: [], showSource: true }

describe('breakpoints', () => {
  it('builds the same media queries as PHP (WordPress core format)', () => {
    expect(mediaQueriesFor({ mobile: 480, tablet: 782 }, {})).toEqual({
      mobile: '@media (width <= 480px)',
      tablet: '@media (480px < width <= 782px)'
    })
  })

  it("uses the theme's media queries without custom breakpoints", () => {
    const theme = { mobile: '@media (width <= 600px)' }
    expect(mediaQueriesFor(null, theme)).toBe(theme)
  })

  it('reads the widths back from WordPress core media queries', () => {
    expect(breakpointsFromQueries(mediaQueriesFor({ mobile: 600, tablet: 1024 }, {}))).toEqual({ mobile: 600, tablet: 1024 })
    expect(breakpointsFromQueries({ tablet: '@media (max-width: 900px)' })).toBeNull()
  })

  it.each([
    [{ mobile: 480, tablet: 782 }, true],
    [{ mobile: 480, tablet: 480 }, false],
    [{ mobile: 200, tablet: 782 }, false],
    [{ mobile: 480, tablet: 5000 }, false],
    [{ mobile: 480.5, tablet: 782 }, false]
  ])('validates %o as %s, like PHP', (breakpoints, valid) => {
    expect(isValidBreakpoints(breakpoints)).toBe(valid)
  })
})

describe('editor levels', () => {
  it('offers every level and opens on this block by default', () => {
    expect(editableLevels(ALL_ON)).toEqual(['global', 'post', 'block'])
    expect(defaultLevel(editableLevels(ALL_ON))).toBe('block')
  })

  it('drops levels that Settings does not allow', () => {
    expect(editableLevels({ ...ALL_ON, allowBlockStyles: false })).toEqual(['global', 'post'])
    expect(defaultLevel(['global', 'post'])).toBe('post')
    expect(defaultLevel(editableLevels({ ...ALL_ON, allowBlockStyles: false, allowPostStyles: false }))).toBe('global')
  })
})

describe('theme colors', () => {
  it('hides the theme palette when turned off', () => {
    const palette = [{ color: '#000', name: 'Black' }]
    expect(visiblePalette(palette, true)).toEqual(palette)
    expect(visiblePalette(palette, false)).toEqual([])
  })

  it('puts brand colors first and keeps them when theme colors are off', () => {
    const palette = [{ color: '#000', name: 'Black' }]
    const brand = [{ color: 'var(--gs-c-primary)', name: 'Primary' }]
    expect(visiblePalette(palette, true, brand)).toEqual([...brand, ...palette])
    expect(visiblePalette(palette, false, brand)).toEqual(brand)
  })
})

describe('content selector', () => {
  it.each(['', '.entry-content', '#main article', '[data-content=post]', 'main:is(.post)', '.site > .content ~ .wrap + div'])(
    'accepts %s, like PHP',
    selector => expect(isValidContentSelector(selector)).toBe(true)
  )

  it.each(['.x{} body{display:none}', '.x;color:red', '@import url(x)', '[data-x="y"]', '.a, .b', '</style><script>', '.a/* x */', '.a'.repeat(101)])(
    'rejects %s, like PHP',
    selector => expect(isValidContentSelector(selector)).toBe(false)
  )
})
