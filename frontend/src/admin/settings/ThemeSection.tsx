import { __ } from '@wordpress/i18n'

import { adminData } from '../data'
import SettingRow from '../SettingRow'
import { PaletteIcon, ThemeIcon } from '../settingsIcons'
import SwitchRow from './SwitchRow'
import { type SectionProps } from './types'

/** Theme: whether the theme has theme.json, and whether its colors appear in color pickers. */
export default function ThemeSection({ config, onChange }: SectionProps) {
  return (
    <>
      <SettingRow
        description={
          adminData.themeJson
            ? __('Block Style uses the breakpoints and colors from your theme.json file.', 'blockstyle')
            : __('Your theme has no theme.json file. Block Style uses the WordPress default breakpoints.', 'blockstyle')
        }
        icon={ThemeIcon}
        title={__('theme.json', 'blockstyle')}
      >
        <p className={`gs-settings__value text-end ${adminData.themeJson ? 'is-ok' : ''}`}>
          {adminData.themeJson ? __('Found', 'blockstyle') : __('Not found', 'blockstyle')}
        </p>
      </SettingRow>
      <SwitchRow
        checked={config.themeColors}
        description={
          adminData.palette.length > 0
            ? __('Show your theme\'s color palette next to the default colors in every color picker.', 'blockstyle')
            : __('Your theme has no color palette. Color pickers show the default colors only.', 'blockstyle')
        }
        icon={PaletteIcon}
        onChange={themeColors => onChange({ ...config, themeColors })}
        title={__('Show theme colors in color pickers', 'blockstyle')}
      />
    </>
  )
}
