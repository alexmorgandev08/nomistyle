import { describe, expect, it } from 'vitest'

import { checkReadability, contrastRatio, parseColor, toPx } from './a11y'

describe('contrast math', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1)
    expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 5)
    // #767676 on white is the classic 4.54:1 boundary color.
    expect(contrastRatio(parseColor('#767676')!, [255, 255, 255])).toBeCloseTo(4.54, 2)
  })

  it('parses supported color formats and rejects the rest', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255])
    expect(parseColor('#11182780')).toEqual([17, 24, 39])
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual([10, 20, 30])
    expect(parseColor('transparent')).toBeNull()
    expect(parseColor('var(--wp--preset--color--contrast)')).toBeNull()
  })

  it('converts sizes to px', () => {
    expect(toPx('18px')).toBe(18)
    expect(toPx('1.5em')).toBe(24)
    expect(toPx('50%')).toBeNull()
  })
})

describe('checkReadability', () => {
  it('flags light text on a light stripe (the Dark preset on a light global style)', () => {
    const report = checkReadability('table', { cellTextColor: '#e2e8f0', stripeColor: '#f1f5f9' })
    const stripes = report.contrast.find(item => item.label === 'Striped rows')
    expect(stripes?.ok).toBe(false)
  })

  it('passes dark header text on a light header', () => {
    const report = checkReadability('table', { headerBackground: '#f9fafb', headerTextColor: '#111827' })
    expect(report.contrast.find(item => item.label === 'Header text')?.ok).toBe(true)
  })

  it('uses the 3:1 large-text rule for big bold text', () => {
    // #949494 on white is about 3.0:1: fails body text, passes large text.
    const big = checkReadability('table', { headerFontSize: '24px', headerTextColor: '#949494' })
    const small = checkReadability('table', { headerFontSize: '14px', headerTextColor: '#949494' })
    expect(big.contrast[0].required).toBe(3)
    expect(small.contrast[0].ok).toBe(false)
  })

  it('checks nothing when no color is set', () => {
    expect(checkReadability('quote', { paddingBlock: '1em' }).contrast).toEqual([])
  })

  it('reports text smaller than 12px on any screen size', () => {
    const report = checkReadability('quote', { citeFontSize: '10px', 'fontSize@mobile': '11px', fontSize: '18px' })
    expect(report.smallText.map(item => item.label).sort()).toEqual(['citeFontSize', 'fontSize@mobile'])
  })
})

describe('readability fixes', () => {
  it('suggests a text color that passes and keeps the hue', () => {
    const report = checkReadability('button', { background: '#2563eb', textColor: '#3b82f6' })
    const fix = report.contrast[0].fix!

    expect(Object.keys(fix)).toEqual(['textColor'])
    const fixed = checkReadability('button', { background: '#2563eb', ...fix })
    expect(fixed.contrast[0].ok).toBe(true)
  })

  it('fixes the most specific color key, even when the color was assumed', () => {
    const report = checkReadability('table', { headerBackground: '#111111' })
    const header = report.contrast.find(item => item.label === 'Header text')!

    expect(header.ok).toBe(false)
    expect(Object.keys(header.fix!)).toEqual(['headerTextColor'])
    expect(checkReadability('table', { headerBackground: '#111111', ...header.fix }).contrast[0].ok).toBe(true)
  })

  it('gives no fix for a passing pair, and sets small text to 12px', () => {
    const report = checkReadability('list', { fontSize: '10px', 'fontSize@mobile': '9px', textColor: '#111111' })

    expect(report.contrast[0].fix).toBeUndefined()
    expect(report.smallText.map(item => item.fix)).toEqual([{ fontSize: '12px' }, { 'fontSize@mobile': '12px' }])
  })
})
