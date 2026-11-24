import { beforeAll, describe, expect, it, vi } from 'vitest'

// The Pro blocks are listed only while the free plugin shows Pro features.
vi.mock('../admin/upgrade/showProFeatures', () => ({ SHOW_PRO_FEATURES: true }))

const FREE_BLOCKS = ['table', 'heading', 'list', 'quote', 'details', 'button', 'image']

let blockTypes: string[]
let lockedTypes: string[]

beforeAll(async () => {
  // data.ts reads the page's localized data when it loads.
  vi.stubGlobal('gutenStyleAdmin', { restNamespace: 'nomistyle/v1', upgradeUrl: 'https://example.test' })
  blockTypes = (await import('./schema')).blockTypes
  lockedTypes = (await import('../admin/lockedBlocks')).lockedBlocks().map(block => block.type)
})

describe('blocks of the free plugin', () => {
  it('styles only its own blocks', () => {
    expect(blockTypes).toEqual(FREE_BLOCKS)
  })

  it('lists the Pro blocks as locked entries, none of them a free block', () => {
    expect(lockedTypes).toHaveLength(12)
    expect(lockedTypes.filter(type => blockTypes.includes(type))).toEqual([])
  })
})
