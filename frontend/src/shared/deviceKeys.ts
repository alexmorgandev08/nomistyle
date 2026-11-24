import { freeDeviceKeys } from './deviceValues'

/**
 * Controls of a block type whose tablet and mobile values apply: Nomi Style outputs the ones the schema
 * marks as free. Nomi Style Pro replaces this module (all responsive controls, Settings › Responsive).
 */
export const deviceKeys = (type: string, _pro: Record<string, unknown> | undefined): string[] => freeDeviceKeys(type)
