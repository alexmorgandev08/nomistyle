import { contrastRatio as rgbaContrast, formatColor, parseRgba } from './color'
import { type ContrastPair, getBlock, type StyleValues } from './schema'

/**
 * Readability checks for a block's colors and text sizes (WCAG 2.x contrast).
 * Nomi Style only warns; it never changes the design.
 */

/** Where Nomi Style sets no color, assume the theme's dark text on a white page. */
export const ASSUMED_TEXT = '#1e1e1e'
export const ASSUMED_BACKGROUND = '#ffffff'

/** WCAG AA: 4.5:1 for body text, 3:1 for large text. */
const NORMAL_RATIO = 4.5
const LARGE_RATIO = 3
const MIN_READABLE_PX = 12

/** Adjustable limits (Nomi Style Pro's Accessibility tool). The defaults are WCAG AA and 12px. */
export interface ReadabilityOptions {
  largeRatio?: number
  minTextPx?: number
  normalRatio?: number
}

/** WCAG AAA: 7:1 for body text and 4.5:1 for large text. */
export const AAA_RATIOS = { largeRatio: 4.5, normalRatio: 7 }

const PAIRS: Record<string, ContrastPair[]> = {
  button: [
    { bg: ['background'], fg: ['textColor'], label: 'Button text', size: ['fontSize'], weight: ['fontWeight'] },
    { bg: ['hoverBackground', 'background'], fg: ['hoverTextColor', 'textColor'], label: 'Button text on hover', size: ['fontSize'], weight: ['fontWeight'] }
  ],
  details: [
    { bg: ['summaryBackground', 'background'], fg: ['summaryTextColor', 'textColor'], label: 'Header', size: ['summaryFontSize'], weight: ['summaryFontWeight'] },
    { bg: ['openSummaryBackground', 'summaryBackground', 'background'], fg: ['openSummaryTextColor', 'summaryTextColor', 'textColor'], label: 'Header when open', size: ['summaryFontSize'], weight: ['summaryFontWeight'] },
    { bg: ['background'], fg: ['contentTextColor', 'textColor'], label: 'Content', size: ['contentFontSize'] }
  ],
  heading: [{ bg: [], fg: ['color'], label: 'Heading text', large: true, size: ['h2FontSize'], weight: ['h2FontWeight', 'fontWeight'] }],
  image: [{ bg: ['background'], fg: ['captionColor'], label: 'Caption', size: ['captionFontSize'] }],
  list: [
    { bg: ['background'], fg: ['textColor'], label: 'List text', size: ['fontSize'] },
    { bg: ['background'], fg: ['markerColor'], label: 'Markers', large: true }
  ],
  quote: [
    { bg: ['background'], fg: ['textColor'], label: 'Quote text', size: ['fontSize'], weight: ['fontWeight'] },
    { bg: ['background'], fg: ['citeColor', 'textColor'], label: 'Citation', size: ['citeFontSize'], weight: ['citeFontWeight'] }
  ],
  table: [
    { bg: ['headerBackground', 'background'], fg: ['headerTextColor', 'textColor'], label: 'Header text', size: ['headerFontSize', 'fontSize'], weight: ['headerFontWeight'] },
    { bg: ['cellBackground', 'background'], fg: ['cellTextColor', 'textColor'], label: 'Cell text', size: ['fontSize'] },
    { bg: ['stripeColor'], fg: ['cellTextColor', 'textColor'], label: 'Striped rows', needsBg: true, size: ['fontSize'] },
    { bg: ['hoverColor'], fg: ['cellTextColor', 'textColor'], label: 'Row hover', needsBg: true, size: ['fontSize'] },
    { bg: ['footerBackground', 'background'], fg: ['footerTextColor', 'textColor'], label: 'Footer', size: ['fontSize'], weight: ['footerFontWeight'] }
  ]
}

/** Size settings checked for very small text, per block. */
const SIZE_KEYS: Record<string, string[]> = {
  button: ['fontSize'],
  details: ['summaryFontSize', 'contentFontSize'],
  heading: ['h2FontSize', 'h3FontSize', 'h4FontSize'],
  image: ['captionFontSize'],
  list: ['fontSize'],
  quote: ['fontSize', 'citeFontSize'],
  table: ['fontSize', 'headerFontSize', 'captionFontSize']
}

export interface ContrastResult {
  bg: string
  fg: string
  /** For a failing pair: the change that makes it pass (a darker or lighter text color). */
  fix?: StyleValues
  label: string
  ok: boolean
  ratio: number
  required: number
}

export interface SizeResult {
  /** The change that makes the text readable: the size set to the minimum. */
  fix: StyleValues
  label: string
  px: number
}

export interface ReadabilityReport {
  contrast: ContrastResult[]
  smallText: SizeResult[]
}

