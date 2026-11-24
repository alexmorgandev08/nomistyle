import { InspectorControls } from '@wordpress/block-editor'
import { createHigherOrderComponent } from '@wordpress/compose'
import { type ComponentType } from '@wordpress/element'
import { addFilter } from '@wordpress/hooks'
import { registerPlugin } from '@wordpress/plugins'

import '../shared/components/style.css'
import { blockNameMap } from '../shared/schema'
import BlockPanel from './BlockPanel'
import { editorData, usePostContext } from './context'
import DocumentPanel from './DocumentPanel'
import './editor.css'
import StyleSync from './StyleSync'

interface BlockProps {
  attributes: Record<string, unknown>
  className?: string
  clientId: string
  isSelected: boolean
  name: string
  setAttributes: (attributes: Record<string, unknown>) => void
}

// 1. Give supported core blocks a `gutenStyle` attribute for block-level overrides.
addFilter('blocks.registerBlockType', 'nomistyle/attribute', (settings: { attributes?: object }, name: string) => {
  if (!blockNameMap[name]) return settings
  return { ...settings, attributes: { ...settings.attributes, gutenStyle: { type: 'object' } } }
})

// 2. Add the Nomi Style panel to the block's Styles tab.
addFilter(
  'editor.BlockEdit',
  'nomistyle/panel',
  createHigherOrderComponent(
    BlockEdit =>
      function GutenStyleBlockEdit(props: BlockProps) {
        const type = blockNameMap[props.name]
        return (
          <>
            <BlockEdit {...props} />
            {type && props.isSelected && editorData.canEditStyles && (
              <InspectorControls group="styles">
                <BlockPanel attributes={props.attributes} setAttributes={props.setAttributes} type={type} />
              </InspectorControls>
            )}
          </>
        )
      },
    'withGutenStylePanel'
  )
)

// 3. Add the same classes the front end adds, so the editor shows the real design.
function StyledBlockListBlock({
  BlockListBlock,
  type,
  ...props
}: BlockProps & { BlockListBlock: ComponentType<BlockProps>; type: string }) {
  const { inScope, postId } = usePostContext()

  if (!inScope) return <BlockListBlock {...props} />

  const classes = ['gs', `gs-${type}`, `gs-p-${postId}`, `gs-b-${props.clientId}`]
  return <BlockListBlock {...props} className={[props.className, ...classes].filter(Boolean).join(' ')} />
}

addFilter(
  'editor.BlockListBlock',
  'nomistyle/classes',
  createHigherOrderComponent(
    (BlockListBlock: ComponentType<BlockProps>) =>
      function GutenStyleBlockListBlock(props: BlockProps) {
        const type = blockNameMap[props.name]
        if (!type) return <BlockListBlock {...props} />
        return <StyledBlockListBlock {...props} BlockListBlock={BlockListBlock} type={type} />
      },
    'withGutenStyleClasses'
  )
)

// 4. Live CSS in the canvas + the post-level panel.
registerPlugin('nomistyle', {
  render: () => (
    <>
      <StyleSync />
      {editorData.canEditStyles && <DocumentPanel />}
    </>
  )
})
