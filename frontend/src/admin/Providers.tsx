import { StyleProvider } from '@ant-design/cssinjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import { type ReactNode } from 'react'
import { HashRouter } from 'react-router'

import { useUiTheme } from '../shared/theme'
import { antTheme } from './antTheme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 }
  }
})

/** Server data (TanStack Query), hash routing (wp-admin owns the real URL) and the antd theme. */
export default function Providers({ children }: { children: ReactNode }) {
  const [uiTheme] = useUiTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        {/* hashPriority="high" drops antd's :where() wrapper, so wp-admin form CSS cannot override it. */}
        <StyleProvider hashPriority="high">
          <ConfigProvider theme={antTheme(uiTheme)}>
            {/* AntApp gives modal.confirm() the theme above (App.useApp()). */}
            <AntApp component={false}>{children}</AntApp>
          </ConfigProvider>
        </StyleProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}
