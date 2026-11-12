import { useId, useState } from 'react'
import { type ReactNode } from 'react'

interface CollapsibleSectionProps {
  children: ReactNode
  className?: string
  initialOpen?: boolean
  /** Short state shown next to the title, also while the section is closed. */
  status?: ReactNode
  title: string
}

/** A titled section that opens and closes, with an optional status next to the title. */
export default function CollapsibleSection({ children, className, initialOpen = true, status, title }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(initialOpen)
  const bodyId = useId()

  return (
    <section className={`gs-collapsible${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}>
      <button aria-controls={bodyId} aria-expanded={open} className="gs-collapsible__head" onClick={() => setOpen(!open)} type="button">
        <span className="gs-collapsible__title">{title}</span>
        {status}
        <svg aria-hidden className="gs-collapsible__chevron" viewBox="0 0 24 24">
          <path d="M6.5 9.5 12 15l5.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div className="gs-collapsible__body" hidden={!open} id={bodyId}>
        {children}
      </div>
    </section>
  )
}
