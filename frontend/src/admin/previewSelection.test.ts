import { beforeEach, describe, expect, it } from 'vitest'

import { markSelection } from './previewSelection'

describe('markSelection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-gs-sample="heading"><h2 class="gs gs-heading">A</h2><p>text</p><h3 class="gs gs-heading">B</h3></section>
      <section data-gs-sample="button"><div class="gs gs-button">Go</div></section>`
  })

  const selected = () => [...document.querySelectorAll('[data-gs-selected]')].map(element => element.textContent)

  it('outlines every block of the selected type and adds one badge', () => {
    markSelection(document, 'heading', 'Heading · Global')
    expect(selected()).toEqual(['A', 'B'])
    expect([...document.querySelectorAll('.gs-preview-badge')].map(element => element.textContent)).toEqual(['Heading · Global'])
  })

  it('moves the selection and keeps it when called again without a type', () => {
    markSelection(document, 'heading', 'Heading · Global')
    markSelection(document, 'button', 'Button · Global')
    markSelection(document)
    expect(selected()).toEqual(['Go'])
    expect(document.querySelectorAll('.gs-preview-badge')).toHaveLength(1)
  })
})
