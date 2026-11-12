import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getBlock } from '../schema'
import PresetPicker from './PresetPicker'

const tablePresets = getBlock('table')!.presets
const presetButtons = () => screen.getAllByRole('button', { pressed: false }).concat(screen.queryAllByRole('button', { pressed: true }))

afterEach(cleanup)

describe('PresetPicker', () => {
  it('shows every preset when there is no limit', () => {
    render(<PresetPicker hasValues={false} onApply={() => undefined} type="table" />)
    expect(presetButtons()).toHaveLength(tablePresets.length)
    expect(screen.queryByRole('button', { name: /View all/ })).toBeNull()
  })

  it('shows the first presets inline and a View all button for the rest', () => {
    const onShowAll = vi.fn()
    render(<PresetPicker hasValues={false} limit={3} onApply={() => undefined} onShowAll={onShowAll} type="table" />)

    expect(presetButtons()).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: `View all ${tablePresets.length} presets` }))
    expect(onShowAll).toHaveBeenCalled()
  })

  it('keeps the preset in use visible when the limit would hide it', () => {
    const last = tablePresets[tablePresets.length - 1]
    render(<PresetPicker hasValues limit={3} onApply={() => undefined} onShowAll={() => undefined} type="table" values={last.values} />)

    expect(screen.getByRole('button', { name: last.label, pressed: true })).toBeTruthy()
    expect(presetButtons()).toHaveLength(3)
  })

  it('has no View all button when every preset fits', () => {
    render(
      <PresetPicker hasValues={false} limit={tablePresets.length} onApply={() => undefined} onShowAll={() => undefined} type="table" />
    )
    expect(screen.queryByRole('button', { name: /View all/ })).toBeNull()
  })
})
