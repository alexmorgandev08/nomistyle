import { describe, expect, it } from 'vitest'

import { writeStyleElement } from './styleElement'

describe('writeStyleElement', () => {
  it('creates a style element once and updates it', () => {
    writeStyleElement(document, 'gs-test-styles', 'a{color:red}')
    writeStyleElement(document, 'gs-test-styles', 'a{color:blue}')

    const styles = document.querySelectorAll('style#gs-test-styles')
    expect(styles).toHaveLength(1)
    expect(styles[0].textContent).toBe('a{color:blue}')
  })

  it('never writes into a <link> that has the same id', () => {
    const link = document.createElement('link')
    link.id = 'gs-clash'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    writeStyleElement(document, 'gs-clash', 'a{color:red}')

    expect(link.textContent).toBe('')
    expect(document.querySelector('style#gs-clash')?.textContent).toBe('a{color:red}')
  })
})
