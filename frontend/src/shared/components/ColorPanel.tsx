import { useEffect, useRef, useState } from 'react'
import { __, sprintf } from '@wordpress/i18n'
import { type KeyboardEvent, type PointerEvent } from 'react'

import {
  COLOR_FORMATS,
  type ColorFormat,
  contrastRatio,
  formatColor,
  formatOf,
  type Hsva,
  hslToHsv,
  hsvToHsl,
  hsvToRgb,
  parseRgba,
  rgbToHsv
} from '../color'

export interface Swatch {
  color: string
  name: string
}

interface ColorPanelProps {
  /** Shown when no value is set, e.g. the inherited color. */
  fallback?: string
  onChange: (value: string | undefined) => void
  swatches: Swatch[]
  value?: string
}

const WHITE = { a: 1, b: 255, g: 255, r: 255 }
const BLACK = { a: 1, b: 0, g: 0, r: 0 }

const toHsva = (value: string | undefined): Hsva | null => {
  const rgba = parseRgba(value)
  return rgba ? rgbToHsv(rgba) : null
}

/** Grays and black have no hue of their own: keep the hue the user had, so the area does not jump to red. */
const withHue = (next: Hsva, hue: number): Hsva => (next.s === 0 || next.v === 0 ? { ...next, h: hue } : next)

interface Channel {
  key: string
  label: string
  max: number
  /** CSS background of the slider track. */
  track: string
  unit: string
  value: number
  set: (value: number) => Hsva
}

/**
 * Color picker panel: theme swatches, a saturation/brightness area, channel
 * sliders (RGB or HSL, with alpha), the value in the chosen format and its
 * contrast on white and black.
 */
