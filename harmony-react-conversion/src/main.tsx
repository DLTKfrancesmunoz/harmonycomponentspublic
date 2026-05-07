import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@dltkfrancesmunoz/harmony-design-system/styles/reset.css'
import '@dltkfrancesmunoz/harmony-design-system/styles/tokens.css'
import '@dltkfrancesmunoz/harmony-design-system/styles/global.css'
import '@dltkfrancesmunoz/harmony-design-system/styles/components.css'
import '@dltkfrancesmunoz/harmony-design-system/styles/layout.css'
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
