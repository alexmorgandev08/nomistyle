import { Button, Notice, ToggleControl } from '@wordpress/components'
import { PluginDocumentSettingPanel } from '@wordpress/editor'
import { __, _n, sprintf } from '@wordpress/i18n'

import { getBlock } from '../shared/schema'
import { countValues, withStyles } from '../shared/values'
import { OutOfScopeNotice } from './BlockPanel'
import { editorData, usePostContext } from './context'

/** Post-level Nomi Style settings in the editor's document sidebar. */
export default function DocumentPanel() {
  const context = usePostContext()

  return (
    <PluginDocumentSettingPanel className="gs-document-panel" name="nomistyle" title={__('Nomi Style', 'nomistyle')}>
      {!context.typeEnabled || !context.matchesConditions ? (
        <OutOfScopeNotice />
      ) : !context.metaAvailable ? (
        <Notice isDismissible={false} status="warning">
          {__('Nomi Style cannot read this post\'s settings. Reload the editor after saving the post.', 'nomistyle')}
        </Notice>
      ) : (
        <>
          <ToggleControl
            __nextHasNoMarginBottom
            checked={!context.disabled}
            help={
              context.disabled
                ? __('This post uses the theme\'s default design.', 'nomistyle')
                : __('Global styles and any overrides below apply to this post.', 'nomistyle')
            }
            label={__('Use Nomi Style on this post', 'nomistyle')}
            onChange={enabled => context.setDisabled(!enabled)}
          />

          {!context.disabled && editorData.config.editor.allowPostStyles && (
            <div className="gs-document-panel__overrides">
              <p className="gs-document-panel__heading">{__('Post overrides', 'nomistyle')}</p>
              {Object.keys(context.postStyles).length === 0 ? (
                <p className="gs-document-panel__empty">
                  {__('None. Select a supported block (table, heading, list, quote, accordion, button or image), open its Styles tab and choose "Whole post" to override it for this post.', 'nomistyle')}
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
                            _n('%d setting', '%d settings', countValues(values), 'nomistyle'),
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
                        {__('Remove', 'nomistyle')}
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
