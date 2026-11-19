import { __, sprintf } from '@wordpress/i18n'

import { type Preset, type StyleValues } from '../schema'
import { presetStatus } from '../values'

/** The preset the values come from (if any) and a short label for it, e.g. "Clean · modified". */
export function presetStatusLabel(presets: Preset[], values: StyleValues) {
  const status = presetStatus(presets, values)

  if (status.preset && status.modified) {
    return {
      label: sprintf(
        /* translators: %s: preset name */
        __('%s · modified', 'blockstyle'),
        status.preset.label
      ),
      status
    }
  }
  if (status.preset) return { label: status.preset.label, status }
  return { label: status.modified ? __('Custom', 'blockstyle') : __('None', 'blockstyle'), status }
}
