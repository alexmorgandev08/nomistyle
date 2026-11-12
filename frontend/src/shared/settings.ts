import { type PaletteColor } from './components/ControlField'
import { type MediaQueries } from './css'
import { type Level } from './values'

/** Custom tablet and mobile breakpoints in px (Settings › Responsive). */
export interface Breakpoints {
  mobile: number
  tablet: number
}

/** Block editor options (Settings › Block editor). */
export interface EditorOptions {
  allowBlockStyles: boolean
  allowPostStyles: boolean
  roles: string[]
  showSource: boolean
}

/** Advanced options (Settings › Advanced). */
export interface AdvancedOptions {
  contentSelector: string
  cssFile: boolean
  deleteOnUninstall: boolean
  onlyUsedBlocks: boolean
}

/** Same rules as PHP's AdvancedOptions::sanitizeSelector(): no braces, semicolons, quotes, at-rules or commas. */
const CONTENT_SELECTOR_PATTERN = /^[A-Za-z0-9_\-.#:>+~*[\]=() ]+$/
export const CONTENT_SELECTOR_MAX_LENGTH = 200

/** Whether PHP keeps this content selector (an empty one means "none"). */
export function isValidContentSelector(selector: string): boolean {
  const normalized = selector.replace(/\s+/g, ' ').trim()
  if (normalized === '') return true
  return normalized.length <= CONTENT_SELECTOR_MAX_LENGTH && CONTENT_SELECTOR_PATTERN.test(normalized)
}

/** The limits PHP's Breakpoints::sanitize() accepts. */
export const BREAKPOINT_LIMITS = { max: 2400, min: 320 } as const

export const isValidBreakpoints = ({ mobile, tablet }: Breakpoints): boolean =>
  Number.isInteger(mobile) &&
  Number.isInteger(tablet) &&
  mobile >= BREAKPOINT_LIMITS.min &&
  tablet <= BREAKPOINT_LIMITS.max &&
  mobile < tablet

/**
 * Media queries for tablet and mobile values: custom breakpoints, or the theme's.
 * Same strings as PHP's Breakpoints::mediaQueries(), which uses WordPress core's format.
 */
export function mediaQueriesFor(breakpoints: Breakpoints | null, themeQueries: MediaQueries): MediaQueries {
  if (!breakpoints) return themeQueries
  return {
    mobile: `@media (width <= ${breakpoints.mobile}px)`,
    tablet: `@media (${breakpoints.mobile}px < width <= ${breakpoints.tablet}px)`
  }
}

/**
 * The widths in the theme's media queries (WordPress core format), e.g. to start custom breakpoints
 * from the theme's. Null when the queries have another format.
 */
export function breakpointsFromQueries(queries: MediaQueries): Breakpoints | null {
  const tablet = /\(\s*(\d+)px\s*<\s*width\s*<=\s*(\d+)px\s*\)/.exec(queries.tablet ?? '')
  if (!tablet) return null
  return { mobile: Number(tablet[1]), tablet: Number(tablet[2]) }
}

/** Theme colors appear in color pickers only when Settings › Theme allows it. */
export const visiblePalette = (palette: PaletteColor[], themeColors: boolean, brandColors: PaletteColor[] = []): PaletteColor[] =>
  themeColors ? [...brandColors, ...palette] : brandColors

const LEVEL_ORDER: Level[] = ['global', 'post', 'block']

/** Style levels the editor panel offers. Global is always there, to show the global style. */
export const editableLevels = (options: EditorOptions): Level[] =>
  LEVEL_ORDER.filter(
    level => level === 'global' || (level === 'post' && options.allowPostStyles) || (level === 'block' && options.allowBlockStyles)
  )

/** The level the editor panel opens on: this block if allowed, else this post, else global. */
export function defaultLevel(levels: Level[]): Level {
  if (levels.includes('block')) return 'block'
  if (levels.includes('post')) return 'post'
  return 'global'
}
