import { Button, Notice, ToggleControl } from '@wordpress/components'
import { PluginDocumentSettingPanel } from '@wordpress/editor'
import { __, _n, sprintf } from '@wordpress/i18n'

import { getBlock } from '../shared/schema'
import { countValues, withStyles } from '../shared/values'
import { OutOfScopeNotice } from './BlockPanel'
import { editorData, usePostContext } from './context'

/** Post-level GutenStyle settings in the editor's document sidebar. */
export default function DocumentPanel() {
  const context = usePostContext()

  return (
    <PluginDocumentSettingPanel className="gs-document-panel" name="guten-style" title={__('GutenStyle', 'guten-style')}>
      {!context.typeEnabled || !context.matchesConditions ? (
        <OutOfScopeNotice />
      ) : !context.metaAvailable ? (
        <Notice isDismissible={false} status="warning">
          {__('GutenStyle cannot read this post\'s settings. Reload the editor after saving the post.', 'guten-style')}
        </Notice>
      ) : (
        <>
          <ToggleControl
            __nextHasNoMarginBottom
            checked={!context.disabled}
            help={
              context.disabled
                ? __('This post uses the theme\'s default design.', 'guten-style')
                : __('Global styles and any overrides below apply to this post.', 'guten-style')
            }
            label={__('Use GutenStyle on this post', 'guten-style')}
            onChange={enabled => context.setDisabled(!enabled)}
          />

          {!context.disabled && editorData.config.editor.allowPostStyles && (
            <div className="gs-document-panel__overrides">
              <p className="gs-document-panel__heading">{__('Post overrides', 'guten-style')}</p>
              {Object.keys(context.postStyles).length === 0 ? (
                <p className="gs-document-panel__empty">
                  {__('None. Select a supported block (table, heading, list, quote, accordion, button or image), open its Styles tab and choose "Whole post" to override it for this post.', 'guten-style')}
                </p>
              ) : (
                <ul>
                  {Object.entries(context.postStyles).map(([type, values]) => (
                    <li key={type}>
                      <span>
                        {getBlock(type)?.label}{' '}
                        <span className="gs-document-panel__count">
                          {sprintf(
                            /* translators: %d: number of settings */
                            _n('%d setting', '%d settings', countValues(values), 'guten-style'),
                            countValues(values)
                          )}
                        </span>
                      </span>
                      <Button
                        isDestructive
                        onClick={() => context.setPostStyles(withStyles(context.postStyles, type, {}))}
                        size="small"
                        variant="link"
                      >
                        {__('Remove', 'guten-style')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </PluginDocumentSettingPanel>
  )
}
