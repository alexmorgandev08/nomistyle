import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useConfigStore } from './configStore'
import {
  adminData,
  fetchCssFile,
  fetchExclusions,
  fetchOverrides,
  regenerateCss,
  removeOverrides,
  resetEverything,
  saveConfig,
  searchPosts,
  setExclusion
} from './data'

const MIN_SEARCH_LENGTH = 2

export const queryKeys = {
  cssFile: ['css-file'] as const,
  exclusions: ['exclusions'] as const,
  overrides: ['overrides'] as const,
  overridesPage: (page: number, perPage: number) => ['overrides', page, perPage] as const,
  postSearch: (term: string) => ['post-search', term] as const
}

/** Saves the draft config; on success the server's copy becomes the new saved state. */
export function useSaveConfig() {
  const queryClient = useQueryClient()
  const markSaved = useConfigStore(state => state.markSaved)
  return useMutation({
    mutationFn: saveConfig,
    onSuccess: saved => {
      markSaved(saved)
      // Saving writes or removes the cached CSS file.
      void queryClient.invalidateQueries({ queryKey: queryKeys.cssFile })
    }
  })
}

export const useCssFile = () => useQuery({ queryFn: fetchCssFile, queryKey: queryKeys.cssFile })

/** Builds the cached CSS file again from the saved settings. */
export function useRegenerateCss() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: regenerateCss, onSuccess: status => queryClient.setQueryData(queryKeys.cssFile, status) })
}

/** Reset everything: the server's defaults become the saved and draft config. */
export function useResetEverything() {
  const queryClient = useQueryClient()
  const markSaved = useConfigStore(state => state.markSaved)
  return useMutation({
    mutationFn: resetEverything,
    onSuccess: defaults => {
      markSaved(defaults)
      void queryClient.invalidateQueries({ queryKey: queryKeys.exclusions })
      void queryClient.invalidateQueries({ queryKey: queryKeys.cssFile })
      void queryClient.invalidateQueries({ queryKey: queryKeys.overrides })
    }
  })
}

export const useExclusions = () => useQuery({ queryFn: fetchExclusions, queryKey: queryKeys.exclusions })

/** Excludes a post from (or returns it to) Block Style. The server answers with the new list. */
export function useSetExclusion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ excluded, id }: { excluded: boolean; id: number }) => setExclusion(id, excluded),
    onSuccess: list => queryClient.setQueryData(queryKeys.exclusions, list)
  })
}

/** Posts of the enabled post types whose title matches `term`. Short terms return nothing. */
export function usePostSearch(term: string) {
  const search = term.trim()
  const enabled = search.length >= MIN_SEARCH_LENGTH
  return useQuery({
    enabled,
    // Keep the last results while the next search loads, but not once the term is cleared.
    placeholderData: enabled ? keepPreviousData : undefined,
    queryFn: () => searchPosts(search, adminData.postTypes.map(postType => postType.name)),
    queryKey: queryKeys.postSearch(search)
  })
}

/** One page of posts with a post style or block styles. Keeps the last page on screen while the next one loads. */
export const useOverrides = (page: number, perPage: number) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchOverrides(page, perPage),
    queryKey: queryKeys.overridesPage(page, perPage)
  })

/** Removes a post's overrides, then loads the list again. */
export function useRemoveOverrides() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeOverrides,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.overrides })
  })
}
