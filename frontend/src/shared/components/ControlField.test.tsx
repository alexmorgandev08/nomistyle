import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getControls } from '../schema'
import ControlField from './ControlField'

const radius = getControls('table').find(control => control.key === 'radius')!

afterEach(cleanup)

describe('ControlField', () => {
  it('shows no reset icon when the value is not set here', () => {
    render(<ControlField control={radius} onChange={() => undefined} palette={[]} />)
    expect(screen.queryByRole('button', { name: `Reset ${radius.label}` })).toBeNull()
  })

  it('shows a reset icon for a value set here, and clears it', () => {
    const onChange = vi.fn()
    render(<ControlField control={radius} onChange={onChange} palette={[]} value="10px" />)

    fireEvent.click(screen.getByRole('button', { name: `Reset ${radius.label}` }))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('names the source of an inherited value in the label tooltip', () => {
    render(
      <ControlField control={radius} inheritedFrom="Global" inheritedValue="8px" onChange={() => undefined} palette={[]} />
    )
    expect(screen.getByText(radius.label).getAttribute('title')).toBe('Inherited from Global')
  })
})
