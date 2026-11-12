import { __, sprintf } from '@wordpress/i18n'

import UpgradeCard from '../upgrade/UpgradeCard'
import UpgradeLink from '../upgrade/UpgradeLink'
import { type LockedBlock } from './types'

/** Global Styles for a GutenStyle Pro block in the free plugin: what Pro styles, and an upgrade link. */
export default function LockedBlockView({ block }: { block: LockedBlock }) {
  return (
    <>
      <section aria-label={__('Preview', 'guten-style')} className="gs-preview">
        <div className="m-auto w-full max-w-xl p-6">
          <UpgradeCard
            description={sprintf(
              /* translators: %s: block name, e.g. "Paragraph" */
              __('Style every %s block on your site with GutenStyle Pro.', 'guten-style'),
              block.label
            )}
            features={block.features}
            title={block.label}
          />
        </div>
      </section>
      <aside aria-label={__('Block styles', 'guten-style')} className="gs-global__inspector">
        <header className="gs-inspector__element">
          <code>
            &lt;{block.tag}&gt; <span className="gs-inspector__label">{block.label}</span>
          </code>
          <code className="gs-inspector__class">.wp-block-{block.type}</code>
        </header>
        <div className="gs-inspector__section gs-global__header">
          <div>
            <h2>{__('Global style', 'guten-style')}</h2>
            <p>{block.description}</p>
          </div>
        </div>
        <div className="gs-inspector__section flex flex-col items-start gap-3">
          <p className="m-0">{__('This block is part of GutenStyle Pro.', 'guten-style')}</p>
          <UpgradeLink primary />
        </div>
      </aside>
    </>
  )
}
