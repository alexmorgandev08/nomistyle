import { type BlockSchema, type CssMap, getBlock, type StyleValues, supportsVariant } from './schema'

/**
 * Turns style values into CSS. Mirrors backend/app/Styles/CssGenerator.php —
 * both must produce identical output (see tests/fixtures/css-cases.json).
 *
 * Selector convention: "&" is the block root; other selectors are descendants of the root.
 * Values keyed "name@hover" are written for the root's :hover state.
 */

export type MediaQueries = Partial<Record<'mobile' | 'tablet', string>>

type Rules = Map<string, Map<string, string>>

const RESPONSIVE_DEVICES = ['tablet', 'mobile'] as const

const PLACEHOLDER_PATTERN = /\{([A-Za-z0-9]+)(?:\|([^}]*))?\}/g

export function generateCss(
  type: string,
  values: StyleValues,
  root: string,
  important = false,
  mediaQueries: MediaQueries = {}
): string {
  const block = getBlock(type)

  if (!block || Object.keys(values).length === 0) return ''

  const parts = [
    render(collect(block, values, ''), root, important),
    // Hover values apply on every screen size, so they sit outside the media queries.
    render(collect(block, values, '@hover'), `${root}:hover`, important)
  ]

  RESPONSIVE_DEVICES.forEach(device => {
    const query = mediaQueries[device]
    if (!query) return

    const css = render(collect(block, values, `@${device}`), root, important)
    if (css !== '') parts.push(`${query}{${css}}`)
  })

  return parts.filter(part => part !== '').join('\n')
}

function collect(block: BlockSchema, values: StyleValues, suffix: string): Rules {
  const rules: Rules = new Map()

  block.sections.forEach(section => {
    section.controls.forEach(control => {
      if (suffix !== '' && !supportsVariant(control, suffix.slice(1))) return

      const value = values[control.key + suffix]
      if (value === undefined || value === '') return

      control.targets?.forEach(target => set(rules, target.selector, target.property, value))

      if (control.type === 'select') {
        const option = control.options?.find(item => item.value === value)
        if (option?.css) merge(rules, option.css, values)
      }

      if (control.extra) merge(rules, control.extra, values)
    })
  })

  return rules
}

function set(rules: Rules, selector: string, property: string, value: string) {
  const declarations = rules.get(selector) ?? new Map<string, string>()
  declarations.set(property, value)
  rules.set(selector, declarations)
}

function merge(rules: Rules, css: CssMap, values: StyleValues) {
  Object.entries(css).forEach(([selector, declarations]) => {
    Object.entries(declarations).forEach(([property, template]) => {
      set(rules, selector, property, interpolate(template, values))
    })
  })
}

function interpolate(template: string, values: StyleValues): string {
  return template.replace(PLACEHOLDER_PATTERN, (_match, key: string, fallback?: string) => {
    const value = values[key]
    if (value !== undefined && value !== '') return value
    return fallback ?? ''
  })
}

function render(rules: Rules, root: string, important: boolean): string {
  const css: string[] = []

  rules.forEach((declarations, selector) => {
    const lines: string[] = []
    declarations.forEach((value, property) => {
      lines.push(`${property}:${value}${important ? '!important' : ''}`)
    })
    css.push(`${resolveSelector(root, selector)}{${lines.join(';')}}`)
  })

  return css.join('\n')
}

function resolveSelector(root: string, selector: string): string {
  return selector
    .split(',')
    .map(part => {
      const trimmed = part.trim()
      return trimmed.startsWith('&') ? root + trimmed.slice(1) : `${root} ${trimmed}`
    })
    .join(',')
}
