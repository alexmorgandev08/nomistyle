import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('./showProFeatures', () => ({ SHOW_PRO_FEATURES: false }))

beforeAll(() => {
  // data.ts reads the page's localized data when it loads.
  vi.stubGlobal('gutenStyleAdmin', { restNamespace: 'guten-style/v1', upgradeUrl: 'https://example.test/pricing' })
})

afterEach(cleanup)

describe('Pro features turned off', () => {
  it('lists no Pro blocks, tools or settings sections', async () => {
    const { lockedBlocks } = await import('../lockedBlocks')
    const { proTools } = await import('../tools/proTools')
    const { licenseSection, planSections } = await import('../settings/planSections')

    expect(lockedBlocks()).toEqual([])
    expect(proTools()).toEqual([])
    expect(planSections()).toEqual([])
    expect(licenseSection()).toBeNull()
  })

  it('shows no Pro setting rows and no upgrade link for saved presets', async () => {
    const { default: ProSettingRow } = await import('./ProSettingRow')
    const { default: SavePreset } = await import('../presets/SavePreset')

    const { container } = render(
      <>
        <ProSettingRow description="Pro only" title="Pro setting" />
        <SavePreset onSave={() => Promise.resolve()} values={{}} />
      </>
    )

    expect(container.innerHTML).toBe('')
  })
})
