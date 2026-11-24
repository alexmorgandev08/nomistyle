import { describe, expect, it } from 'vitest'

import { allDeviceKeys, filterDeviceValues, freeDeviceKeys } from './deviceValues'

describe('device values', () => {
  it('allows heading font sizes and the table layout on small screens in Nomi Style (free)', () => {
    expect(freeDeviceKeys('heading')).toEqual(['h2FontSize', 'h3FontSize', 'h4FontSize'])
    expect(freeDeviceKeys('table')).toEqual(['mobileLayout'])
    expect(freeDeviceKeys('list')).toEqual([])
  })

  it('lists every responsive control for add-ons', () => {
    expect(allDeviceKeys('list')).toEqual(['itemSpacing', 'indent', 'fontSize', 'paddingBlock', 'paddingEnd'])
  })

  it('drops device values of controls that are not allowed, like PHP', () => {
    const values = {
      'color@hover': '#000',
      h2FontSize: '32px',
      'h2FontSize@tablet': '28px',
      marginTop: '2em',
      'marginTop@mobile': '1em'
    }

    expect(filterDeviceValues(values, ['h2FontSize'])).toEqual({
      'color@hover': '#000',
      h2FontSize: '32px',
      'h2FontSize@tablet': '28px',
      marginTop: '2em'
    })
  })
})
