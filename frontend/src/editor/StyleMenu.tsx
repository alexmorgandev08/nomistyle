import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components'
import { __ } from '@wordpress/i18n'

/** Gutenberg's "more" (⋮) icon. @wordpress/icons is not a WordPress script, so it is drawn here. */
const MORE_ICON = (
  <svg aria-hidden height="24" viewBox="0 0 24 24" width="24">
    <path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z" />
  </svg>
)

/** A menu item added by a feature, e.g. GutenStyle Pro's "Save as preset". */
export interface StyleMenuAction {
  disabled?: boolean
  /** Short help under the label. */
  info?: string
  label: string
  onClick: () => void
}

interface StyleMenuProps {
  /** Whether the level being edited has a style to copy or reset. */
  canCopyOrReset: boolean
  /** Whether a style of this block type was copied before. */
  canPaste: boolean
  /** More actions, shown before the reset action. */
  extraActions?: StyleMenuAction[]
  /** Link to this block type in GutenStyle › Global Styles; none when the user cannot manage it. */
  globalStyleUrl?: string
  onCopy: () => void
  onPaste: () => void
  onReset: () => void
  /** What a paste needs first, e.g. "Copy a table style first." */
  pasteHint: string
  /** e.g. "Reset this table" or "Remove post style". */
  resetLabel: string
}

/** The block panel's ⋯ menu: copy, paste, edit global style, reset. */
export default function StyleMenu({
  canCopyOrReset,
  canPaste,
  extraActions = [],
  globalStyleUrl,
  onCopy,
  onPaste,
  onReset,
  pasteHint,
  resetLabel
}: StyleMenuProps) {
  return (
    <DropdownMenu className="gs-style-menu" icon={MORE_ICON} label={__('GutenStyle actions', 'guten-style')}>
      {({ onClose }: { onClose: () => void }) => (
        <>
          <MenuGroup>
            <MenuItem
              disabled={!canCopyOrReset}
              onClick={() => {
                onCopy()
                onClose()
              }}
            >
              {__('Copy style', 'guten-style')}
            </MenuItem>
            <MenuItem
              disabled={!canPaste}
              info={canPaste ? undefined : pasteHint}
              onClick={() => {
                onPaste()
                onClose()
              }}
            >
              {__('Paste style', 'guten-style')}
            </MenuItem>
          </MenuGroup>
          {globalStyleUrl && (
            <MenuGroup>
              <MenuItem
                info={__('Opens in a new tab', 'guten-style')}
                onClick={() => {
                  window.open(globalStyleUrl, '_blank', 'noopener,noreferrer')
                  onClose()
                }}
              >
                {__('Edit global style', 'guten-style')}
              </MenuItem>
            </MenuGroup>
          )}
          {extraActions.length > 0 && (
            <MenuGroup>
              {extraActions.map(action => (
                <MenuItem
                  disabled={action.disabled}
                  info={action.info}
                  key={action.label}
                  onClick={() => {
                    action.onClick()
                    onClose()
                  }}
                >
                  {action.label}
                </MenuItem>
              ))}
            </MenuGroup>
          )}
          <MenuGroup>
            <MenuItem
              disabled={!canCopyOrReset}
              isDestructive
              onClick={() => {
                onReset()
                onClose()
              }}
            >
              {resetLabel}
            </MenuItem>
          </MenuGroup>
        </>
      )}
    </DropdownMenu>
  )
}
