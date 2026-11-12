import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { allDeviceKeys } from '../deviceValues'
import StylePanel from './StylePanel'

afterEach(cleanup)

const renderPanel = (type: string, deviceKeys: string[]) =>
  render(
    <StylePanel
      device="tablet"
      deviceKeys={deviceKeys}
      inherited={{}}
      inheritedFrom={() => undefined}
      onChange={() => undefined}
      palette={[]}
      type={type}
      values={{}}
    />
  )

describe('StylePanel on tablet', () => {
  it('says so when no control of the block has device values in this plan', () => {
    renderPanel('list', [])
    expect(screen.getByText('This block has no settings for this screen size.')).toBeTruthy()
  })

  it('shows only the controls whose device values apply', () => {
    renderPanel('heading', ['h2FontSize'])
    expect(screen.queryByText('This block has no settings for this screen size.')).toBeNull()
    // H2 font size can appear twice: in Quick styles and in the H2 section.
    expect(screen.getAllByText('Font size').length).toBeGreaterThan(0)
    expect(screen.queryByText('Space above')).toBeNull()
  })

  it('shows every responsive control when all are allowed', () => {
    renderPanel('heading', allDeviceKeys('heading'))
    expect(screen.getAllByText('Font size').length).toBeGreaterThanOrEqual(3)
  })
})
