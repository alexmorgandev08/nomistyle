import { type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'

import TabNav, { type TabItem, tabId } from '../shared/components/TabNav'

interface SectionPageProps<Section extends TabItem> {
  /** Route of the page; the open section is `#/<basePath>/<section id>`. */
  basePath: string
  /** The open section's content. */
  children: (section: Section) => ReactNode
  /** Prefix for the list and panel ids, e.g. "gs-settings". */
  idPrefix: string
  /** Names the section list for screen readers, e.g. "Settings sections". */
  navLabel: string
  sections: Section[]
  title: string
}

/**
 * A page with a section list on the left and the open section on the right (Settings, Tools).
 * The route must have a `:section?` param. An unknown or missing section opens the first one.
 */
export default function SectionPage<Section extends TabItem>({
  basePath,
  children,
  idPrefix,
  navLabel,
  sections,
  title
}: SectionPageProps<Section>) {
  const { section } = useParams()
  const navigate = useNavigate()
  const active = sections.find(item => item.id === section) ?? sections[0]

  return (
    <div className="gs-settings">
      <h2 className="gs-settings__title">{title}</h2>
      <div className="gs-settings__layout">
        <TabNav
          idPrefix={idPrefix}
          label={navLabel}
          onChange={id => navigate(`/${basePath}/${id}`)}
          orientation="vertical"
          tabs={sections}
          value={active.id}
        />
        <div aria-labelledby={tabId(idPrefix, active.id)} className="gs-settings__card" id={`${idPrefix}-panel`} role="tabpanel">
          <h3 className="gs-settings__section-title">{active.label}</h3>
          {children(active)}
        </div>
      </div>
    </div>
  )
}
