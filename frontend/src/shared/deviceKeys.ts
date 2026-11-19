import { freeDeviceKeys } from './deviceValues'

/**
 * Controls of a block type whose tablet and mobile values apply: Block Style outputs the ones the schema
 * marks as free. Block Style Pro replaces this module (all responsive controls, Settings › Responsive).
 */
export const deviceKeys = (type: string, _pro: Record<string, unknown> | undefined): string[] => freeDeviceKeys(type)
