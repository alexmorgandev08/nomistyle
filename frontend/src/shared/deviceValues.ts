import { getControls, type StyleValues } from './schema'

const DEVICES = new Set(['mobile', 'tablet'])

/** Controls whose tablet and mobile values GutenStyle (free) outputs. Same as PHP's DeviceValues::freeKeys(). */
export const freeDeviceKeys = (type: string): string[] =>
  getControls(type)
    .filter(control => control.responsive && control.freeResponsive)
    .map(control => control.key)

/** Every control that can have tablet and mobile values. Same as PHP's DeviceValues::allKeys(). */
export const allDeviceKeys = (type: string): string[] =>
  getControls(type)
    .filter(control => control.responsive)
    .map(control => control.key)

/**
 * The values without tablet and mobile values of controls that are not allowed, so previews show
 * what the front end outputs. Same as PHP's DeviceValues::filter().
 */
export function filterDeviceValues(values: StyleValues, allowedKeys: string[]): StyleValues {
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => {
      const [base, variant] = key.split('@')
      return variant === undefined || !DEVICES.has(variant) || allowedKeys.includes(base)
    })
  )
}