export default function ColorPanel({ fallback, onChange, swatches, value }: ColorPanelProps) {
  const [hsva, setHsva] = useState<Hsva>(() => toHsva(value) ?? toHsva(fallback) ?? rgbToHsv(WHITE))
  const [format, setFormat] = useState<ColorFormat>(() => formatOf(value ?? fallback))
  // The last value this panel sent, so its own changes do not reset the hue.
  const emitted = useRef<string | undefined>(value)

  useEffect(() => {
    if (value === emitted.current) return
    emitted.current = value
    const next = toHsva(value)
    if (next) setHsva(current => withHue(next, current.h))
  }, [value])

  const emit = (next: Hsva, nextFormat = format) => {
    setHsva(next)
    const text = formatColor(hsvToRgb(next), nextFormat)
    emitted.current = text
    onChange(text)
  }

  const rgba = hsvToRgb(hsva)
  const hsl = hsvToHsl(hsva)
  const solid = formatColor({ ...rgba, a: 1 }, 'rgb')
  const text = formatColor(rgba, format)

  const rgbChannel = (key: 'r' | 'g' | 'b', label: string): Channel => {
    const at = (n: number) => formatColor({ ...rgba, a: 1, [key]: n }, 'rgb')
    return {
      key,
      label,
      max: 255,
      set: n => withHue(rgbToHsv({ ...rgba, [key]: n }), hsva.h),
      track: `linear-gradient(to right, ${at(0)}, ${at(255)})`,
      unit: '',
      value: rgba[key]
    }
  }

  const hslChannel = (key: 'h' | 's' | 'l', label: string): Channel => {
    const at = (n: number) => {
      const next = { ...hsl, [key]: n }
      return `hsl(${next.h}, ${next.s}%, ${next.l}%)`
    }
    return {
      key,
      label,
      max: key === 'h' ? 360 : 100,
      set: n => ({ ...hslToHsv({ ...hsl, [key]: n }), a: hsva.a, h: key === 'h' ? n : hsva.h }),
      track:
        key === 'h'
          ? 'linear-gradient(to right, red, #ff0, lime, cyan, blue, #f0f, red)'
          : key === 's'
            ? `linear-gradient(to right, ${at(0)}, ${at(100)})`
            : `linear-gradient(to right, #000, ${at(50)}, #fff)`,
      unit: key === 'h' ? '°' : '%',
      value: Math.round(hsl[key])
    }
  }

  const channels: Channel[] = [
    ...(format === 'hsl'
      ? [hslChannel('h', 'H'), hslChannel('s', 'S'), hslChannel('l', 'L')]
      : [rgbChannel('r', 'R'), rgbChannel('g', 'G'), rgbChannel('b', 'B')]),
    {
      key: 'a',
      label: 'A',
      max: 100,
      set: n => ({ ...hsva, a: n / 100 }),
      track: `linear-gradient(to right, transparent, ${solid}), var(--gs-checker)`,
      unit: '%',
      value: Math.round(hsva.a * 100)
    }
  ]

  return (
    <div className="gs-picker">
      {swatches.length > 0 && (
        <div aria-label={__('Theme colors', 'nomistyle')} className="gs-colors" role="group">
          {swatches.map(item => {
            const selected = value?.toLowerCase() === item.color.toLowerCase()
            return (
              <button
                aria-label={item.name}
                aria-pressed={selected}
                className={`gs-swatch${selected ? ' is-selected' : ''}`}
                key={item.color}
                onClick={() => onChange(selected ? undefined : item.color)}
                style={{ background: item.color }}
                title={item.name}
                type="button"
              />
            )
          })}
        </div>
      )}

      <ColorArea hsva={hsva} onChange={emit} />

      <div className="gs-picker__channels">
        {channels.map(item => (
          <label className="gs-picker__channel" key={item.key}>
            <span className="gs-picker__channel-label">{item.label}</span>
            <input
              className="gs-picker__slider"
              max={item.max}
              min={0}
              onChange={event => emit(item.set(Number(event.target.value)))}
              style={{ background: item.track }}
              type="range"
              value={item.value}
            />
            <span className="gs-picker__channel-value">
              {item.value}
              <small>{item.unit}</small>
            </span>
          </label>
        ))}
      </div>

      <div className="gs-picker__value">
        <div className="gs-picker__format">
          <select
            aria-label={__('Color format', 'nomistyle')}
            onChange={event => {
              const next = event.target.value as ColorFormat
              setFormat(next)
              if (value) emit(hsva, next)
            }}
            value={format}
          >
            {COLOR_FORMATS.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <svg aria-hidden viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </div>
        <output className="gs-picker__text">{text}</output>
      </div>

      <div className="gs-picker__footer">
        <span className="gs-picker__contrast">
          <Contrast background={WHITE} color={rgba} label={__('white', 'nomistyle')} />
          <Contrast background={BLACK} color={rgba} label={__('black', 'nomistyle')} />
        </span>
        <span className="gs-picker__actions">
          <button className="gs-text-btn" onClick={() => onChange('transparent')} type="button">
            {__('Transparent', 'nomistyle')}
          </button>
          <button className="gs-text-btn is-destructive" onClick={() => onChange(undefined)} type="button">
            {__('Clear', 'nomistyle')}
          </button>
        </span>
      </div>
    </div>
  )
}

/** Contrast ratio of the color on a white or black page. */
function Contrast({ background, color, label }: { background: typeof WHITE; color: typeof WHITE; label: string }) {
  const ratio = contrastRatio(color, background).toFixed(1)
  return (
    <span
      className="gs-picker__ratio"
      title={sprintf(
        /* translators: 1: contrast ratio, e.g. "4.5", 2: "white" or "black" */
        __('Contrast %1$s:1 on %2$s', 'nomistyle'),
        ratio,
        label
      )}
    >
      <span aria-hidden className="gs-picker__ratio-chip" style={{ background: formatColor(background, 'hex') }} />
      {ratio}:1
    </span>
  )
}

/** Saturation (left to right) and brightness (bottom to top) for the current hue. Drag, click or use the arrow keys. */
function ColorArea({ hsva, onChange }: { hsva: Hsva; onChange: (next: Hsva) => void }) {
  const area = useRef<HTMLDivElement>(null)

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const box = area.current?.getBoundingClientRect()
    if (!box || box.width === 0 || box.height === 0) return
    const s = Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100))
    const v = Math.min(100, Math.max(0, 100 - ((event.clientY - box.top) / box.height) * 100))
    onChange({ ...hsva, s, v })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1
    const moves: Record<string, [number, number]> = {
      ArrowDown: [0, -step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step]
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    onChange({
      ...hsva,
      s: Math.min(100, Math.max(0, hsva.s + move[0])),
      v: Math.min(100, Math.max(0, hsva.v + move[1]))
    })
  }

  return (
    <div
      aria-label={__('Saturation and brightness', 'nomistyle')}
      aria-valuetext={sprintf(
        /* translators: 1: saturation percent, 2: brightness percent */
        __('Saturation %1$d%%, brightness %2$d%%', 'nomistyle'),
        Math.round(hsva.s),
        Math.round(hsva.v)
      )}
      className="gs-picker__area"
      onKeyDown={onKeyDown}
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId)
        moveTo(event)
      }}
      onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && moveTo(event)}
      ref={area}
      role="slider"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsva.h}, 100%, 50%))` }}
      tabIndex={0}
    >
      <span
        className="gs-picker__handle"
        style={{
          background: formatColor({ ...hsvToRgb(hsva), a: 1 }, 'hex'),
          left: `${hsva.s}%`,
          top: `${100 - hsva.v}%`
        }}
      />
    </div>
  )
}
