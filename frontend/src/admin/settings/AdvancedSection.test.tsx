import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from 'antd'
import { type ComponentType } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { type Config } from '../data'
import { type SectionProps } from './types'

const apiFetch = vi.fn()
vi.mock('@wordpress/api-fetch', () => ({ default: (options: unknown) => apiFetch(options) }))

const CONFIG: Config = {
  advanced: { contentSelector: '', cssFile: false, deleteOnUninstall: false, onlyUsedBlocks: true },
  breakpoints: null,
  editor: { allowBlockStyles: true, allowPostStyles: true, roles: [], showSource: true },
  forceStyle: false,
  postTypes: ['post'],
  styles: {},
  themeColors: true
}

let AdvancedSection: ComponentType<SectionProps>

beforeAll(async () => {
  vi.stubGlobal('gutenStyleAdmin', { config: CONFIG, restNamespace: 'nomistyle/v1', upgradeUrl: 'https://example.test' })
  AdvancedSection = (await import('./AdvancedSection')).default
})

afterEach(() => {
  cleanup()
  apiFetch.mockReset()
})

const renderSection = (onChange = vi.fn()) => {
  apiFetch.mockImplementation(({ path }: { path: string }) => Promise.resolve(path.endsWith('/css') ? { inUse: false } : CONFIG))
  render(
    <QueryClientProvider client={new QueryClient()}>
      <App>
        <AdvancedSection config={CONFIG} onChange={onChange} />
      </App>
    </QueryClientProvider>
  )
  return onChange
}

describe('AdvancedSection', () => {
  it('saves a valid content selector, normalized', () => {
    const onChange = renderSection()
    fireEvent.change(screen.getByRole('textbox', { name: 'Content area selector' }), { target: { value: '  .entry-content   main ' } })

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ advanced: expect.objectContaining({ contentSelector: '.entry-content main' }) }))
  })

  it('shows an error and does not save a selector the server would drop', () => {
    const onChange = renderSection()
    fireEvent.change(screen.getByRole('textbox', { name: 'Content area selector' }), { target: { value: '.x{} body{display:none}' } })

    expect(screen.getByRole('alert').textContent).toContain('without commas')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('resets only after the confirmation', async () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: 'Reset everything' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('Block styles saved inside posts stay')
    expect(apiFetch).not.toHaveBeenCalledWith(expect.objectContaining({ path: '/nomistyle/v1/reset' }))

    const confirm = [...dialog.querySelectorAll('button')].find(button => button.textContent === 'Reset everything')!
    fireEvent.click(confirm)
    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith({ method: 'POST', path: '/nomistyle/v1/reset' }))
  })
})
