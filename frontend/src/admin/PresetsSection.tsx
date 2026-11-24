import { __, sprintf } from '@wordpress/i18n'
import { Button, Modal, Popconfirm } from 'antd'
import { useState } from 'react'

import MiniPreview from '../shared/components/MiniPreview'
import PresetPicker from '../shared/components/PresetPicker'
import { useSavedPresets } from '../shared/savedPresets'
import { getBlock, type Preset, type StyleValues } from '../shared/schema'
import { themeClass, useUiTheme } from '../shared/theme'
import { matchesPreset } from '../shared/values'
import DescribeStyle from './ai/DescribeStyle'
import SavePreset from './presets/SavePreset'

interface ApplyActionProps {
  /** The preset is already the current style; nothing to apply. */
  current: boolean
  /** Applying would replace existing settings, so ask first. */
  needsConfirm: boolean
  onApply: () => void
  presetLabel: string
}

function ApplyAction({ current, needsConfirm, onApply, presetLabel }: ApplyActionProps) {
  if (current) {
    return (
      <Button disabled size="small" type="text">
        {__('In use', 'nomistyle')}
      </Button>
    )
  }

  if (needsConfirm) {
    return (
      <Popconfirm
        cancelText={__('Keep my settings', 'nomistyle')}
        description={__('It replaces your current settings here.', 'nomistyle')}
        okText={__('Apply preset', 'nomistyle')}
        onConfirm={onApply}
        title={sprintf(
          /* translators: %s: preset name */
          __('Apply "%s"?', 'nomistyle'),
          presetLabel
        )}
      >
        <Button size="small">{__('Apply', 'nomistyle')}</Button>
      </Popconfirm>
    )
  }

  return (
    <Button onClick={onApply} size="small">
      {__('Apply', 'nomistyle')}
    </Button>
  )
}

interface PresetsSectionProps {
  /** Values the current level already has; applying a preset replaces them. */
  hasValues: boolean
  /** Block label for the dialog title. */
  label: string
  onApply: (values: StyleValues) => void
  type: string
  values: StyleValues
}

/** Presets shown inline in the inspector (two rows of three). More open in a dialog with large previews. */
const INLINE_PRESETS = 6

/**
 * The inspector's presets: the first ones inline, and a "View all" dialog when a block has more.
 * Admin only; the editor sidebar shows every preset inline.
 */
export default function PresetsSection({ hasValues, label, onApply, type, values }: PresetsSectionProps) {
  const [theme] = useUiTheme()
  const [open, setOpen] = useState(false)
  const saved = useSavedPresets(type)
  const savedIds = new Set(saved.presets.map(preset => preset.id))
  const presets = [...(getBlock(type)?.presets ?? []), ...saved.presets]

  if (presets.length === 0) return null

  const apply = (preset: Preset) => {
    onApply({ ...preset.values })
    setOpen(false)
  }

  return (
    <>
      <PresetPicker
        extraPresets={saved.presets}
        hasValues={hasValues}
        limit={INLINE_PRESETS}
        onApply={onApply}
        onShowAll={() => setOpen(true)}
        type={type}
        values={values}
      />
      <div className="-mt-2 mb-3 flex items-center justify-end gap-2 px-4">
        <DescribeStyle label={label} onApply={onApply} type={type} />
        <SavePreset onSave={saved.save} values={values} />
      </div>

      <Modal
        destroyOnHidden
        footer={null}
        onCancel={() => setOpen(false)}
        open={open}
        title={sprintf(
          /* translators: %s: block name */
          __('%s presets', 'nomistyle'),
          label
        )}
        width={800}
      >
        <div className={themeClass(theme)}>
          <p className="gs-presets__help">
            {__('A preset replaces the settings at this level. Adjust anything below afterwards.', 'nomistyle')}
          </p>
          <div className="gs-preset-modal__grid">
            {presets.map(preset => {
              const current = matchesPreset(preset, values)
              return (
                <div className={`gs-preset-card${current ? ' is-current' : ''}`} key={preset.id}>
                  <div className="gs-preset-card__thumb">
                    <MiniPreview type={type} values={preset.values} />
                  </div>
                  <div className="gs-preset-card__foot">
                    <span className="gs-preset-card__name">{preset.label}</span>
                    {savedIds.has(preset.id) && (
                      <Popconfirm
                        description={__('Nobody can apply it after this. Styles that use it do not change.', 'nomistyle')}
                        okButtonProps={{ danger: true }}
                        okText={__('Delete', 'nomistyle')}
                        onConfirm={() => saved.remove(preset.id)}
                        title={__('Delete this preset?', 'nomistyle')}
                      >
                        <Button color="danger" size="small" variant="text">
                          {__('Delete', 'nomistyle')}
                        </Button>
                      </Popconfirm>
                    )}
                    <ApplyAction
                      current={current}
                      needsConfirm={hasValues}
                      onApply={() => apply(preset)}
                      presetLabel={preset.label}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </>
  )
}
