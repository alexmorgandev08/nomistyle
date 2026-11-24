import schemaJson from '../../../schema/blocks.json'
import { proBlocks } from './proBlocks'

export type Device = 'desktop' | 'mobile' | 'tablet'

/** A stored value variant: "name@tablet", "name@mobile" or "name@hover". */
export type Variant = 'hover' | 'mobile' | 'tablet'

export type CssMap = Record<string, Record<string, string>>

export interface ControlTarget {
  property: string
  selector: string
}

export interface SelectOption {
  css?: CssMap
  label: string
  value: string
}

export interface Control {
  extra?: CssMap
  /** Allow a hover value. Colors always allow one. */
  hover?: boolean
  key: string
  label: string
  max?: number
  /** Only settable per screen size (tablet/mobile), never on desktop. */
  mediaOnly?: boolean
  min?: number
  options?: SelectOption[]
  /** Position in the "Quick styles" tab (1 = first): the handful of settings most people change. */
  quick?: number
  responsive?: boolean
  /** Device values that Nomi Style (free) outputs; other responsive controls need an add-on. */
  freeResponsive?: boolean
  showIf?: { in: string[]; key: string }
  step?: number
  targets?: ControlTarget[]
  type: 'color' | 'number' | 'select' | 'unit'
  units?: string[]
}

export interface Section {
  controls: Control[]
  id: string
  label: string
}

export interface Preset {
  id: string
  label: string
  values: StyleValues
}

/** Groups in the admin block list. */
export type BlockGroup = 'design' | 'media' | 'text'

/** A readability check: text color on background color (see a11y.ts). */
export interface ContrastPair {
  label: string
  /** Value keys in priority order; the first set one wins. */
  fg: string[]
  bg: string[]
  size?: string[]
  weight?: string[]
  /** Text that is large by nature (headings) passes at 3:1 when its size is unknown. */
  large?: boolean
  /** Only check when one of the `bg` keys is set (e.g. stripes or hover rows). */
  needsBg?: boolean
}

export interface BlockSchema {
  description: string
  group: BlockGroup
  label: string
  name: string
  presets: Preset[]
  /** Readability checks of an add-on block. Nomi Style's own blocks have theirs in a11y.ts. */
  readability?: { pairs: ContrastPair[]; sizeKeys: string[] }
  sections: Section[]
  /** The block's main HTML element, shown as a hint in the admin block list. */
  tag: string
  /** Preset thumbnail HTML of an add-on block; its root has the "gs" class. Trusted: it comes from the plugin's own files. */
  thumb?: string
}

/** Control key (optionally suffixed with @tablet / @mobile) => CSS value */
export type StyleValues = Record<string, string>

/** Block type key ("table", "list", …) => values */
export type StyleMap = Record<string, StyleValues>

const freeSchema = schemaJson as unknown as { blocks: Record<string, BlockSchema>; version: number }

const addOnBlocks = Object.entries(proBlocks()).filter(([type]) => !(type in freeSchema.blocks))

/** Nomi Style's blocks, then add-on blocks (Nomi Style Pro replaces ./proBlocks); an add-on cannot replace one (like Schema::blocks() in PHP). */
export const schema = {
  ...freeSchema,
  blocks: { ...freeSchema.blocks, ...Object.fromEntries(addOnBlocks) } as Record<string, BlockSchema>
}

export const blockTypes = Object.keys(schema.blocks)

/** "core/table" => "table" */
export const blockNameMap: Record<string, string> = Object.fromEntries(
  Object.entries(schema.blocks).map(([type, block]) => [block.name, type])
)

export const getBlock = (type: string): BlockSchema | undefined => schema.blocks[type]

export const getControls = (type: string): Control[] =>
  getBlock(type)?.sections.flatMap(section => section.controls) ?? []

/** Same rule as ValueSanitizer::supportsVariant() in PHP. */
export const supportsVariant = (control: Control, variant: string): boolean => {
  if (variant === 'hover') return control.type === 'color' || control.hover === true
  return control.responsive === true && (variant === 'tablet' || variant === 'mobile')
}
