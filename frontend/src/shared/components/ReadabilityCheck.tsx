import { __, _n, sprintf } from '@wordpress/i18n'

import { ASSUMED_BACKGROUND, ASSUMED_TEXT, checkReadability } from '../a11y'
import { getControls, type StyleValues } from '../schema'
import CollapsibleSection from './CollapsibleSection'

interface ReadabilityCheckProps {
  /** Applies a fix to the level being edited. Without it, the check only warns. */
  onFix?: (changes: StyleValues) => void
  type: string
  /** The block's effective values (all levels merged). */
  values: StyleValues
}

const DEVICE_NAMES: Record<string, string> = { mobile: 'mobile', tablet: 'tablet' }

/** Contrast and text-size warnings for a block. Warns only; never changes the design. */
export default function ReadabilityCheck({ onFix, type, values }: ReadabilityCheckProps) {
  const fixButton = (changes: StyleValues | undefined, label: string) =>
    onFix && changes ? (
      <button
        aria-label={sprintf(
          /* translators: %s: what is fixed, e.g. "Header text" */
          __('Fix %s', 'blockstyle'),
          label
        )}
        className="gs-btn gs-readability__fix"
        onClick={() => onFix(changes)}
        type="button"
      >
        {__('Fix', 'blockstyle')}
      </button>
    ) : null

  const { contrast, smallText } = checkReadability(type, values)
  const issues = contrast.filter(item => !item.ok).length + smallText.length
  const labels = Object.fromEntries(getControls(type).map(control => [control.key, control.label]))

  const summary =
    contrast.length + smallText.length === 0
      ? __('Nothing to check', 'blockstyle')
      : issues === 0
        ? __('All clear', 'blockstyle')
        : sprintf(
            /* translators: %d: number of readability problems */
            _n('%d issue', '%d issues', issues, 'blockstyle'),
            issues
          )

  return (
    <CollapsibleSection
      className="gs-readability"
      initialOpen={issues > 0}
      status={<span className={`gs-readability__summary${issues > 0 ? ' has-issues' : ''}`}>{summary}</span>}
      title={__('Accessibility', 'blockstyle')}
    >

      {(contrast.length > 0 || smallText.length > 0) && (
        <ul className="gs-readability__list">
          {contrast.map(item => (
            <li className={`gs-readability__item${item.ok ? '' : ' is-bad'}`} key={item.label}>
              <span aria-hidden className="gs-readability__sample" style={{ background: item.bg, color: item.fg }}>
                Aa
              </span>
              <span className="gs-readability__text">
                <span className="gs-readability__label">{item.label}</span>
                <span className="gs-readability__detail">
                  {sprintf(
                    /* translators: 1: contrast ratio, 2: required ratio */
                    __('%1$s:1 · needs %2$s:1', 'blockstyle'),
                    item.ratio.toFixed(1),
                    String(item.required)
                  )}
                </span>
              </span>
              <span className="gs-readability__badge">{item.ok ? __('Pass', 'blockstyle') : __('Low contrast', 'blockstyle')}</span>
              {fixButton(item.fix, item.label)}
            </li>
          ))}
          {smallText.map(item => {
            const [key, device] = item.label.split('@')
            const name = labels[key] ?? key
            return (
              <li className="gs-readability__item is-bad" key={item.label}>
                <span aria-hidden className="gs-readability__sample is-size">{item.px}</span>
                <span className="gs-readability__text">
                  <span className="gs-readability__label">{device ? `${name} (${DEVICE_NAMES[device] ?? device})` : name}</span>
                  <span className="gs-readability__detail">
                    {sprintf(
                      /* translators: %s: text size in px */
                      __('%spx is hard to read. Use 12px or more.', 'blockstyle'),
                      String(item.px)
                    )}
                  </span>
                </span>
                <span className="gs-readability__badge">{__('Too small', 'blockstyle')}</span>
                {fixButton(item.fix, name)}
              </li>
            )
          })}
        </ul>
      )}

      <p className="gs-readability__note">
        {sprintf(
          /* translators: 1: assumed text color, 2: assumed page color */
          __('WCAG AA needs 4.5:1 for body text and 3:1 for large text. Where Block Style sets no color, the check assumes %1$s text on a %2$s page. Fix changes one setting at the level you edit. Nothing changes until you click it.', 'blockstyle'),
          ASSUMED_TEXT,
          ASSUMED_BACKGROUND
        )}
      </p>
    </CollapsibleSection>
  )
}
