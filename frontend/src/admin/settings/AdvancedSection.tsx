import { __ } from '@wordpress/i18n'
import { App, Button, Input, Segmented } from 'antd'
import { useState } from 'react'

import { type AdvancedOptions, CONTENT_SELECTOR_MAX_LENGTH, isValidContentSelector } from '../../shared/settings'
import { useCssFile, useRegenerateCss, useResetEverything } from '../queries'
import SettingRow from '../SettingRow'
import { CodeIcon, RefreshIcon, ResetIcon, SelectorIcon, TrashIcon, UsedBlocksIcon } from '../settingsIcons'
import StyleHistorySize from './StyleHistorySize'
import SwitchRow from './SwitchRow'
import { type SectionProps } from './types'

/** Advanced: how Nomi Style outputs CSS, maintenance actions, and what uninstall deletes. */
export default function AdvancedSection({ config, onChange }: SectionProps) {
  const set = (changes: Partial<AdvancedOptions>) => onChange({ ...config, advanced: { ...config.advanced, ...changes } })

  return (
    <>
      <SettingRow
        description={__('A cached file lets browsers keep your global styles between pages. Post and block styles stay inline.', 'nomistyle')}
        icon={CodeIcon}
        title={__('CSS output', 'nomistyle')}
      >
        <Segmented
          block
          onChange={value => set({ cssFile: value === 'file' })}
          options={[
            { label: __('Inline', 'nomistyle'), value: 'inline' },
            { label: __('Cached file', 'nomistyle'), value: 'file' }
          ]}
          value={config.advanced.cssFile ? 'file' : 'inline'}
        />
      </SettingRow>
      <SwitchRow
        checked={config.advanced.onlyUsedBlocks}
        description={__('Load the global style of a block only on pages that use that block. Turn it off if content loads after the page, for example with a page builder.', 'nomistyle')}
        icon={UsedBlocksIcon}
        onChange={onlyUsedBlocks => set({ onlyUsedBlocks })}
        title={__('Load CSS only for blocks used on the page', 'nomistyle')}
      />
      <ContentSelector onChange={contentSelector => set({ contentSelector })} value={config.advanced.contentSelector} />
      <RegenerateCss />
      <ResetEverything />
      <SwitchRow
        checked={config.advanced.deleteOnUninstall}
        description={__('When you delete Nomi Style, also delete its styles and settings. When it is off, they stay, and you get them back if you install Nomi Style again.', 'nomistyle')}
        icon={TrashIcon}
        onChange={deleteOnUninstall => set({ deleteOnUninstall })}
        title={__('Delete data on uninstall', 'nomistyle')}
      />
      <StyleHistorySize config={config} onChange={onChange} />
    </>
  )
}

/** The content selector; a value the server would drop is shown as an error and not saved. */
function ContentSelector({ onChange, value }: { onChange: (selector: string) => void; value: string }) {
  const [text, setText] = useState(value)
  const valid = isValidContentSelector(text)

  const change = (next: string) => {
    setText(next)
    if (isValidContentSelector(next)) onChange(next.replace(/\s+/g, ' ').trim())
  }

  return (
    <SettingRow
      description={__('Optional. Nomi Style adds this selector before every rule, for example .entry-content. Use it to limit styles to your content area, or to win over theme CSS without Force Style.', 'nomistyle')}
      icon={SelectorIcon}
      title={__('Content area selector', 'nomistyle')}
    >
      <Input
        aria-invalid={!valid}
        aria-label={__('Content area selector', 'nomistyle')}
        maxLength={CONTENT_SELECTOR_MAX_LENGTH}
        onChange={event => change(event.target.value)}
        placeholder=".entry-content"
        status={valid ? undefined : 'error'}
        value={text}
      />
      {!valid && (
        <p className="gs-settings__error mt-1.5" role="alert">
          {__('Use a simple selector without commas, quotes, braces or semicolons.', 'nomistyle')}
        </p>
      )}
    </SettingRow>
  )
}

function RegenerateCss() {
  const file = useCssFile()
  const regenerate = useRegenerateCss()
  const inUse = file.data?.inUse ?? false

  return (
    <SettingRow
      description={__('Build the cached CSS file again from your saved styles. Use it after you restore a backup or move the site.', 'nomistyle')}
      icon={RefreshIcon}
      title={__('Regenerate CSS', 'nomistyle')}
    >
      <div className="flex items-center justify-end gap-3">
        <span className="gs-settings__field-label">
          {inUse ? __('Cached file in use', 'nomistyle') : __('Inline CSS in use', 'nomistyle')}
        </span>
        <Button disabled={!inUse} loading={regenerate.isPending} onClick={() => regenerate.mutate()}>
          {__('Regenerate', 'nomistyle')}
        </Button>
      </div>
      {regenerate.isError && <p className="gs-settings__error mt-1.5">{__('Could not write the CSS file. Nomi Style uses inline CSS.', 'nomistyle')}</p>}
    </SettingRow>
  )
}

function ResetEverything() {
  const { modal } = App.useApp()
  const reset = useResetEverything()

  const confirm = () =>
    modal.confirm({
      content: __('This deletes your global styles, post styles, excluded posts and all settings. Block styles saved inside posts stay. You cannot undo this.', 'nomistyle'),
      okButtonProps: { danger: true },
      okText: __('Reset everything', 'nomistyle'),
      onOk: () => reset.mutateAsync(),
      title: __('Reset Nomi Style?', 'nomistyle')
    })

  return (
    <SettingRow
      description={__('Delete your global styles, post styles, excluded posts and settings, and start again with the defaults.', 'nomistyle')}
      icon={ResetIcon}
      title={__('Reset everything', 'nomistyle')}
    >
      <div className="flex justify-end">
        <Button color="danger" onClick={confirm} variant="outlined">
          {__('Reset everything', 'nomistyle')}
        </Button>
      </div>
      {reset.isError && <p className="gs-settings__error mt-1.5">{__('Could not reset Nomi Style. Try again.', 'nomistyle')}</p>}
      {reset.isSuccess && <p className="gs-settings__saved">{__('Nomi Style is reset to the defaults.', 'nomistyle')}</p>}
    </SettingRow>
  )
}
