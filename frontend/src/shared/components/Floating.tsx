import { autoUpdate, flip, offset, type Placement, shift, useFloating } from '@floating-ui/react-dom'
import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'

interface FloatingProps {
  /** Element the layer is positioned against. Nothing renders until it exists. */
  anchor: HTMLElement | null
  children: ReactNode
  className?: string
  /** Move focus to the first focusable element inside when the layer opens. */
  focusOnMount?: boolean
  gap?: number
  /** Called on Escape or a pointer press outside the layer and the anchor. */
  onDismiss?: () => void
  placement?: Placement
}

/**
 * A floating layer (popover, suggestion list) rendered in document.body and kept next to its anchor.
 * It has no dependency on @wordpress/components, so it works in the editor (WordPress React)
 * and in the admin app (bundled React).
 */
export default function Floating({
  anchor,
  children,
  className = '',
  focusOnMount = false,
  gap = 4,
  onDismiss,
  placement = 'bottom-start'
}: FloatingProps) {
  const { elements, floatingStyles, refs } = useFloating({
    elements: { reference: anchor },
    middleware: [offset(gap), flip(), shift({ padding: 8 })],
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate
  })
  const layer = elements.floating

  useEffect(() => {
    if (focusOnMount) layer?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  }, [focusOnMount, layer])

  useEffect(() => {
    if (!onDismiss) return undefined
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (layer?.contains(target) || anchor?.contains(target)) return
      onDismiss()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Stop here, so the block editor does not also handle Escape (it would deselect the block).
      event.stopPropagation()
      onDismiss()
      if (layer?.contains(document.activeElement)) anchor?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [anchor, layer, onDismiss])

  if (!anchor) return null

  return createPortal(
    <div className={`gs-floating ${className}`} ref={refs.setFloating} style={floatingStyles}>
      {children}
    </div>,
    document.body
  )
}
