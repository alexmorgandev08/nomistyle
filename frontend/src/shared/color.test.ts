import { describe, expect, it } from 'vitest'

import { formatColor, formatOf, hslToHsv, hsvToHsl, hsvToRgb, parseRgba, rgbToHsv } from './color'
import { isValidValue } from './values'

const colorControl = { key: 'color', label: 'Color', type: 'color' } as Parameters<typeof isValidValue>[0]

describe('parseRgba', () => {
  it('reads hex, rgb(), hsl(), names and transparent', () => {
    expect(parseRgba('#f00')).toEqual({ a: 1, b: 0, g: 0, r: 255 })
    expect(parseRgba('#ff000080')).toEqual({ a: 0.502, b: 0, g: 0, r: 255 })
    expect(parseRgba('rgba(10, 20, 30, 0.5)')).toEqual({ a: 0.5, b: 30, g: 20, r: 10 })
    expect(parseRgba('rgb(10 20 30 / 50%)')).toEqual({ a: 0.5, b: 30, g: 20, r: 10 })
    expect(parseRgba('hsl(120, 100%, 25%)')).toEqual({ a: 1, b: 0, g: 128, r: 0 })
    expect(parseRgba('AliceBlue')).toEqual({ a: 1, b: 255, g: 248, r: 240 })
    expect(parseRgba('transparent')?.a).toBe(0)
  })

  it('rejects values that are not a fixed color', () => {
    expect(parseRgba('currentColor')).toBeNull()
    expect(parseRgba('var(--wp--preset--color--contrast)')).toBeNull()
    expect(parseRgba('rgb(a, b, c)')).toBeNull()
    expect(parseRgba(undefined)).toBeNull()
  })
})

describe('conversions', () => {
  it('round-trips RGB through HSV', () => {
    for (const hex of ['#ec3013', '#1d4ed8', '#86efac', '#000000', '#ffffff', '#808080']) {
      const rgba = parseRgba(hex)!
      expect(hsvToRgb(rgbToHsv(rgba))).toEqual(rgba)
    }
  })

  it('keeps the hue between HSV and HSL, even for gray', () => {
    const gray = { a: 1, h: 210, s: 0, v: 50 }
    expect(hsvToHsl(gray)).toEqual({ h: 210, l: 50, s: 0 })
    expect(hslToHsv({ h: 210, l: 50, s: 0 })).toEqual({ h: 210, s: 0, v: 50 })
  })
})

describe('formatColor', () => {
  const red = { a: 1, b: 19, g: 48, r: 236 }

  it('writes each format, with alpha only when needed', () => {
    expect(formatColor(red, 'hex')).toBe('#ec3013')
    expect(formatColor({ ...red, a: 0.5 }, 'hex')).toBe('#ec301380')
    expect(formatColor(red, 'rgb')).toBe('rgb(236, 48, 19)')
    expect(formatColor({ ...red, a: 0.25 }, 'rgb')).toBe('rgba(236, 48, 19, 0.25)')
    expect(formatColor(red, 'hsl')).toBe('hsl(8, 85%, 50%)')
  })

  it('only writes values the sanitizer accepts', () => {
    for (const format of ['hex', 'rgb', 'hsl'] as const) {
      for (const a of [1, 0.4]) {
        expect(isValidValue(colorControl, formatColor({ ...red, a }, format))).toBe(true)
      }
    }
  })

  it('detects the format of a saved value', () => {
    expect(formatOf('rgba(0, 0, 0, 0.5)')).toBe('rgb')
    expect(formatOf('hsl(0, 0%, 0%)')).toBe('hsl')
    expect(formatOf('#000')).toBe('hex')
    expect(formatOf(undefined)).toBe('hex')
  })
})
