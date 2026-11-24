import { __ } from '@wordpress/i18n'
import { Alert, Button } from 'antd'
import { useEffect } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'

import ThemeToggle from '../shared/components/ThemeToggle'
import { themeClass, useUiTheme } from '../shared/theme'
import { useConfigStore, useIsDirty } from './configStore'
import DesignSystem from './design/DesignSystem'
import GlobalStyles from './GlobalStyles'
import PlanBadge from './plan/PlanBadge'
import { useSaveConfig } from './queries'
import Settings from './Settings'
import Tools from './Tools'
import ProOnlyBadge from './upgrade/ProOnlyBadge'
import { SHOW_PRO_FEATURES } from './upgrade/showProFeatures'

const ROUTES = [
  { label: __('Global Styles', 'nomistyle'), path: 'styles' },
  { label: __('Design System', 'nomistyle'), path: 'design', pro: true },
  { label: __('Tools', 'nomistyle'), path: 'tools' },
  { label: __('Settings', 'nomistyle'), path: 'settings' }
].filter(item => SHOW_PRO_FEATURES || !item.pro)

export default function App() {
  const [theme] = useUiTheme()
  const draft = useConfigStore(state => state.draft)
  const setDraft = useConfigStore(state => state.setDraft)
  const discard = useConfigStore(state => state.discard)
  const isDirty = useIsDirty()
  const save = useSaveConfig()

  useEffect(() => {
    if (!isDirty) return undefined
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  return (
    <div className={`gs-admin ${themeClass(theme)}`}>
      <header className="gs-admin__header">
        <div className="gs-admin__brand">
          <h1>Nomi Style</h1>
          <PlanBadge />
        </div>
        <nav className="gs-admin__tabs">
          {ROUTES.map(item => (
            <NavLink className={({ isActive }) => `inline-flex items-center gap-1.5${isActive ? ' is-active' : ''}`} key={item.path} to={`/${item.path}`}>
              {item.label}
              {item.pro && <ProOnlyBadge />}
            </NavLink>
          ))}
        </nav>
        <div className="gs-admin__actions">
          <ThemeToggle />
          {save.isSuccess && !isDirty && <span className="gs-admin__saved">{__('Saved', 'nomistyle')}</span>}
          {isDirty && <span className="gs-admin__unsaved">{__('Unsaved changes', 'nomistyle')}</span>}
          {isDirty && (
            <Button className="h-9 px-4" onClick={discard}>
              {__('Discard', 'nomistyle')}
            </Button>
          )}
          <Button
            className="h-9 px-4"
            disabled={!isDirty}
            loading={save.isPending}
            onClick={() => save.mutate(draft)}
            type="primary"
          >
            {__('Save changes', 'nomistyle')}
          </Button>
        </div>
      </header>

      {save.isError && (
        <Alert
          className="gs-admin__notice"
          closable={{ onClose: () => save.reset() }}
          showIcon
          title={__('Saving failed. Check your connection and try again.', 'nomistyle')}
          type="error"
        />
      )}

      <main className="gs-admin__body">
        <Routes>
          <Route element={<GlobalStyles config={draft} onChange={setDraft} />} path="/styles/:type?" />
          {SHOW_PRO_FEATURES && <Route element={<DesignSystem />} path="/design" />}
          <Route element={<Tools />} path="/tools/:section?" />
          <Route element={<Settings config={draft} onChange={setDraft} />} path="/settings/:section?" />
          <Route element={<Navigate replace to="/styles" />} path="*" />
        </Routes>
      </main>
    </div>
  )
}
