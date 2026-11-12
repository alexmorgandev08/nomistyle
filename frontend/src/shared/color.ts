/**
 * Color parsing, conversion and formatting for the color picker and the
 * readability check. No dependencies: values follow CSS Color 4.
 */

/** Channels 0–255, alpha 0–1. */
export interface Rgba {
  a: number
  b: number
  g: number
  r: number
}

/** Hue 0–360, saturation and value 0–100, alpha 0–1. */
export interface Hsva {
  a: number
  h: number
  s: number
  v: number
}

/** Hue 0–360, saturation and lightness 0–100. */
export interface Hsl {
  h: number
  l: number
  s: number
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl'

export const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl']

/** CSS named colors (CSS Color 4), name → hex. */
export const NAMED_COLORS: Record<string, string> = Object.fromEntries(
  (
    'aliceblue:f0f8ff antiquewhite:faebd7 aqua:00ffff aquamarine:7fffd4 azure:f0ffff beige:f5f5dc bisque:ffe4c4 ' +
    'black:000000 blanchedalmond:ffebcd blue:0000ff blueviolet:8a2be2 brown:a52a2a burlywood:deb887 cadetblue:5f9ea0 ' +
    'chartreuse:7fff00 chocolate:d2691e coral:ff7f50 cornflowerblue:6495ed cornsilk:fff8dc crimson:dc143c cyan:00ffff ' +
    'darkblue:00008b darkcyan:008b8b darkgoldenrod:b8860b darkgray:a9a9a9 darkgreen:006400 darkgrey:a9a9a9 ' +
    'darkkhaki:bdb76b darkmagenta:8b008b darkolivegreen:556b2f darkorange:ff8c00 darkorchid:9932cc darkred:8b0000 ' +
    'darksalmon:e9967a darkseagreen:8fbc8f darkslateblue:483d8b darkslategray:2f4f4f darkslategrey:2f4f4f ' +
    'darkturquoise:00ced1 darkviolet:9400d3 deeppink:ff1493 deepskyblue:00bfff dimgray:696969 dimgrey:696969 ' +
    'dodgerblue:1e90ff firebrick:b22222 floralwhite:fffaf0 forestgreen:228b22 fuchsia:ff00ff gainsboro:dcdcdc ' +
    'ghostwhite:f8f8ff gold:ffd700 goldenrod:daa520 gray:808080 green:008000 greenyellow:adff2f grey:808080 ' +
    'honeydew:f0fff0 hotpink:ff69b4 indianred:cd5c5c indigo:4b0082 ivory:fffff0 khaki:f0e68c lavender:e6e6fa ' +
    'lavenderblush:fff0f5 lawngreen:7cfc00 lemonchiffon:fffacd lightblue:add8e6 lightcoral:f08080 lightcyan:e0ffff ' +
    'lightgoldenrodyellow:fafad2 lightgray:d3d3d3 lightgreen:90ee90 lightgrey:d3d3d3 lightpink:ffb6c1 ' +
    'lightsalmon:ffa07a lightseagreen:20b2aa lightskyblue:87cefa lightslategray:778899 lightslategrey:778899 ' +
    'lightsteelblue:b0c4de lightyellow:ffffe0 lime:00ff00 limegreen:32cd32 linen:faf0e6 magenta:ff00ff maroon:800000 ' +
    'mediumaquamarine:66cdaa mediumblue:0000cd mediumorchid:ba55d3 mediumpurple:9370db mediumseagreen:3cb371 ' +
    'mediumslateblue:7b68ee mediumspringgreen:00fa9a mediumturquoise:48d1cc mediumvioletred:c71585 ' +
    'midnightblue:191970 mintcream:f5fffa mistyrose:ffe4e1 moccasin:ffe4b5 navajowhite:ffdead navy:000080 ' +
    'oldlace:fdf5e6 olive:808000 olivedrab:6b8e23 orange:ffa500 orangered:ff4500 orchid:da70d6 ' +
    'palegoldenrod:eee8aa palegreen:98fb98 paleturquoise:afeeee palevioletred:db7093 papayawhip:ffefd5 ' +
    'peachpuff:ffdab9 peru:cd853f pink:ffc0cb plum:dda0dd powderblue:b0e0e6 purple:800080 rebeccapurple:663399 ' +
    'red:ff0000 rosybrown:bc8f8f royalblue:4169e1 saddlebrown:8b4513 salmon:fa8072 sandybrown:f4a460 ' +
    'seagreen:2e8b57 seashell:fff5ee sienna:a0522d silver:c0c0c0 skyblue:87ceeb slateblue:6a5acd slategray:708090 ' +
    'slategrey:708090 snow:fffafa springgreen:00ff7f steelblue:4682b4 tan:d2b48c teal:008080 thistle:d8bfd8 ' +
    'tomato:ff6347 turquoise:40e0d0 violet:ee82ee wheat:f5deb3 white:ffffff whitesmoke:f5f5f5 yellow:ffff00 ' +
    'yellowgreen:9acd32'
  )
    .split(' ')
    .map(entry => {
      const [name, hex] = entry.split(':')
      return [name, `#${hex}`]
    })
)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number, digits = 0) => Math.round(value * 10 ** digits) / 10 ** digits

