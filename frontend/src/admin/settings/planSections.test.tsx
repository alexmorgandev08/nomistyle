import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { type SettingsSection } from './types'

vi.mock('../upgrade/showProFeatures', () => ({ SHOW_PRO_FEATURES: true }))

const UPGRADE_URL = 'https://example.test/pricing'
let featureSections: SettingsSection[]
let sections: SettingsSection[]

beforeAll(async () => {
  // data.ts reads the page's localized data when it loads.
  vi.stubGlobal('gutenStyleAdmin', { upgradeUrl: UPGRADE_URL })
  const plan = await import('./planSections')
  featureSections = plan.planSections()
  sections = [...featureSections, plan.licenseSection()!]
})

afterEach(cleanup)

describe('free plan sections', () => {
  it('lists the Pro-only sections, each with a PRO tag', () => {
    expect(featureSections.map(section => section.id)).toEqual(['third-party', 'ai', 'mcp', 'import-export'])
    expect(featureSections.every(section => section.badge)).toBe(true)
  })

  it.each(['third-party', 'ai', 'mcp', 'import-export', 'license'])('%s links to the pricing page', id => {
    const section = sections.find(item => item.id === id)!
    render(
      <>
        {section.render({
          config: {
            advanced: { contentSelector: '', cssFile: false, deleteOnUninstall: false, onlyUsedBlocks: true },
            breakpoints: null,
            editor: { allowBlockStyles: true, allowPostStyles: true, roles: [], showSource: true },
            forceStyle: false,
            postTypes: [],
            styles: {},
            themeColors: true
          },
          onChange: () => undefined
        })}
      </>
    )

    const link = screen.getByRole('link', { name: 'Upgrade to Pro' })
    expect(link.getAttribute('href')).toBe(UPGRADE_URL)
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
