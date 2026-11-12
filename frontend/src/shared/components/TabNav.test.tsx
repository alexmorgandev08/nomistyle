import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TabNav, { tabId } from './TabNav'

const TABS = [
  { id: 'scope', label: 'Where it applies' },
  { id: 'exclusions', label: 'Excluded content' },
  { id: 'force', label: 'Force Style' }
]

const renderTabs = (value: string, onChange = vi.fn()) => {
  render(<TabNav idPrefix="t" label="Settings sections" onChange={onChange} tabs={TABS} value={value} />)
  return onChange
}

afterEach(cleanup)

describe('TabNav', () => {
  it('marks only the active tab as selected and focusable', () => {
    renderTabs('exclusions')

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map(tab => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(tabs.map(tab => tab.tabIndex)).toEqual([-1, 0, -1])
    expect(tabs[1].id).toBe(tabId('t', 'exclusions'))
    expect(tabs[1].getAttribute('aria-controls')).toBe('t-panel')
  })

  it('opens a tab on click', () => {
    const onChange = renderTabs('scope')
    fireEvent.click(screen.getByRole('tab', { name: 'Force Style' }))
    expect(onChange).toHaveBeenCalledWith('force')
  })

  it('moves with arrow keys, wraps around, and jumps with Home and End', () => {
    const onChange = renderTabs('scope')
    const list = screen.getByRole('tablist', { name: 'Settings sections' })

    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(document.activeElement?.id).toBe(tabId('t', 'exclusions'))
    fireEvent.keyDown(list, { key: 'ArrowLeft' })
    fireEvent.keyDown(list, { key: 'End' })
    fireEvent.keyDown(list, { key: 'Home' })
    fireEvent.keyDown(list, { key: 'Enter' })

    expect(onChange.mock.calls.map(call => call[0])).toEqual(['exclusions', 'force', 'force', 'scope'])
  })
})

describe('TabNav vertical', () => {
  it('moves with Up and Down instead of Left and Right', () => {
    const onChange = vi.fn()
    render(<TabNav idPrefix="v" label="Sections" onChange={onChange} orientation="vertical" tabs={TABS} value="scope" />)
    const list = screen.getByRole('tablist', { name: 'Sections' })

    expect(list.getAttribute('aria-orientation')).toBe('vertical')
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    fireEvent.keyDown(list, { key: 'ArrowRight' })
    fireEvent.keyDown(list, { key: 'ArrowUp' })

    expect(onChange.mock.calls.map(call => call[0])).toEqual(['exclusions', 'force'])
  })

  it('shows a badge after the label', () => {
    render(
      <TabNav
        idPrefix="b"
        label="Sections"
        onChange={() => undefined}
        tabs={[{ badge: <span>PRO</span>, id: 'ai', label: 'AI assistant' }]}
        value="ai"
      />
    )
    expect(screen.getByRole('tab').textContent).toBe('AI assistantPRO')
  })
})