type Rgb = [number, number, number]

/** Parses an opaque or partly transparent color into [r, g, b]. Transparent, currentColor and var() return null. */
export function parseColor(value: string | undefined): Rgb | null {
  const color = parseRgba(value)
  return color && color.a > 0 ? [color.r, color.g, color.b] : null
}

export function contrastRatio([r1, g1, b1]: Rgb, [r2, g2, b2]: Rgb): number {
  return rgbaContrast({ a: 1, b: b1, g: g1, r: r1 }, { a: 1, b: b2, g: g2, r: r2 })
}

/** "18px" → 18, "1.5em"/"1.5rem" → 24 (16px base), "0" → 0. Unknown or invalid → null. */
export function toPx(value: string | undefined): number | null {
  // The sanitizer allows a bare number only for zero.
  if (value === '0') return 0
  const match = /^(\d*\.?\d+)(px|em|rem)$/.exec(value ?? '')
  if (!match) return null
  return match[2] === 'px' ? Number(match[1]) : Number(match[1]) * 16
}

const firstSet = (values: StyleValues, keys: string[] = []) => keys.map(key => values[key]).find(Boolean)

/** First key whose value is a usable color (skips transparent, currentColor and theme variables). */
const firstColor = (values: StyleValues, keys: string[]) =>
  keys.map(key => values[key]).find(value => parseColor(value) !== null)

export function checkReadability(type: string, values: StyleValues, options: ReadabilityOptions = {}): ReadabilityReport {
  const { largeRatio = LARGE_RATIO, minTextPx = MIN_READABLE_PX, normalRatio = NORMAL_RATIO } = options
  const contrast: ContrastResult[] = []

  for (const pair of getBlock(type)?.readability?.pairs ?? PAIRS[type] ?? []) {
    const anySet = [...pair.fg, ...pair.bg].some(key => values[key])
    if (!anySet || (pair.needsBg && !firstColor(values, pair.bg))) continue

    const fg = firstColor(values, pair.fg) ?? (firstSet(values, pair.fg) ? null : ASSUMED_TEXT)
    const bg = firstColor(values, pair.bg) ?? ASSUMED_BACKGROUND
    const fgRgb = parseColor(fg ?? undefined)
    const bgRgb = parseColor(bg)
    if (!fg || !fgRgb || !bgRgb) continue

    const px = toPx(firstSet(values, pair.size))
    const bold = Number(firstSet(values, pair.weight) ?? 400) >= 700
    const large = px === null ? pair.large === true : px >= 24 || (px >= 18.66 && bold)
    const required = large ? largeRatio : normalRatio
    const ratio = contrastRatio(fgRgb, bgRgb)

    const ok = ratio >= required
    contrast.push({
      bg,
      fg,
      ...(ok ? {} : { fix: { [pair.fg[0]]: readableColor(fgRgb, bgRgb, required) } }),
      label: pair.label,
      ok,
      ratio,
      required
    })
  }

  const smallText = (getBlock(type)?.readability?.sizeKeys ?? SIZE_KEYS[type] ?? [])
    .flatMap(key => Object.keys(values).filter(k => k === key || k.startsWith(`${key}@`)))
    .map(key => ({ key, px: toPx(values[key]) }))
    .filter((item): item is { key: string; px: number } => item.px !== null && item.px < minTextPx)
    .map(item => ({ fix: { [item.key]: `${minTextPx}px` }, label: item.key, px: item.px }))

  return { contrast, smallText }
}

const mix = ([r, g, b]: Rgb, [tr, tg, tb]: Rgb, amount: number): Rgb => [
  Math.round(r + (tr - r) * amount),
  Math.round(g + (tg - g) * amount),
  Math.round(b + (tb - b) * amount)
]

/**
 * The text color closest to `fg` that reaches the `required` contrast on `bg`: it moves toward black
 * or white, whichever passes sooner, so the hue stays as long as possible. Written as hex.
 */
export function readableColor(fg: Rgb, bg: Rgb, required: number): string {
  const STEPS = 40
  const black: Rgb = [0, 0, 0]
  const white: Rgb = [255, 255, 255]

  for (let step = 1; step <= STEPS; step++) {
    const amount = step / STEPS
    const candidates = [mix(fg, black, amount), mix(fg, white, amount)].filter(color => contrastRatio(color, bg) >= required)
    if (candidates.length > 0) {
      const best = candidates.sort((a, b) => contrastRatio(b, bg) - contrastRatio(a, bg))[0]
      return formatColor({ a: 1, b: best[2], g: best[1], r: best[0] }, 'hex')
    }
  }

  const best = contrastRatio(black, bg) >= contrastRatio(white, bg) ? black : white
  return formatColor({ a: 1, b: best[2], g: best[1], r: best[0] }, 'hex')
}
