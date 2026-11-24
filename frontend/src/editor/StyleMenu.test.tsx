import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import StyleMenu from './StyleMenu'

// The real @wordpress/components cannot load here: its @wordpress/date dependency finds a second copy
// of moment without timezone data. These stand-ins keep the parts StyleMenu relies on.
vi.mock('@wordpress/components', async () => {
  const { useState } = await import('react')
  return {
    DropdownMenu: ({ children, label }: { children: (props: { onClose: () => void }) => ReactNode; label: string }) => {
      const [open, setOpen] = useState(false)
      return (
        <div>
          <button aria-label={label} onClick={() => setOpen(true)} type="button" />
          {open && <div role="menu">{children({ onClose: () => setOpen(false) })}</div>}
        </div>
      )
    },
    MenuGroup: ({ children }: { children: ReactNode }) => <div role="group">{children}</div>,
    MenuItem: ({ children, disabled, info, onClick }: { children: ReactNode; disabled?: boolean; info?: string; onClick: () => void }) => (
      <button disabled={disabled} onClick={onClick} role="menuitem" type="button">
        {children}
        {info && <span>{info}</span>}
      </button>
    )
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const renderMenu = (props: Partial<Parameters<typeof StyleMenu>[0]> = {}) => {
  const handlers = { onCopy: vi.fn(), onPaste: vi.fn(), onReset: vi.fn() }
  render(
    <StyleMenu
      canCopyOrReset
      canPaste
      globalStyleUrl="https://example.test/wp-admin/admin.php?page=nomistyle#/styles/table"
      pasteHint="Copy a table style first."
      resetLabel="Reset this table"
      {...handlers}
      {...props}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Nomi Style actions' }))
  return handlers
}

describe('StyleMenu', () => {
  it('copies, pastes and resets', () => {
    const handlers = renderMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy style' }))
    expect(handlers.onCopy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Nomi Style actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Reset this table' }))
    expect(handlers.onReset).toHaveBeenCalledTimes(1)
  })

  it('disables paste until a style of this block type is copied, and says why', () => {
    renderMenu({ canPaste: false })
    const paste = screen.getByRole('menuitem', { name: /Paste style/ })
    expect(paste.getAttribute('aria-disabled') ?? String((paste as HTMLButtonElement).disabled)).toMatch(/true/)
    expect(paste.textContent).toContain('Copy a table style first.')
  })

  it('opens the block in Global Styles in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    renderMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: /Edit global style/ }))
    expect(open).toHaveBeenCalledWith('https://example.test/wp-admin/admin.php?page=nomistyle#/styles/table', '_blank', 'noopener,noreferrer')
  })

  it('leaves out "Edit global style" for users who cannot manage it', () => {
    renderMenu({ globalStyleUrl: undefined })
    expect(screen.queryByRole('menuitem', { name: /Edit global style/ })).toBeNull()
  })

  it('shows extra actions, such as Save as preset, before the reset action', () => {
    const onClick = vi.fn()
    renderMenu({ extraActions: [{ info: 'Use this look on other blocks', label: 'Save as preset', onClick }] })

    const items = screen.getAllByRole('menuitem').map(item => item.textContent)
    expect(items.indexOf('Save as presetUse this look on other blocks')).toBe(items.length - 2)

    fireEvent.click(screen.getByRole('menuitem', { name: /Save as preset/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
