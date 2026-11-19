import { useState } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { type KeyboardEvent } from 'react'

import { type Control } from '../schema'
import { isValidValue } from '../values'
import ColorField from './ColorField'
import { type Swatch } from './ColorPanel'
import SegmentedControl from './SegmentedControl'
import { useDraft } from './useDraft'

export type PaletteColor = Swatch

interface ControlFieldProps {
  control: Control
  /** Value that applies when this level has none, shown as a placeholder. */
  inheritedValue?: string
  /** Where `inheritedValue` comes from, e.g. "Global", "This post", "Desktop", "Default state". */
  inheritedFrom?: string
  onChange: (value: string | undefined) => void
  palette: PaletteColor[]
  value?: string
}

/** Short option sets fit the value column as a segmented control; longer ones use a dropdown. */
const SEGMENT_MAX_OPTIONS = 3
const SEGMENT_MAX_LABEL_CHARS = 16

const splitUnit = (value: string | undefined): { number: string; unit: string | undefined } => {
  const match = /^(-?\d*\.?\d+)([a-z%]*)$/.exec(value ?? '')
  return match ? { number: match[1], unit: match[2] || undefined } : { number: '', unit: undefined }
}

/**
 * One setting as a row: the label, a compact control, and a reset icon when this level sets a value.
 * An inherited value shows as the control's placeholder; the label's tooltip names its source.
 */
export default function ControlField({ control, inheritedFrom, inheritedValue, onChange, palette, value }: ControlFieldProps) {
  const hasValue = value !== undefined && value !== ''
  const inheritedTitle =
    !hasValue && inheritedValue && inheritedFrom
      ? sprintf(
          /* translators: %s: where the value comes from, e.g. "Global" */
          __('Inherited from %s', 'blockstyle'),
          inheritedFrom
        )
      : undefined

  return (
    <div className={`gs-field gs-field--${control.type}`}>
      <span className="gs-field__label" title={inheritedTitle}>
        {control.label}
      </span>
      <div className="gs-field__control">
        <Input control={control} inheritedValue={inheritedValue} onChange={onChange} palette={palette} value={value} />
      </div>
      {hasValue && (
        <button
          aria-label={sprintf(
            /* translators: %s: setting name */
            __('Reset %s', 'blockstyle'),
            control.label
          )}
          className="gs-field__reset"
          onClick={() => onChange(undefined)}
          title={__('Reset', 'blockstyle')}
          type="button"
        >
          <svg aria-hidden fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" />
            <path d="M3.5 3.5v5h5" />
          </svg>
        </button>
      )}
    </div>
  )
}

function Input({ control, inheritedValue, onChange, palette, value }: Omit<ControlFieldProps, 'inheritedFrom'>) {
  switch (control.type) {
    case 'color':
      return <ColorField control={control} inheritedValue={inheritedValue} onChange={onChange} palette={palette} value={value} />

    case 'unit':
    case 'number':
      return <NumberField control={control} inheritedValue={inheritedValue} onChange={onChange} value={value} />

    case 'select': {
      const options = control.options ?? []
      const labelChars = options.reduce((sum, option) => sum + option.label.length, 0)

      if (options.length <= SEGMENT_MAX_OPTIONS && labelChars <= SEGMENT_MAX_LABEL_CHARS) {
        return (
          <SegmentedControl
            block
            deselectable
            inherited={!value}
            label={control.label}
            onChange={onChange}
            options={options}
            value={value ?? inheritedValue ?? ''}
          />
        )
      }

      const inheritedLabel = options.find(option => option.value === inheritedValue)?.label
      return (
        <div className="gs-input gs-input--select">
          <select
            aria-label={control.label}
            className={value ? '' : 'is-placeholder'}
            onChange={event => onChange(event.target.value || undefined)}
            value={value ?? ''}
          >
            <option value="">
              {inheritedLabel
                ? sprintf(
                    /* translators: %s: inherited option name */
                    __('%s (inherited)', 'blockstyle'),
                    inheritedLabel
                  )
                : __('Theme default', 'blockstyle')}
            </option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg aria-hidden className="gs-input__chevron" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )
    }

    default:
      return null
  }
}

function NumberField({
  control,
  inheritedValue,
  onChange,
  value
}: {
  control: Control
  inheritedValue?: string
  onChange: (value: string | undefined) => void
  value?: string
}) {
  const units = control.type === 'unit' ? (control.units ?? ['px']) : []
  const own = splitUnit(value)
  const inherited = splitUnit(inheritedValue)
  // A unit picked before any number is typed is kept for the next entry.
  const [pickedUnit, setPickedUnit] = useState<string>()
  const unit = own.unit ?? pickedUnit ?? inherited.unit ?? units[0] ?? ''
  const step = control.step ?? (unit === 'em' || unit === 'rem' ? 0.1 : 1)

  const valueFor = (number: string, nextUnit = unit) => (control.type === 'unit' ? `${number}${nextUnit}` : number)

  const commit = (text: string) => {
    if (text === '') {
      onChange(undefined)
      return true
    }
    // A bare number takes the current unit; "1.5em" may also be typed in full.
    const next = /^-?\d*\.?\d+$/.test(text) ? valueFor(text) : text
    if (!isValidValue(control, next)) return false
    onChange(next)
    return true
  }

  const { draft, invalid, save, setDraft } = useDraft(own.number, commit)

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') save()
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const base = Number(draft || inherited.number || 0)
    const delta = (event.key === 'ArrowUp' ? 1 : -1) * step * (event.shiftKey ? 10 : 1)
    const min = control.min ?? 0
    const next = String(Math.max(min, Math.round((base + delta) * 100) / 100))
    setDraft(next)
    save(next)
  }

  return (
    <div className={`gs-input${invalid ? ' is-invalid' : ''}`}>
      <input
        aria-invalid={invalid}
        aria-label={control.label}
        inputMode="decimal"
        onBlur={() => save()}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={inherited.number || (control.type === 'number' ? inheritedValue : '') || __('Auto', 'blockstyle')}
        value={draft}
      />
      {units.length > 1 ? (
        <select
          aria-label={sprintf(
            /* translators: %s: setting name */
            __('%s unit', 'blockstyle'),
            control.label
          )}
          className="gs-input__unit"
          onChange={event => {
            setPickedUnit(event.target.value)
            const next = own.number ? valueFor(own.number, event.target.value) : undefined
            if (next && isValidValue(control, next)) onChange(next)
          }}
          value={unit}
        >
          {units.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : (
        unit && <span className="gs-input__unit">{unit}</span>
      )}
    </div>
  )
}
