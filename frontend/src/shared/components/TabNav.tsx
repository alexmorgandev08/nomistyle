import { type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem {
  /** Shown after the label, e.g. a PRO tag. */
  badge?: ReactNode
  icon?: ReactNode
  id: string
  label: string
}

interface TabNavProps {
  /** Names the tab list for screen readers, e.g. "Settings sections". */
  label: string
  onChange: (id: string) => void
  /** Prefix for the tab and panel ids; the panel uses `${idPrefix}-panel`. */
  idPrefix: string
  /** A row of tabs (default) or a vertical list, e.g. a settings sidebar. */
  orientation?: 'horizontal' | 'vertical'
  tabs: TabItem[]
  value: string
}

/** The id of the tab button, for the panel's `aria-labelledby`. */
export const tabId = (idPrefix: string, id: string) => `${idPrefix}-tab-${id}`

/**
 * A row (or vertical list) of tabs with optional icons and badges.
 * Follows the ARIA tabs pattern: arrow keys (Left/Right, or Up/Down when vertical), Home and End.
 * Render the panel yourself with role="tabpanel", id `${idPrefix}-panel`
 * and aria-labelledby={tabId(idPrefix, value)}.
 */
export default function TabNav({ idPrefix, label, onChange, orientation = 'horizontal', tabs, value }: TabNavProps) {
  const vertical = orientation === 'vertical'

  const focusTab = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length]
    onChange(next.id)
    document.getElementById(tabId(idPrefix, next.id))?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex(tab => tab.id === value)
    const [previous, next] = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
    const moves: Record<string, number> = { [next]: index + 1, [previous]: index - 1, End: tabs.length - 1, Home: 0 }
    if (!(event.key in moves)) return
    event.preventDefault()
    focusTab(moves[event.key])
  }

  return (
    <div
      aria-label={label}
      aria-orientation={orientation}
      className={`gs-tab-nav${vertical ? ' gs-tab-nav--vertical' : ''}`}
      onKeyDown={onKeyDown}
      role="tablist"
    >
      {tabs.map(tab => {
        const selected = tab.id === value
        return (
          <button
            aria-controls={`${idPrefix}-panel`}
            aria-selected={selected}
            className={`gs-tab-nav__tab${selected ? ' is-active' : ''}`}
            id={tabId(idPrefix, tab.id)}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {tab.icon && (
              <span aria-hidden className="gs-tab-nav__icon">
                {tab.icon}
              </span>
            )}
            <span className="gs-tab-nav__label">{tab.label}</span>
            {tab.badge}
          </button>
        )
      })}
    </div>
  )
}
