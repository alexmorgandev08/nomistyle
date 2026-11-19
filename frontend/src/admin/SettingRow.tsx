import { __, sprintf } from '@wordpress/i18n'
import { Tooltip } from 'antd'
import { type ReactNode } from 'react'

import { InfoIcon } from './settingsIcons'

interface SettingRowProps {
  /** Shown after the title, e.g. a PRO tag. */
  badge?: ReactNode
  /** The control: shown on the right, or under the text when `stacked`. */
  children: ReactNode
  /** Help text, shown in a tooltip on the info icon. Screen readers read it with the title. */
  description?: string
  icon?: ReactNode
  /** Dim the title and help text, e.g. for a Pro feature shown in the free plugin. */
  muted?: boolean
  /** Put the control under the text, for wide content such as lists. */
  stacked?: boolean
  title: string
  /** Id of the title, so the control can point to it with aria-labelledby. */
  titleId?: string
}

/** One setting in a settings card: icon, title and info tooltip on the left, the control on the right. */
export default function SettingRow({
  badge,
  children,
  description,
  icon,
  muted = false,
  stacked = false,
  title,
  titleId
}: SettingRowProps) {
  return (
    <div className={`gs-setting-row${stacked ? ' is-stacked' : ''}${muted ? ' is-muted' : ''}`}>
      <div className="gs-setting-row__text">
        {icon && (
          <span aria-hidden className="gs-setting-row__icon">
            {icon}
          </span>
        )}
        <h3 className="gs-setting-row__title" id={titleId}>
          {title}
        </h3>
        {description && (
          <>
            <Tooltip title={description} trigger={['hover', 'focus']}>
              <button
                aria-label={sprintf(
                  /* translators: %s: setting name */
                  __('About %s', 'blockstyle'),
                  title
                )}
                className="gs-setting-row__info"
                type="button"
              >
                {InfoIcon}
              </button>
            </Tooltip>
            <span className="sr-only">{description}</span>
          </>
        )}
        {badge}
      </div>
      <div className="gs-setting-row__control">{children}</div>
    </div>
  )
}