/** "50%" → 0.5 × `scale`; "128" → 128. Not a number → NaN. */
const channel = (text: string, scale: number) => (text.endsWith('%') ? (parseFloat(text) / 100) * scale : Number(text))
const alphaOf = (text: string | undefined) => (text === undefined ? 1 : channel(text, 1))
const argsOf = (text: string) => text.split(/[\s,/]+/).filter(Boolean)

/**
 * Parses hex (#rgb, #rgba, #rrggbb, #rrggbbaa), rgb()/rgba(), hsl()/hsla(),
 * named colors and `transparent`. Other values (currentColor, var()) return null.
 */
export function parseRgba(value: string | undefined): Rgba | null {
  const text = value?.trim().toLowerCase() ?? ''
  if (text === 'transparent') return { a: 0, b: 0, g: 0, r: 0 }
  if (NAMED_COLORS[text]) return parseRgba(NAMED_COLORS[text])

  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text)
  if (hex) {
    const digits = hex[1].length <= 4 ? [...hex[1]].map(c => c + c).join('') : hex[1]
    const [r, g, b, a = 255] = (digits.match(/../g) ?? []).map(pair => parseInt(pair, 16))
    return { a: round(a / 255, 3), b, g, r }
  }

  const rgb = /^rgba?\((.*)\)$/.exec(text)
  if (rgb) {
    const [r, g, b, a] = argsOf(rgb[1])
    return checked({ a: alphaOf(a), b: channel(b ?? '', 255), g: channel(g ?? '', 255), r: channel(r ?? '', 255) })
  }

  const hsl = /^hsla?\((.*)\)$/.exec(text)
  if (hsl) {
    const [h, s, l, a] = argsOf(hsl[1])
    const parsed = { h: parseFloat(h ?? ''), l: parseFloat(l ?? ''), s: parseFloat(s ?? '') }
    if (Object.values(parsed).some(Number.isNaN)) return null
    return checked({ ...hslToRgb(parsed), a: alphaOf(a) })
  }

  return null
}

const checked = (color: Rgba): Rgba | null => {
  if (Object.values(color).some(Number.isNaN)) return null
  return {
    a: clamp(color.a, 0, 1),
    b: clamp(Math.round(color.b), 0, 255),
    g: clamp(Math.round(color.g), 0, 255),
    r: clamp(Math.round(color.r), 0, 255)
  }
}

export function rgbToHsv({ a, b, g, r }: Rgba): Hsva {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const delta = max - Math.min(rn, gn, bn)
  let h = 0
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
  }
  return { a, h: (h * 60 + 360) % 360, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 }
}

export function hsvToRgb({ a, h, s, v }: Hsva): Rgba {
  const sn = s / 100
  const vn = v / 100
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return Math.round((vn - vn * sn * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
  }
  return { a, b: f(1), g: f(3), r: f(5) }
}

export function hslToRgb({ h, l, s }: Hsl): Rgba {
  return hsvToRgb({ ...hslToHsv({ h, l, s }), a: 1 })
}

/** HSV and HSL share the hue, so converting between them keeps it, even for grays. */
export function hsvToHsl({ h, s, v }: Hsva): Hsl {
  const sn = s / 100
  const vn = v / 100
  const l = vn * (1 - sn / 2)
  const sl = l === 0 || l === 1 ? 0 : (vn - l) / Math.min(l, 1 - l)
  return { h, l: l * 100, s: sl * 100 }
}

export function hslToHsv({ h, l, s }: Hsl): Omit<Hsva, 'a'> {
  const ln = clamp(l, 0, 100) / 100
  const sn = clamp(s, 0, 100) / 100
  const v = ln + sn * Math.min(ln, 1 - ln)
  return { h: ((h % 360) + 360) % 360, s: v === 0 ? 0 : 2 * (1 - ln / v) * 100, v: v * 100 }
}

const hexPair = (value: number) => Math.round(value).toString(16).padStart(2, '0')

/** Writes a color the way the value sanitizer accepts it. Alpha below 1 adds an alpha part. */
export function formatColor(color: Rgba, format: ColorFormat): string {
  const { a, b, g, r } = color
  const opaque = a >= 1
  const alpha = String(round(a, 2))

  if (format === 'rgb') return opaque ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`

  if (format === 'hsl') {
    const { h, l, s } = hsvToHsl(rgbToHsv(color))
    const parts = `${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%`
    return opaque ? `hsl(${parts})` : `hsla(${parts}, ${alpha})`
  }

  return `#${hexPair(r)}${hexPair(g)}${hexPair(b)}${opaque ? '' : hexPair(a * 255)}`
}

/** The format a value is written in, so edits keep it. */
export function formatOf(value: string | undefined): ColorFormat {
  const text = value?.trim().toLowerCase() ?? ''
  if (text.startsWith('rgb')) return 'rgb'
  if (text.startsWith('hsl')) return 'hsl'
  return 'hex'
}

const luminance = ({ b, g, r }: Rgba) => {
  const linear = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** WCAG 2.x contrast ratio, 1–21. Alpha is ignored. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}
