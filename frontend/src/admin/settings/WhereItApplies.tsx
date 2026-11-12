import { __, sprintf } from '@wordpress/i18n'
import { Alert, Button, Checkbox, Input, Spin } from 'antd'
import { useState } from 'react'

import { adminData } from '../data'
import { useExclusions, usePostSearch, useSetExclusion } from '../queries'
import SettingRow from '../SettingRow'
import { DocumentsIcon, ListIcon, SearchIcon } from '../settingsIcons'
import { useDebouncedValue } from '../useDebouncedValue'
import AdvancedConditions from './AdvancedConditions'
import { type SectionProps } from './types'

/** Where styles apply: post types, single posts excluded, and (Pro) advanced conditions. */
export default function WhereItApplies({ config, onChange }: SectionProps) {
  return (
    <>
      <PostTypes onChange={postTypes => onChange({ ...config, postTypes })} postTypes={config.postTypes} />
      <Exclusions />
      <AdvancedConditions config={config} onChange={onChange} />
    </>
  )
}

function PostTypes({ onChange, postTypes }: { onChange: (postTypes: string[]) => void; postTypes: string[] }) {
  const toggle = (name: string, enabled: boolean) =>
    onChange(enabled ? [...postTypes, name] : postTypes.filter(type => type !== name))

  return (
    <SettingRow
      description={__('Global styles only affect content of the types you select. Everything else keeps your theme\'s design.', 'guten-style')}
      icon={DocumentsIcon}
      title={__('Content types', 'guten-style')}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-2.5">
        {adminData.postTypes.map(postType => (
          <Checkbox
            checked={postTypes.includes(postType.name)}
            key={postType.name}
            onChange={event => toggle(postType.name, event.target.checked)}
          >
            {postType.label}
          </Checkbox>
        ))}
      </div>
    </SettingRow>
  )
}

function Exclusions() {
  const [search, setSearch] = useState('')
  const term = useDebouncedValue(search, 300)
  const exclusions = useExclusions()
  const results = usePostSearch(term)
  const setExclusion = useSetExclusion()

  const busyId = setExclusion.isPending ? setExclusion.variables.id : null
  const excludedIds = new Set(exclusions.data?.map(post => post.id))
  const shownResults = search.trim() ? (results.data ?? []) : []
  let error = ''
  if (exclusions.isError) error = __('Could not load excluded posts.', 'guten-style')
  else if (setExclusion.isError) error = __('Could not update the post. You may not have permission to edit it.', 'guten-style')

  const update = (id: number, excluded: boolean) =>
    setExclusion.mutate(
      { excluded, id },
      {
        onSuccess: () => {
          if (excluded) setSearch('')
        }
      }
    )

  return (
    <>
      {error && <Alert className="mt-4" showIcon title={error} type="error" />}

      <SettingRow
        description={__('Excluded posts keep the theme\'s default design. Changes here are saved immediately.', 'guten-style')}
        icon={SearchIcon}
        title={__('Exclude a post or page', 'guten-style')}
      >
        <Input.Search
          allowClear
          aria-label={__('Find a post or page to exclude', 'guten-style')}
          loading={results.isFetching}
          onChange={event => setSearch(event.target.value)}
          placeholder={__('Search by title…', 'guten-style')}
          value={search}
        />
        {shownResults.length > 0 && (
          <ul className="gs-settings__list gs-settings__list--results">
            {shownResults.map(result => (
              <li key={result.id}>
                <span>
                  {result.title || __('(no title)', 'guten-style')} <small>{result.subtype}</small>
                </span>
                <Button
                  disabled={excludedIds.has(result.id)}
                  loading={busyId === result.id}
                  onClick={() => update(result.id, true)}
                  size="small"
                >
                  {excludedIds.has(result.id) ? __('Excluded', 'guten-style') : __('Exclude', 'guten-style')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingRow>

      <SettingRow
        description={__('You can also turn GutenStyle off from a post\'s sidebar in the editor.', 'guten-style')}
        icon={ListIcon}
        stacked
        title={__('Excluded content', 'guten-style')}
      >
        {exclusions.isPending ? (
          <Spin />
        ) : !exclusions.data?.length ? (
          <p className="gs-settings__empty">{__('No excluded content.', 'guten-style')}</p>
        ) : (
          <ul className="gs-settings__list">
            {exclusions.data.map(post => (
              <li key={post.id}>
                <span>
                  <a href={post.editUrl}>{post.title}</a> <small>{post.type}</small>
                </span>
                <Button
                  aria-label={sprintf(
                    /* translators: %s: post title */
                    __('Apply GutenStyle to "%s" again', 'guten-style'),
                    post.title
                  )}
                  loading={busyId === post.id}
                  onClick={() => update(post.id, false)}
                  size="small"
                  type="text"
                >
                  {__('Include again', 'guten-style')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingRow>
    </>
  )
}
