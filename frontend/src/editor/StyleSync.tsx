import { store as blockEditorStore } from '@wordpress/block-editor'
import { useSelect } from '@wordpress/data'
import { useEffect, useMemo } from '@wordpress/element'

import { generateCss } from '../shared/css'
import { deviceKeys } from '../shared/deviceKeys'
import { filterDeviceValues } from '../shared/deviceValues'
import { isForced } from '../shared/forceStyle'
import { writeStyleElement } from '../shared/styleElement'
import { blockNameMap, type StyleValues } from '../shared/schema'
import { knownValues } from '../shared/values'
import { editorData, usePostContext } from './context'

// Must not end in "-css": WordPress already uses "blockstyle-editor-css" for the editor stylesheet.
const STYLE_ELEMENT_ID = 'gs-editor-live-styles'

/** Per-block CSS cache, keyed by clientId and invalidated when the values object changes. */
const blockCssCache = new Map<string, { css: string; force: boolean; values: unknown }>()

/** Same output as the front end: only the device values that apply in this build (shared/deviceKeys.ts). */
const generate = (type: string, values: StyleValues, root: string, force = false) =>
  generateCss(
    type,
    filterDeviceValues(values, deviceKeys(type, editorData.config.pro)),
    root,
    force || isForced(type, editorData.config.forceStyle, editorData.config.pro),
    editorData.mediaQueries
  )

/**
 * Generates Block Style CSS for the post being edited (global → post → block)
 * and keeps it in the editor canvas, so blocks look like they will on the site.
 */
export default function StyleSync() {
  const { inScope, postId, postStyles } = usePostContext()

  const globalCss = useMemo(
    () =>
      Object.entries(editorData.config.styles)
        .map(([type, values]) => generate(type, values, `.gs.gs-${type}`))
        .join('\n'),
    []
  )

  const postCss = useMemo(
    () =>
      Object.entries(postStyles)
        .map(([type, values]) => generate(type, values, `.gs.gs-${type}.gs-p-${postId}`))
        .join('\n'),
    [postStyles, postId]
  )

  const blockCss = useSelect(select => {
    const editor = select(blockEditorStore)

    return editor
      .getClientIdsWithDescendants()
      .map((clientId: string) => {
        const type = blockNameMap[editor.getBlockName(clientId) ?? '']
        if (!type) return ''

        const attributes = editor.getBlockAttributes(clientId) as { gutenStyle?: { force?: boolean; values?: unknown } } | null
        const rawValues = attributes?.gutenStyle?.values
        if (!rawValues) return ''

        // A forced block (Pro's Style Inspector) gets !important CSS for its own values.
        const force = attributes?.gutenStyle?.force === true
        const cached = blockCssCache.get(clientId)
        if (cached && cached.values === rawValues && cached.force === force) return cached.css

        const css = generate(type, knownValues(type, rawValues), `.gs.gs-${type}.gs-b-${clientId}`, force)
        blockCssCache.set(clientId, { css, force, values: rawValues })
        return css
      })
      .filter(Boolean)
      .join('\n')
  }, [])

  const css = inScope ? [globalCss, postCss, blockCss].filter(Boolean).join('\n') : ''

  useEffect(() => {
    applyCss(css)
    // The canvas iframe is recreated when switching preview devices or editor modes.
    const timer = window.setInterval(() => applyCss(css), 1000)
    return () => window.clearInterval(timer)
  }, [css])

  return null
}

function applyCss(css: string) {
  writeStyleElement(document, STYLE_ELEMENT_ID, css)
  document.querySelectorAll<HTMLIFrameElement>('iframe[name="editor-canvas"]').forEach(frame => {
    if (frame.contentDocument?.head) writeStyleElement(frame.contentDocument, STYLE_ELEMENT_ID, css)
  })
}
