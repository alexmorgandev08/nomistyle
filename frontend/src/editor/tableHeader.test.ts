import { describe, expect, it } from 'vitest'

import { firstRowAsHeader, hasHeaderStyles } from './tableHeader'

describe('hasHeaderStyles', () => {
  it('finds header settings on any screen size', () => {
    expect(hasHeaderStyles({ headerBackground: '#dc2626' })).toBe(true)
    expect(hasHeaderStyles({ 'headerFontSize@mobile': '14px' })).toBe(true)
  })

  it('ignores other settings', () => {
    expect(hasHeaderStyles({ radius: '8px', stripeColor: '#f1f5f9' })).toBe(false)
    expect(hasHeaderStyles({})).toBe(false)
  })
})

describe('firstRowAsHeader', () => {
  it('moves the first body row into the header as th cells and keeps the rest', () => {
    const body = [
      { cells: [{ content: 'name', tag: 'td' }, { content: 'age', tag: 'td', align: 'right' }] },
      { cells: [{ content: 'kabir', tag: 'td' }, { content: '21', tag: 'td' }] }
    ]

    expect(firstRowAsHeader(body)).toEqual({
      body: [{ cells: [{ content: 'kabir', tag: 'td' }, { content: '21', tag: 'td' }] }],
      head: [{ cells: [{ content: 'name', tag: 'th' }, { align: 'right', content: 'age', tag: 'th' }] }]
    })
  })

  it('does not change the rows it was given', () => {
    const body = [{ cells: [{ content: 'name', tag: 'td' }] }, { cells: [{ content: 'a', tag: 'td' }] }]
    firstRowAsHeader(body)
    expect(body[0].cells[0].tag).toBe('td')
  })
})
