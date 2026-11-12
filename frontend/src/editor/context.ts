import { store as coreStore } from '@wordpress/core-data'
import { useDispatch, useSelect } from '@wordpress/data'
import { store as editorStore } from '@wordpress/editor'
import { useMemo } from '@wordpress/element'

import { type MediaQueries } from '../shared/css'
import { type Device, type StyleMap } from '../shared/schema'
import { type EditorOptions } from '../shared/settings'
import { parseStyleMap } from '../shared/values'
import { type PaletteColor } from '../shared/components/ControlField'

export interface EditorData {
  /** The user's role may edit styles (Settings › Block editor › Roles that can edit styles). */
  canEditStyles: boolean
  canManage: boolean
  /** The post matches add-on conditions such as categories (checked when the editor opened). */
  matchesConditions: boolean
  config: {
    editor: EditorOptions
    forceStyle: boolean
    postTypes: string[]
    pro?: Record<string, unknown>
    styles: StyleMap
    themeColors: boolean
  }
  mediaQueries: MediaQueries
  /** Colors from add-ons (GutenStyle Pro's design system), shown first in color pickers. */
  brandColors: PaletteColor[]
  palette: PaletteColor[]
  settingsUrl: string
}

export const editorData: EditorData = window.gutenStyleEditor

const META_STYLES = '_guten_style'
const META_DISABLED = '_guten_style_disabled'

type PostMeta = Record<string, unknown> | undefined

/**
 * Everything the editor panels need to know about the post being edited:
 * whether GutenStyle applies to it and its post-level overrides.
 */
export function usePostContext() {
  const { meta, postId, postType, postTypeLabel } = useSelect(select => {
    const editor = select(editorStore)
    const type = editor.getCurrentPostType()
    return {
      meta: editor.getEditedPostAttribute('meta') as PostMeta,
      postId: editor.getCurrentPostId() as number | string | null,
      postType: type,
      postTypeLabel: select(coreStore).getPostType(type)?.labels?.singular_name ?? type
    }
  }, [])
  const { editPost } = useDispatch(editorStore)

  const rawStyles = meta?.[META_STYLES]
  const postStyles = useMemo(() => parseStyleMap(rawStyles), [rawStyles])
  const disabled = Boolean(meta?.[META_DISABLED])
  const typeEnabled = editorData.config.postTypes.includes(postType)

  return {
    disabled,
    inScope: typeEnabled && !disabled && editorData.matchesConditions && postId !== null,
    matchesConditions: editorData.matchesConditions,
    metaAvailable: meta !== undefined && META_STYLES in meta,
    postId,
    postStyles,
    postType,
    postTypeLabel,
    setDisabled: (value: boolean) => editPost({ meta: { [META_DISABLED]: value } }),
    setPostStyles: (map: StyleMap) =>
      editPost({ meta: { [META_STYLES]: Object.keys(map).length > 0 ? JSON.stringify(map) : '' } }),
    typeEnabled
  }
}

/** The device chosen in Gutenberg's preview, lower-cased to match GutenStyle's device names. */
export function useEditorDevice(): Device {
  const deviceType = useSelect(select => select(editorStore).getDeviceType() as string, [])
  return (deviceType?.toLowerCase() ?? 'desktop') as Device
}
