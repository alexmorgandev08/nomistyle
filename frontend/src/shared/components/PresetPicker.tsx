import { useState } from 'react'
import { __, sprintf } from '@wordpress/i18n'

import { getBlock, type Preset, type StyleValues } from '../schema'
import { matchesPreset } from '../values'
import CollapsibleSection from './CollapsibleSection'
import MiniPreview from './MiniPreview'
import { presetStatusLabel } from './presetStatusLabel'

interface PresetPickerProps {
  /** Presets shown after the block's built-in ones, e.g. presets that users saved. */
  extraPresets?: Preset[]
  /** Values the current level already has; applying a preset replaces them. */
  hasValues: boolean
  /** Show at most this many presets inline. */
  limit?: number
  onApply: (values: StyleValues) => void
  /** Called by the "View all" button, shown when `limit` hides some presets. */
  onShowAll?: () => void
  type: string
  /** Current values, used to highlight the preset they came from. */
  values?: StyleValues
}

/** The first `limit` presets; the one in use takes the last slot when it would be hidden. */
function visiblePresets(presets: Preset[], limit: number | undefined, inUseId: string | undefined): Preset[] {
  if (!limit || presets.length <= limit) return presets
  const shown = presets.slice(0, limit)
  const inUse = presets.find(preset => preset.id === inUseId)
  if (inUse && !shown.includes(inUse)) shown[limit - 1] = inUse
  return shown
}

export default function PresetPicker({ extraPresets = [], hasValues, limit, onApply, onShowAll, type, values }: PresetPickerProps) {
  const presets = [...(getBlock(type)?.presets ?? []), ...extraPresets]
  const [pending, setPending] = useState<Preset | null>(null)

  if (presets.length === 0) return null

  const { label: statusLabel, status } = presetStatusLabel(presets, values ?? {})
  const shown = visiblePresets(presets, limit, status.preset?.id)

  const apply = (preset: Preset) => {
    if (hasValues && !matchesPreset(preset, values)) {
      setPending(preset)
      return
    }
    onApply({ ...preset.values })
  }

  return (
    <CollapsibleSection
      className="gs-presets"
      status={<span className={`gs-presets__status${status.modified ? ' is-modified' : status.preset ? ' is-exact' : ''}`}>{statusLabel}</span>}
      title={__('Presets', 'guten-style')}
    >
      <div className="gs-presets__grid">
        {shown.map(preset => {
          const active = matchesPreset(preset, values)
          const isBase = !active && status.preset?.id === preset.id
          return (
            <button
              aria-pressed={active}
              className={`gs-preset${active ? ' is-active' : ''}${isBase ? ' is-base' : ''}`}
              key={preset.id}
              onClick={() => apply(preset)}
              type="button"
            >
              <span className="gs-preset__thumb">
                <MiniPreview type={type} values={preset.values} />
              </span>
              <span className="gs-preset__label">{preset.label}</span>
            </button>
          )
        })}
      </div>
      {onShowAll && shown.length < presets.length && (
        <button className="gs-text-btn gs-presets__all" onClick={onShowAll} type="button">
          {sprintf(
            /* translators: %d: number of presets */
            __('View all %d presets', 'guten-style'),
            presets.length
          )}
        </button>
      )}
      {pending && (
        <div className="gs-presets__confirm" role="alertdialog">
          <p>
            {sprintf(
              /* translators: %s: preset name */
              __('Apply "%s"? It replaces your current settings here.', 'guten-style'),
              pending.label
            )}
          </p>
          <div className="gs-presets__confirm-actions">
            <button
              className="gs-btn gs-btn--primary"
              onClick={() => {
                onApply({ ...pending.values })
                setPending(null)
              }}
              type="button"
            >
              {__('Apply preset', 'guten-style')}
            </button>
            <button className="gs-btn" onClick={() => setPending(null)} type="button">
              {__('Keep my settings', 'guten-style')}
            </button>
          </div>
        </div>
      )}
      <p className="gs-presets__help">
        {__('A preset replaces the settings at this level. Adjust anything below afterwards.', 'guten-style')}
      </p>
    </CollapsibleSection>
  )
}
