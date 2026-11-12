import apiFetch from '@wordpress/api-fetch'

import { type PaletteColor } from '../shared/components/ControlField'
import { type MediaQueries } from '../shared/css'
import { type StyleMap } from '../shared/schema'
import { type AdvancedOptions, type Breakpoints, type EditorOptions } from '../shared/settings'

export interface Config {
  advanced: AdvancedOptions
  /** Custom breakpoints, or null for the theme's. */
  breakpoints: Breakpoints | null
  editor: EditorOptions
  forceStyle: boolean
  postTypes: string[]
  /** Settings of add-ons such as GutenStyle Pro, cleaned by the add-on; free code passes them on. */
  pro?: Record<string, unknown>
  styles: StyleMap
  /** Show the theme's colors in color pickers. */
  themeColors: boolean
}

export interface ExcludedPost {
  editUrl: string
  id: number
  title: string
  type: string
  viewUrl: string
}

export interface AdminData {
  config: Config
  mediaQueries: MediaQueries
  /** Colors from add-ons (GutenStyle Pro's design system), shown first in color pickers. */
  brandColors: PaletteColor[]
  palette: PaletteColor[]
  postTypes: { label: string; name: string }[]
  previewUrl: string
  roles: { label: string; name: string }[]
  /** Whether the active theme has a theme.json file. */
  themeJson: boolean
  /** The theme's breakpoints, used when Settings has no custom ones. */
  themeMediaQueries: MediaQueries
  restNamespace: string
  /** Where "Upgrade" links go (Config::UPGRADE_URL in PHP). */
  upgradeUrl: string
  version: string
}

export const adminData: AdminData = window.gutenStyleAdmin

const path = (route: string) => `/${adminData.restNamespace}${route}`

export const saveConfig = (config: Config) =>
  apiFetch<Config>({ data: config, method: 'POST', path: path('/config') })

/** Whether the cached CSS file is in use (Settings › Advanced). */
export const fetchCssFile = () => apiFetch<{ inUse: boolean }>({ path: path('/css') })

export const regenerateCss = () => apiFetch<{ inUse: boolean }>({ method: 'POST', path: path('/css') })

/** Deletes global styles, settings, post styles and exclusions; returns the default config. */
export const resetEverything = () => apiFetch<Config>({ method: 'POST', path: path('/reset') })

export const fetchExclusions = () => apiFetch<ExcludedPost[]>({ path: path('/exclusions') })

export const setExclusion = (id: number, excluded: boolean) =>
  apiFetch<ExcludedPost[]>({ data: { excluded, id }, method: 'POST', path: path('/exclusions') })

/** A post with a post style or block styles (Tools › Overrides). */
export interface OverridePost {
  /** Number of blocks with their own style. */
  blockStyles: number
  editUrl: string
  id: number
  /** ISO 8601 date of the last edit. */
  modified: string
  /** Number of block types in the post style. */
  postStyles: number
  status: string
  title: string
  type: string
  viewUrl: string
}

export interface OverridesPage {
  items: OverridePost[]
  total: number
}

export const fetchOverrides = (page: number, perPage: number) =>
  apiFetch<OverridesPage>({ path: path(`/overrides?${new URLSearchParams({ page: String(page), perPage: String(perPage) }).toString()}`) })

/** Removes a post's post style and block styles. The server saves a revision first (null when the post type has none). */
export const removeOverrides = (id: number) =>
  apiFetch<{ revisionId: number | null }>({ method: 'DELETE', path: path(`/overrides/${id}`) })

export interface SearchResult {
  id: number
  subtype: string
  title: string
}

export const searchPosts = (search: string, subtypes: string[]) =>
  apiFetch<SearchResult[]>({
    path: `/wp/v2/search?${new URLSearchParams({
      per_page: '10',
      search,
      subtype: subtypes.join(','),
      type: 'post'
    }).toString()}`
  })
