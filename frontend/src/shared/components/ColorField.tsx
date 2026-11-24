import { __, sprintf } from '@wordpress/i18n'
import { type KeyboardEvent, useEffect, useId, useMemo, useState } from 'react'

import { NAMED_COLORS } from '../color'
import { type Control } from '../schema'
import { themeClass, useUiTheme } from '../theme'
import { isValidValue } from '../values'
import ColorPanel, { type Swatch } from './ColorPanel'
import Floating from './Floating'
import { useDraft } from './useDraft'

const DEFAULT_COLORS: Swatch[] = [
  { color: '#111827', name: 'Ink' },
  { color: '#475569', name: 'Slate' },
  { color: '#94a3b8', name: 'Gray' },
  { color: '#e2e8f0', name: 'Light gray' },
  { color: '#f8fafc', name: 'Off white' },
  { color: '#ffffff', name: 'White' },
  { color: '#2563eb', name: 'Blue' },
  { color: '#16a34a', name: 'Green' },
  { color: '#eab308', name: 'Yellow' },
  { color: '#dc2626', name: 'Red' }
]

const NAMED_SWATCHES: Swatch[] = Object.entries(NAMED_COLORS).map(([name, color]) => ({ color, name }))

interface ColorFieldProps {
  control: Control
  inheritedValue?: string
  onChange: (value: string | undefined) => void
  palette: Swatch[]
  value?: string
}

/**
 * A color setting: a swatch that opens the picker, and a text box that suggests
 * theme and CSS named colors while typing. Named colors are saved as hex,
 * because the value sanitizer accepts hex, rgb() and hsl() only.
 */
export default function ColorField({ control, inheritedValue, onChange, palette, value }: ColorFieldProps) {
  const [theme] = useUiTheme()
  const listId = useId()
  const [box, setBox] = useState<HTMLDivElement | null>(null)
  const [swatch, setSwatch] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const swatches = useMemo(() => {
    const seen = new Set<string>()
    return [...palette, ...DEFAULT_COLORS].filter(item => {
      const key = item.color.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [palette])

  const commit = (text: string) => {
    if (text === '') {
      onChange(undefined)
      return true
    }
    const next = NAMED_COLORS[text.toLowerCase()] ?? text
    if (!isValidValue(control, next)) return false
    onChange(next)
    return true
  }

  const { draft, invalid, save, setDraft } = useDraft(value, commit)
  const shown = value ?? inheritedValue

  // While the box shows the saved value, list everything; once the user types, filter.
  const query = draft.trim().toLowerCase()
  const suggestions = useMemo(() => {
    const all = [...swatches, ...NAMED_SWATCHES]
    if (!query || query === value?.toLowerCase()) return all
    return all.filter(item => item.name.toLowerCase().includes(query) || item.color.toLowerCase().includes(query))
  }, [query, swatches, value])

  const listOpen = open && suggestions.length > 0
  const optionId = (index: number) => `${listId}-${index}`

  useEffect(() => {
    if (listOpen && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
  }, [active, listOpen])

  const pick = (item: Swatch) => {
    setDraft(item.color)
    onChange(item.color)
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!listOpen) {
        setOpen(true)
        setActive(0)
        return
      }
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive(index => (index + step + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      if (listOpen && suggestions[active]) pick(suggestions[active])
      else save()
      setOpen(false)
    } else if (event.key === 'Escape' && listOpen) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div className={`gs-input gs-input--color${invalid ? ' is-invalid' : ''}`} ref={setBox}>
      <button
        aria-expanded={pickerOpen}
        aria-label={sprintf(
          /* translators: %s: setting name */
          __('Choose %s', 'nomistyle'),
          control.label
        )}
        className={`gs-input__swatch${shown ? '' : ' is-empty'}`}
        onClick={() => setPickerOpen(isOpen => !isOpen)}
        ref={setSwatch}
        style={shown ? { background: shown } : undefined}
        type="button"
      />
      {pickerOpen && (
        <Floating
          anchor={swatch}
          className={`gs-colors__popover ${themeClass(theme)}`}
          focusOnMount
          onDismiss={() => setPickerOpen(false)}
          placement="left-start"
        >
          <ColorPanel fallback={inheritedValue} onChange={onChange} swatches={swatches} value={value} />
        </Floating>
      )}
      <input
        aria-activedescendant={listOpen && active >= 0 ? optionId(active) : undefined}
        aria-autocomplete="list"
        aria-controls={listOpen ? listId : undefined}
        aria-expanded={listOpen}
        aria-invalid={invalid}
        aria-label={control.label}
        onBlur={() => {
          setOpen(false)
          save()
        }}
        onChange={event => {
          setDraft(event.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onKeyDown={onKeyDown}
        placeholder={inheritedValue ?? __('Theme default', 'nomistyle')}
        role="combobox"
        spellCheck={false}
        value={draft}
      />
      {listOpen && (
        <Floating anchor={box} className={`gs-color-list ${themeClass(theme)}`}>
          <div aria-label={__('Colors', 'nomistyle')} className="gs-color-list__items" id={listId} role="listbox">
            {suggestions.map((item, index) => (
              <div
                aria-selected={index === active}
                className={`gs-color-list__item${index === active ? ' is-active' : ''}${
                  value?.toLowerCase() === item.color.toLowerCase() ? ' is-current' : ''
                }`}
                id={optionId(index)}
                key={`${item.name}-${item.color}`}
                // Keep focus in the text box, so blur does not close the list before the pick.
                onMouseDown={event => event.preventDefault()}
                onClick={() => pick(item)}
                onMouseEnter={() => setActive(index)}
                role="option"
              >
                <span className="gs-color-list__name">{item.name}</span>
                <span aria-hidden className="gs-color-list__chip" style={{ background: item.color }} />
              </div>
            ))}
          </div>
        </Floating>
      )}
    </div>
  )
}
