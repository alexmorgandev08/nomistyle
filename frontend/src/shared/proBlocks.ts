import { type BlockSchema } from './schema'

/** The free build has no Pro blocks. Free shows them only as PRO entries in Global Styles (admin/proBlocks.free.tsx). */
export const proBlocks = (): Record<string, BlockSchema> => ({})
