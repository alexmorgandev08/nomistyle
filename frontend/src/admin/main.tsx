import domReady from '@wordpress/dom-ready'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './tailwind.css'
import '../shared/components/style.css'
import './admin.css'
import App from './App'
import Providers from './Providers'

domReady(() => {
  const root = document.getElementById('blockstyle-root')
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <Providers>
          <App />
        </Providers>
      </StrictMode>
    )
  }
})
