import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('./showProFeatures', () => ({ SHOW_PRO_FEATURES: false }))

let modules: {
  licenseSection: typeof import('../settings/planSections').licenseSection
  lockedBlocks: typeof import('../lockedBlocks').lockedBlocks
  planSections: typeof import('../settings/planSections').planSections
  proTools: typeof import('../tools/proTools').proTools
  ProSettingRow: typeof import('./ProSettingRow').default
  SavePreset: typeof import('../presets/SavePreset').default
}

// The modules load antd, which is slow when the whole suite runs in parallel.
beforeAll(async () => {
  // data.ts reads the page's localized data when it loads.
  vi.stubGlobal('gutenStyleAdmin', { restNamespace: 'nomistyle/v1', upgradeUrl: 'https://example.test/pricing' })
  const [blocks, tools, plan, row, preset] = await Promise.all([
    import('../lockedBlocks'),
    import('../tools/proTools'),
    import('../settings/planSections'),
    import('./ProSettingRow'),
    import('../presets/SavePreset')
  ])
  modules = {
    licenseSection: plan.licenseSection,
    lockedBlocks: blocks.lockedBlocks,
    planSections: plan.planSections,
    proTools: tools.proTools,
    ProSettingRow: row.default,
    SavePreset: preset.default
  }
}, 30_000)

afterEach(cleanup)

describe('Pro features turned off', () => {
  it('lists no Pro blocks, tools or settings sections', () => {
    expect(modules.lockedBlocks()).toEqual([])
    expect(modules.proTools()).toEqual([])
    expect(modules.planSections()).toEqual([])
    expect(modules.licenseSection()).toBeNull()
  })

  it('shows no Pro setting rows and no upgrade link for saved presets', () => {
    const { ProSettingRow, SavePreset } = modules
    const { container } = render(
      <>
        <ProSettingRow description="Pro only" title="Pro setting" />
        <SavePreset onSave={() => Promise.resolve()} values={{}} />
      </>
    )

    expect(container.innerHTML).toBe('')
  })
})
