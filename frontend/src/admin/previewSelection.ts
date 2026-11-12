/**
 * Marks the selected block type inside the preview frame: an outline on each
 * sample block and a name badge above the first one, like the block editor.
 */
const ACCENT = '#ec3013'

export const SELECTION_CSS = `
.gs-preview-sample { position: relative; }
.gs-preview-sample [data-gs-selected] { border-radius: 4px; outline: 2px solid ${ACCENT}; outline-offset: 6px; }
.gs-preview-badge {
  background: ${ACCENT}; border-radius: 6px; color: #fff; letter-spacing: 0; margin: 0 !important; padding: 3px 8px;
  font: 400 11px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: none; position: absolute; text-transform: none; white-space: nowrap; z-index: 10;
}
`

const BADGE_CLASS = 'gs-preview-badge'

/**
 * Called with a type and badge text when the selection changes; called without
 * them (for example on resize) to re-place the badge for the last selection.
 */
export function markSelection(doc: Document, type?: string, badge?: string): void {
  const body = doc.body
  if (type !== undefined) body.dataset.gsSelectedType = type
  if (badge !== undefined) body.dataset.gsBadge = badge
  const selected = body.dataset.gsSelectedType
  const text = body.dataset.gsBadge

  doc.querySelectorAll('[data-gs-selected]').forEach(element => element.removeAttribute('data-gs-selected'))
  doc.querySelectorAll(`.${BADGE_CLASS}`).forEach(element => element.remove())
  if (!selected) return

  const section = doc.querySelector<HTMLElement>(`[data-gs-sample="${selected}"]`)
  const blocks = section ? [...section.querySelectorAll<HTMLElement>(`.gs.gs-${selected}`)] : []
  blocks.forEach(element => element.setAttribute('data-gs-selected', ''))
  if (!section || blocks.length === 0 || !text) return

  const label = doc.createElement('span')
  label.className = BADGE_CLASS
  label.setAttribute('aria-hidden', 'true')
  label.textContent = text
  section.append(label)

  const sectionBox = section.getBoundingClientRect()
  const blockBox = blocks[0].getBoundingClientRect()
  label.style.top = `${blockBox.top - sectionBox.top - label.offsetHeight - 8}px`
  label.style.left = `${blockBox.left - sectionBox.left - 8}px`
}
