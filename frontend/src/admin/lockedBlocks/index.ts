import { lockedBlocks } from './lockedBlocks'
import { type LockedBlock } from './types'

export const findLockedBlock = (type: string | undefined): LockedBlock | undefined =>
  type === undefined ? undefined : lockedBlocks().find(block => block.type === type)

export { lockedBlocks } from './lockedBlocks'
export { type LockedBlock } from './types'
