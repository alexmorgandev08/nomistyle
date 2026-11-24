import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import SettingRow from './SettingRow'

const HELP = 'Nomi Style styles only these content types.'

afterEach(cleanup)

describe('SettingRow', () => {
  it('shows the help text in a tooltip on the info button', async () => {
    render(
      <SettingRow description={HELP} title="Content types">
        <input aria-label="Posts" type="checkbox" />
      </SettingRow>
    )

    const info = screen.getByRole('button', { name: 'About Content types' })
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.focus(info)
    expect((await screen.findByRole('tooltip')).textContent).toBe(HELP)
  })

  it('keeps the help text in the page for screen readers', () => {
    render(
      <SettingRow description={HELP} title="Content types">
        <span />
      </SettingRow>
    )

    const hidden = screen.getByText(HELP)
    expect(hidden.className).toBe('sr-only')
  })

  it('has no info button without help text', () => {
    render(
      <SettingRow title="Content types">
        <span />
      </SettingRow>
    )

    expect(screen.queryByRole('button')).toBeNull()
  })
})
