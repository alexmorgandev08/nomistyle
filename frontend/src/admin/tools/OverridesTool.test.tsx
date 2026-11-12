import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from 'antd'
import { type ComponentType } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { type OverridePost } from '../data'

const apiFetch = vi.fn()
vi.mock('@wordpress/api-fetch', () => ({ default: (options: unknown) => apiFetch(options) }))

const POST: OverridePost = {
  blockStyles: 3,
  editUrl: 'https://example.test/wp-admin/post.php?post=7&action=edit',
  id: 7,
  modified: '2026-11-10T08:30:00+00:00',
  postStyles: 1,
  status: 'Published',
  title: 'Pricing',
  type: 'Page',
  viewUrl: 'https://example.test/pricing/'
}

let OverridesTool: ComponentType

beforeAll(async () => {
  vi.stubGlobal('gutenStyleAdmin', { restNamespace: 'guten-style/v1', upgradeUrl: 'https://example.test' })
  OverridesTool = (await import('./OverridesTool')).default
})

afterEach(() => {
  cleanup()
  apiFetch.mockReset()
})

const renderTool = (items: OverridePost[]) => {
  apiFetch.mockImplementation(({ method }: { method?: string }) =>
    Promise.resolve(method === 'DELETE' ? { revisionId: 12 } : { items, total: items.length })
  )
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <App>
        <OverridesTool />
      </App>
    </QueryClientProvider>
  )
}

describe('OverridesTool', () => {
  it('lists posts with their counts', async () => {
    renderTool([POST])

    expect((await screen.findByRole('link', { name: 'Pricing' })).getAttribute('href')).toBe(POST.editUrl)
    expect(screen.getByText('1 block type')).toBeTruthy()
    expect(screen.getByText('3 blocks')).toBeTruthy()
    expect(apiFetch).toHaveBeenCalledWith({ path: '/guten-style/v1/overrides?page=1&perPage=20' })
  })

  it('shows the empty state', async () => {
    renderTool([])

    expect(await screen.findByText('No posts have overrides. All posts use the global styles.')).toBeTruthy()
  })

  it('removes overrides only after the confirmation', async () => {
    renderTool([POST])
    fireEvent.click(await screen.findByRole('button', { name: 'Remove' }))

    const popup = await screen.findByText('Remove the overrides?')
    expect(apiFetch).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE' }))

    const confirm = [...popup.closest('.ant-popover')!.querySelectorAll('button')].find(button => button.textContent === 'Remove')!
    fireEvent.click(confirm)
    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith({ method: 'DELETE', path: '/guten-style/v1/overrides/7' }))
    expect(await screen.findByText(/restore the last revision/)).toBeTruthy()
  })
})
