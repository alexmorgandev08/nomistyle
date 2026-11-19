import { __, sprintf } from '@wordpress/i18n'
import { InputNumber, Segmented } from 'antd'
import { useState } from 'react'

import { BREAKPOINT_LIMITS, type Breakpoints, breakpointsFromQueries, isValidBreakpoints } from '../../shared/settings'
import { adminData } from '../data'
import SettingRow from '../SettingRow'
import { DevicesIcon, ScreenIcon } from '../settingsIcons'
import DeviceValues from './DeviceValues'
import { type SectionProps } from './types'

/** WordPress core's breakpoints, for themes whose media queries cannot be read. */
const CORE_BREAKPOINTS: Breakpoints = { mobile: 480, tablet: 782 }

/** Responsive: the theme's breakpoints or custom ones, and (Pro) device values for more settings. */
export default function ResponsiveSection({ config, onChange }: SectionProps) {
  const theme = breakpointsFromQueries(adminData.themeMediaQueries) ?? CORE_BREAKPOINTS
  // Widths being typed that are not valid yet; valid widths go straight to the config.
  const [pending, setPending] = useState<Breakpoints | null>(null)
  const custom = config.breakpoints !== null
  const shown = pending ?? config.breakpoints ?? theme

  const setMode = (mode: string) => {
    setPending(null)
    onChange({ ...config, breakpoints: mode === 'custom' ? theme : null })
  }

  const setWidth = (key: keyof Breakpoints, value: number | null) => {
    const next = { ...shown, [key]: value ?? 0 }
    if (isValidBreakpoints(next)) {
      setPending(null)
      onChange({ ...config, breakpoints: next })
    } else {
      setPending(next)
    }
  }

  return (
    <>
      <SettingRow
        description={__('Tablet values apply up to the tablet width. Mobile values apply up to the mobile width.', 'blockstyle')}
        icon={DevicesIcon}
        title={__('Breakpoints', 'blockstyle')}
      >
        <Segmented
          block
          onChange={setMode}
          options={[
            { label: __('Theme', 'blockstyle'), value: 'theme' },
            { label: __('Custom', 'blockstyle'), value: 'custom' }
          ]}
          value={custom ? 'custom' : 'theme'}
        />
      </SettingRow>

      <SettingRow
        description={
          custom
            ? __('Enter the largest screen width for tablet and for mobile values.', 'blockstyle')
            : __('These widths come from WordPress and your theme.', 'blockstyle')
        }
        icon={ScreenIcon}
        title={custom ? __('Custom widths', 'blockstyle') : __('Theme widths', 'blockstyle')}
      >
        {custom ? (
          <div className="grid grid-cols-2 gap-2">
            <WidthField label={__('Tablet up to', 'blockstyle')} onChange={value => setWidth('tablet', value)} value={shown.tablet} />
            <WidthField label={__('Mobile up to', 'blockstyle')} onChange={value => setWidth('mobile', value)} value={shown.mobile} />
            {pending && (
              <p className="gs-settings__error col-span-2" role="alert">
                {sprintf(
                  /* translators: 1: smallest width, 2: largest width */
                  __('Mobile must be smaller than tablet. Use widths from %1$d to %2$d px.', 'blockstyle'),
                  BREAKPOINT_LIMITS.min,
                  BREAKPOINT_LIMITS.max
                )}
              </p>
            )}
          </div>
        ) : (
          <p className="gs-settings__value">
            {sprintf(
              /* translators: 1: tablet width in px, 2: mobile width in px */
              __('Tablet up to %1$d px, mobile up to %2$d px', 'blockstyle'),
              theme.tablet,
              theme.mobile
            )}
          </p>
        )}
      </SettingRow>

      <DeviceValues config={config} onChange={onChange} />
    </>
  )
}

function WidthField({ label, onChange, value }: { label: string; onChange: (value: number | null) => void; value: number }) {
  return (
    <label className="grid gap-1">
      <span className="gs-settings__field-label">{label}</span>
      <InputNumber
        aria-label={label}
        className="w-full"
        max={BREAKPOINT_LIMITS.max}
        min={BREAKPOINT_LIMITS.min}
        onChange={onChange}
        precision={0}
        suffix="px"
        value={value}
      />
    </label>
  )
}
