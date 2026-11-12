import { type Control, type Device, getControls, type Preset, type StyleMap, type StyleValues, supportsVariant } from './schema'

export type Level = 'block' | 'global' | 'post'

export const LEVEL_LABELS: Record<Level, string> = {
  block: 'This block',
  global: 'Global',
  post: 'This post'
}

export type StyleState = 'default' | 'hover'

/**
 * The stored key for a control: "cellPaddingY", "cellPaddingY@tablet", "background@hover", …
 * Hover values are not per device, so the hover state ignores `device`.
 */
export const valueKey = (key: string, device: Device, state: StyleState = 'default'): string => {
  if (state === 'hover') return `${key}@hover`
  return device === 'desktop' ? key : `${key}@${device}`
}

/** Returns a copy of `values` with `key` set, or removed when `value` is empty. */
export function withValue(values: StyleValues, key: string, value: string | undefined): StyleValues {
  const next = { ...values }
  if (value === undefined || value === '') {
    delete next[key]
  } else {
    next[key] = value
  }
  return next
}

/** Removes every key belonging to the given controls (all devices). */
export function withoutControls(values: StyleValues, controls: Control[]): StyleValues {
  const keys = new Set(controls.map(control => control.key))
  return Object.fromEntries(Object.entries(values).filter(([key]) => !keys.has(key.split('@')[0])))
}

export function withStyles(map: StyleMap, type: string, values: StyleValues): StyleMap {
  const next = { ...map }
  if (Object.keys(values).length === 0) {
    delete next[type]
  } else {
    next[type] = values
  }
  return next
}

/** Later levels win: merge(global, post, block). */
export const mergeLevels = (...levels: (StyleValues | undefined)[]): StyleValues =>
  Object.assign({}, ...levels.filter(Boolean))

/** A control with `showIf` is only relevant when the other control has one of the listed values. */
export const isControlVisible = (control: Control, effective: StyleValues): boolean =>
  !control.showIf || control.showIf.in.includes(effective[control.showIf.key] ?? '')

export const countValues = (values: StyleValues | undefined): number =>
  values ? Object.keys(values).length : 0

/** True when `values` is exactly the preset: same keys, same values, nothing extra. */
export const matchesPreset = (preset: Preset, values: StyleValues | undefined): boolean =>
  !!values &&
  countValues(values) === countValues(preset.values) &&
  Object.entries(preset.values).every(([key, value]) => values[key] === value)

// Same rules as backend/app/Styles/ValueSanitizer.php.
const COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)|transparent|currentColor|var\(--wp--preset--color--[a-z0-9-]+\)|var\(--gs-c-[a-z0-9-]+\))$/
const LENGTH_PATTERN = /^(-?(\d+(\.\d+)?|\.\d+))(px|em|rem|%|vw|vh)?$/
const NUMBER_PATTERN = /^(\d+(\.\d+)?|\.\d+)$/

export function isValidValue(control: Control, value: string): boolean {
  switch (control.type) {
    case 'color':
      return COLOR_PATTERN.test(value)

    case 'unit': {
      const match = LENGTH_PATTERN.exec(value)
      if (!match) return false
      const unit = match[4] ?? ''
      if (unit === '') return Number(match[1]) === 0
      if (control.units && !control.units.includes(unit)) return false
      return control.max === undefined || Number(match[1]) <= control.max
    }

    case 'number': {
      if (!NUMBER_PATTERN.test(value)) return false
      const number = Number(value)
      return (control.min === undefined || number >= control.min) && (control.max === undefined || number <= control.max)
    }

    case 'select':
      return control.options?.some(option => option.value === value) ?? false

    default:
      return false
  }
}

/**
 * Keeps only values the server would accept (known key, valid device, valid format),
 * so block attributes from other authors never inject arbitrary CSS into the editor.
 */
export function knownValues(type: string, values: unknown): StyleValues {
  if (!values || typeof values !== 'object') return {}

  const controls = new Map(getControls(type).map(control => [control.key, control]))

  return Object.fromEntries(
    Object.entries(values as Record<string, unknown>).filter(([key, value]) => {
      const [controlKey, device] = key.split('@')
      const control = controls.get(controlKey)
      if (!control || typeof value !== 'string' || value.trim() === '') return false
      if (device !== undefined && !supportsVariant(control, device)) return false
      if (device === undefined && control.mediaOnly) return false
      return isValidValue(control, value.trim())
    })
  ) as StyleValues
}

export function parseStyleMap(json: unknown): StyleMap {
  if (typeof json !== 'string' || json === '') return {}
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([type, values]) => [type, knownValues(type, values)] as const)
        .filter(([, values]) => Object.keys(values).length > 0)
    )
  } catch {
    return {}
  }
}

export interface PresetStatus {
  /** The preset the values match exactly, or were started from. */
  preset?: Preset
  modified: boolean
}

/**
 * Which preset the current values come from. An exact match is that preset; otherwise the
 * largest preset whose values are all still present is the one the user started from and
 * then added to ("Clean · modified"). Values that changed a preset's own setting match none.
 */
export function presetStatus(presets: Preset[], values: StyleValues): PresetStatus {
  const exact = presets.find(preset => matchesPreset(preset, values))
  if (exact) return { modified: false, preset: exact }

  const base = presets
    .filter(preset => countValues(preset.values) > 0)
    .filter(preset => Object.entries(preset.values).every(([key, value]) => values[key] === value))
    .sort((a, b) => countValues(b.values) - countValues(a.values))[0]

  return { modified: base !== undefined || countValues(values) > 0, preset: base }
}
