import { useId } from 'react'

import { generateCss } from '../css'
import { getBlock, type StyleValues } from '../schema'

const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset=".6" stop-color="#c4b5fd"/><stop offset="1" stop-color="#fbcfe8"/></linearGradient></defs><rect width="160" height="100" fill="url(#g)"/><circle cx="120" cy="26" r="12" fill="#fff" fill-opacity=".8"/><path d="M0 80 L40 50 L70 68 L100 40 L160 74 L160 100 L0 100 Z" fill="#1e293b" fill-opacity=".35"/></svg>'
  )

interface MiniPreviewProps {
  type: string
  values: StyleValues
}

/**
 * A thumbnail of a block styled with the given values, using the real CSS
 * generator so the thumbnail matches what the site will show.
 */
export default function MiniPreview({ type, values }: MiniPreviewProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const root = `.gs-thumb-${id}`
  const css = generateCss(type, values, `${root} .gs`)

  return (
    <div aria-hidden className={`gs-thumb gs-thumb--${type} gs-thumb-${id}`}>
      <style>{css}</style>
      <Sample type={type} />
    </div>
  )
}

function Sample({ type }: { type: string }) {
  switch (type) {
    case 'table':
      return (
        <figure className="gs wp-block-table">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic</td>
                <td>$5</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>$15</td>
              </tr>
              <tr>
                <td>Team</td>
                <td>$40</td>
              </tr>
            </tbody>
          </table>
        </figure>
      )
    case 'list':
      return (
        <ul className="gs wp-block-list">
          <li>First point</li>
          <li>Second point</li>
          <li>Third point</li>
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="gs wp-block-quote">
          <p>A short quote.</p>
          <cite>Author</cite>
        </blockquote>
      )
    case 'details':
      return (
        <div>
          <details className="gs wp-block-details" open>
            <summary>Question one</summary>
            <p>Answer</p>
          </details>
          <details className="gs wp-block-details">
            <summary>Question two</summary>
          </details>
        </div>
      )
    case 'heading':
      return (
        <div>
          <h2 className="gs wp-block-heading">Section title</h2>
          <h3 className="gs wp-block-heading">Sub heading</h3>
          <p>Body text under it.</p>
        </div>
      )
    case 'button':
      return (
        <div className="gs wp-block-button">
          <span className="wp-block-button__link wp-element-button">Get started</span>
        </div>
      )
    case 'image':
      return (
        <figure className="gs wp-block-image">
          <img alt="" src={SAMPLE_IMAGE} />
          <figcaption>Photo caption</figcaption>
        </figure>
      )
    default: {
      // Add-on blocks bring their thumbnail markup in the schema (trusted: the plugin's own files).
      const thumb = getBlock(type)?.thumb
      return thumb ? <div dangerouslySetInnerHTML={{ __html: thumb }} /> : null
    }
  }
}
