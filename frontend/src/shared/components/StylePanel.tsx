import { __, sprintf } from '@wordpress/i18n'

import { type Control, type Device, getBlock, type Section, type StyleValues, supportsVariant } from '../schema'
import {
  isControlVisible,
  type Level,
  LEVEL_LABELS,
  mergeLevels,
  type StyleState,
  valueKey,
  withoutControls,
  withValue
} from '../values'
import CollapsibleSection from './CollapsibleSection'
import ControlField, { type PaletteColor } from './ControlField'

interface StylePanelProps {
  device: Device
  /** Controls whose tablet and mobile values apply (shared/deviceKeys.ts). Others are hidden on tablet and mobile. */
  deviceKeys: string[]
  /** Effective values from the levels below the one being edited. */
  inherited: StyleValues
  /** Which lower level a key's inherited value comes from. */
  inheritedFrom: (key: string) => Level | undefined
  onChange: (values: StyleValues) => void
  palette: PaletteColor[]
  /** Edit the normal look or the look when a visitor points at the block. */
  state?: StyleState
  type: string
  values: StyleValues
}

const QUICK_ID = 'quick'

export default function StylePanel({
  device,
  deviceKeys,
  inherited,
  inheritedFrom,
  onChange,
  palette,
  state = 'default',
  type,
  values
}: StylePanelProps) {
  const block = getBlock(type)

  if (!block) return null

  const effective = mergeLevels(inherited, values)
  const isHoverView = state === 'hover'
  const isResponsiveView = !isHoverView && device !== 'desktop'
  const valueVariant = isHoverView ? 'hover' : device
  const baseLabel = isHoverView ? __('Default state', 'blockstyle') : __('Desktop', 'blockstyle')

  /**
   * What applies when this level has no value for `key`. In the hover and tablet/mobile views,
   * this level's own normal value outranks lower levels (it is printed later with an equally or
   * more specific selector), so it is checked first.
   */
  const resolveInherited = (baseKey: string, key: string): undefined | { from: string; value: string } => {
    const isVariant = key !== baseKey
    if (isVariant && values[baseKey]) return { from: baseLabel, value: values[baseKey] }

    for (const candidate of isVariant ? [key, baseKey] : [key]) {
      const from = inheritedFrom(candidate)
      if (inherited[candidate] && from) return { from: LEVEL_LABELS[from], value: inherited[candidate] }
    }
    return undefined
  }

  const visible = (controls: Control[]) =>
    controls.filter(control => {
      if (!isControlVisible(control, effective)) return false
      if (valueVariant === 'desktop') return !control.mediaOnly
      if (isResponsiveView && !deviceKeys.includes(control.key)) return false
      return supportsVariant(control, valueVariant)
    })

  /** How many of these controls this level has customized (any screen size). */
  const customizedCount = (controls: Control[]) =>
    controls.filter(control => Object.keys(values).some(key => key.split('@')[0] === control.key)).length

  // Quick controls come from several sections; they stay in section order and get a sub-heading per section.
  const quickSection = new Map<string, string>()
  const quickControls: Control[] = block.sections.flatMap(section =>
    section.controls
      .filter(control => control.quick)
      .sort((a, b) => (a.quick ?? 0) - (b.quick ?? 0))
      .map(control => {
        quickSection.set(control.key, section.label)
        return control
      })
  )

  const groups: Section[] = [
    { controls: quickControls, id: QUICK_ID, label: __('Quick styles', 'blockstyle') },
    ...block.sections
  ].filter(section => visible(section.controls).length > 0)

  const renderControls = (controls: Control[], withSubheadings = false) => {
    let lastHeading: string | undefined
    return visible(controls).flatMap(control => {
      const key = valueKey(control.key, device, state)
      const fallback = resolveInherited(control.key, key)
      const heading = withSubheadings ? quickSection.get(control.key) : undefined
      const field = (
        <ControlField
          control={control}
          inheritedFrom={fallback?.from}
          inheritedValue={fallback?.value}
          key={key}
          onChange={value => onChange(withValue(values, key, value))}
          palette={palette}
          value={values[key]}
        />
      )
      if (!heading || heading === lastHeading) return [field]
      lastHeading = heading
      return [
        <p className="gs-subhead" key={`heading-${heading}`}>
          {heading}
        </p>,
        field
      ]
    })
  }

  const renderReset = (section: Section) =>
    customizedCount(section.controls) > 0 && (
      <button
        className="gs-text-btn gs-style-panel__reset-section"
        onClick={() => onChange(withoutControls(values, section.controls))}
        type="button"
      >
        {sprintf(
          /* translators: %s: section name, e.g. "Header" */
          __('Reset %s', 'blockstyle'),
          section.label.toLowerCase()
        )}
      </button>
    )

  const viewNote = isHoverView ? (
    <p className="gs-style-panel__device-note">
      {__('Editing the hover state. These values apply when a visitor points at the block, on every screen size. Only colors and shadows are shown.', 'blockstyle')}
    </p>
  ) : (
    isResponsiveView && (
      <p className="gs-style-panel__device-note">
        {sprintf(
          /* translators: %s: device name */
          __('Editing %s values. Only settings that can change per screen size are shown. Everything else carries over from desktop.', 'blockstyle'),
          device === 'tablet' ? __('tablet', 'blockstyle') : __('mobile', 'blockstyle')
        )}
      </p>
    )
  )

  return (
    <div className="gs-style-panel">
      {viewNote && <div className="gs-style-panel__intro">{viewNote}</div>}
      {isResponsiveView && groups.length === 0 && (
        <p className="gs-style-panel__empty">{__('This block has no settings for this screen size.', 'blockstyle')}</p>
      )}
      {groups.map((group, index) => {
        const count = customizedCount(group.controls)
        return (
          <CollapsibleSection
            className={`gs-style-panel__section${group.id === QUICK_ID ? ' is-quick' : ''}`}
            initialOpen={index === 0}
            key={`${type}-${group.id}`}
            status={
              count > 0 && (
                <span
                  className="gs-style-panel__count"
                  title={sprintf(
                    /* translators: %d: number of settings set at this level */
                    __('%d set here', 'blockstyle'),
                    count
                  )}
                >
                  {count}
                </span>
              )
            }
            title={group.label}
          >
            <div className="gs-fields">{renderControls(group.controls, group.id === QUICK_ID)}</div>
            {renderReset(group)}
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
