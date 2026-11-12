import ProBadge from './ProBadge'
import UpgradeLink from './UpgradeLink'

interface UpgradeCardProps {
  description: string
  /** What the Pro feature does, one short line each. */
  features?: string[]
  /** Leave out when a heading above already names the feature, e.g. a Settings section. */
  title?: string
}

/**
 * Describes a GutenStyle Pro feature in the free plugin, with an upgrade link.
 * Only words and a link: the free plugin holds no Pro code (WordPress.org rules).
 */
export default function UpgradeCard({ description, features = [], title }: UpgradeCardProps) {
  return (
    <div className="gs-upgrade-card">
      {title && (
        <div className="flex items-center gap-2">
          <h3 className="gs-upgrade-card__title">{title}</h3>
          <ProBadge />
        </div>
      )}
      <p className="gs-upgrade-card__description">{description}</p>
      {features.length > 0 && (
        <ul className="gs-upgrade-card__features">
          {features.map(feature => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
      <UpgradeLink primary />
    </div>
  )
}
