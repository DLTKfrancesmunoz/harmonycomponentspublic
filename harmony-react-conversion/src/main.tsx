import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@deltek/harmony-components/styles/reset.css'
import '@deltek/harmony-components/styles/tokens.css'
import '@deltek/harmony-components/styles/global.css'
import '@deltek/harmony-components/styles/components.css'
import '@deltek/harmony-components/styles/layout.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </HashRouter>
  </StrictMode>,
)
