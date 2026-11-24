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
            ? __('Nomi Style uses the breakpoints and colors from your theme.json file.', 'nomistyle')
            : __('Your theme has no theme.json file. Nomi Style uses the WordPress default breakpoints.', 'nomistyle')
        }
        icon={ThemeIcon}
        title={__('theme.json', 'nomistyle')}
      >
        <p className={`gs-settings__value text-end ${adminData.themeJson ? 'is-ok' : ''}`}>
          {adminData.themeJson ? __('Found', 'nomistyle') : __('Not found', 'nomistyle')}
        </p>
      </SettingRow>
      <SwitchRow
        checked={config.themeColors}
        description={
          adminData.palette.length > 0
            ? __('Show your theme\'s color palette next to the default colors in every color picker.', 'nomistyle')
            : __('Your theme has no color palette. Color pickers show the default colors only.', 'nomistyle')
        }
        icon={PaletteIcon}
        onChange={themeColors => onChange({ ...config, themeColors })}
        title={__('Show theme colors in color pickers', 'nomistyle')}
      />
    </>
  )
}
