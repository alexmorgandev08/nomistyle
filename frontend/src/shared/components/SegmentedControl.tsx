import { useRef } from 'react'
import { type KeyboardEvent } from 'react'

export interface SegmentedOption {
  label: string
  value: string
}

interface SegmentedControlProps {
  /** Accessible name for the group. */
  label: string
  onChange: (value: string | undefined) => void
  options: SegmentedOption[]
  value?: string
  /** Stretch options to fill the row. */
  block?: boolean
  /** Clicking the selected option clears it. */
  deselectable?: boolean
  /** The value is shown but comes from a lower level, so it is drawn as a hint, not a choice. */
  inherited?: boolean
  className?: string
}

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1 }

/** A pill-style segmented control, built as an accessible radio group with arrow-key navigation. */
export default function SegmentedControl({
  block = false,
  className,
  deselectable = false,
  inherited = false,
  label,
  onChange,
  options,
  value
}: SegmentedControlProps) {
  const groupRef = useRef<HTMLDivElement>(null)
  const selectedIndex = options.findIndex(option => option.value === value)
  const focusIndex = selectedIndex === -1 ? 0 : selectedIndex

  const select = (index: number) => {
    onChange(options[index].value)
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[index]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEPS[event.key]
    if (step === undefined) return
    event.preventDefault()
    select((focusIndex + step + options.length) % options.length)
  }

  const classes = ['gs-segmented', block && 'gs-segmented--block', inherited && 'is-inherited', className]

  return (
    <div
      aria-label={label}
      className={classes.filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
      ref={groupRef}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const checked = option.value === value
        return (
          <button
            aria-checked={checked}
            className="gs-segmented__option"
            key={option.value}
            onClick={() => onChange(checked && deselectable ? undefined : option.value)}
            role="radio"
            tabIndex={index === focusIndex ? 0 : -1}
            title={option.label}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
