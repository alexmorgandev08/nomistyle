import { type BlockGroup } from '../../shared/schema'

/** A GutenStyle Pro block as the free plugin shows it: a PRO entry in Global Styles. Words only, no Pro code. */
export interface LockedBlock {
  description: string
  /** What Pro lets you style, one short line each. */
  features: string[]
  group: BlockGroup
  label: string
  /** The block's main HTML element, e.g. "p". */
  tag: string
  /** Block type key, e.g. "paragraph"; part of the URL #/styles/<type>. */
  type: string
}
