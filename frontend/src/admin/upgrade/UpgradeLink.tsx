import { __ } from '@wordpress/i18n'
import { Button } from 'antd'

import { adminData } from '../data'

/** "Upgrade to Pro": opens the pricing page in a new tab. */
export default function UpgradeLink({ primary = false }: { primary?: boolean }) {
  return (
    <Button href={adminData.upgradeUrl} rel="noopener noreferrer" size={primary ? 'middle' : 'small'} target="_blank" type={primary ? 'primary' : 'default'}>
      {__('Upgrade to Pro', 'blockstyle')}
    </Button>
  )
}
