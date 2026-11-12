import { __ } from '@wordpress/i18n'
import { Checkbox, Tooltip } from 'antd'

import { type EditorOptions } from '../../shared/settings'
import { adminData } from '../data'
import SettingRow from '../SettingRow'
import { BlockIcon, DocumentsIcon, LayersIcon, UsersIcon } from '../settingsIcons'
import SwitchRow from './SwitchRow'
import { type SectionProps } from './types'

/** Administrators can always edit styles (EditorOptions::userCanEdit), so nobody is locked out. */
const ALWAYS_ALLOWED = 'administrator'

/** Block editor: what the GutenStyle panels show, and who sees them. */
export default function BlockEditorSection({ config, onChange }: SectionProps) {
  const set = (changes: Partial<EditorOptions>) => onChange({ ...config, editor: { ...config.editor, ...changes } })

  const toggleRole = (name: string, allowed: boolean) =>
    set({ roles: allowed ? [...config.editor.roles, name] : config.editor.roles.filter(role => role !== name) })

  return (
    <>
      <SwitchRow
        checked={config.editor.showSource}
        description={__('Show the Global, This post and This block choice in the block panel. When it is off, edits go to the first allowed level.', 'guten-style')}
        icon={LayersIcon}
        onChange={showSource => set({ showSource })}
        title={__('Show style source', 'guten-style')}
      />
      <SwitchRow
        checked={config.editor.allowPostStyles}
        description={__('Let editors style all blocks of a type in one post. Existing post styles keep working when this is off.', 'guten-style')}
        icon={DocumentsIcon}
        onChange={allowPostStyles => set({ allowPostStyles })}
        title={__('Allow post styles', 'guten-style')}
      />
      <SwitchRow
        checked={config.editor.allowBlockStyles}
        description={__('Let editors style one single block. Existing block styles keep working when this is off.', 'guten-style')}
        icon={BlockIcon}
        onChange={allowBlockStyles => set({ allowBlockStyles })}
        title={__('Allow block styles', 'guten-style')}
      />
      <SettingRow
        description={__('Users with these roles see the GutenStyle panels in the editor. Administrators always see them.', 'guten-style')}
        icon={UsersIcon}
        title={__('Roles that can edit styles', 'guten-style')}
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          {adminData.roles.map(role =>
            role.name === ALWAYS_ALLOWED ? (
              <Tooltip key={role.name} title={__('Administrators can always edit styles.', 'guten-style')}>
                <Checkbox checked disabled>
                  {role.label}
                </Checkbox>
              </Tooltip>
            ) : (
              <Checkbox
                checked={config.editor.roles.includes(role.name)}
                key={role.name}
                onChange={event => toggleRole(role.name, event.target.checked)}
              >
                {role.label}
              </Checkbox>
            )
          )}
        </div>
      </SettingRow>
    </>
  )
}
