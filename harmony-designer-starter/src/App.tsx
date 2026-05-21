import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { ShellLayout } from './components/harmony/ShellLayout'
import { Card } from './components/harmony/Card'
import { ComponentGalleryPage } from './pages/ComponentGalleryPage'
import { ComponentDemoPage } from './pages/ComponentDemoPage'
import { RightSidebarPanelDemosPage } from './pages/RightSidebarPanelDemosPage'

const THEMES = ['theme-cp', 'theme-ppm', 'theme-vp', 'theme-maconomy'] as const
type Theme = (typeof THEMES)[number]
const DEFAULT_THEME: Theme = 'theme-ppm'

function HomeShell() {
  return (
    <ShellLayout pageHeaderTitle="">
      <Card primary elevated>
        <div className="card__body">
          <h2 className="text-xl font-semibold mb-2">Page Content Area</h2>
          <p className="text-secondary mb-4">
            This is where your application content lives. The shell provides the
            structure, and you provide the content.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              to="/components"
              className="text-primary"
              style={{ textDecoration: 'underline' }}
            >
              Browse components
            </Link>
            <Link
              to="/demos/right-sidebar-panels"
              className="text-primary"
              style={{ textDecoration: 'underline' }}
            >
              Right sidebar + panel demos
            </Link>
          </div>
        </div>
      </Card>
    </ShellLayout>
  )
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('harmony-dev-theme') as Theme) ?? DEFAULT_THEME
  })

  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem('harmony-dev-dark') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.remove(...THEMES)
    document.documentElement.classList.add(theme)
    localStorage.setItem('harmony-dev-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('harmony-dev-dark', String(dark))
  }, [dark])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(4px)',
          borderBottom: '1px solid #e0e0e0',
          borderLeft: '1px solid #e0e0e0',
          borderRadius: '0 0 0 6px',
          fontSize: '12px',
        }}
      >
        <span style={{ color: '#666', fontFamily: 'monospace' }}>Theme:</span>
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            style={{
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'monospace',
              border: '1px solid #ccc',
              borderRadius: '3px',
              background: theme === t ? '#1a1a1a' : '#fff',
              color: theme === t ? '#fff' : '#333',
            }}
          >
            {t.replace('theme-', '')}
          </button>
        ))}
        <div style={{ width: '1px', height: '16px', background: '#e0e0e0', margin: '0 2px' }} />
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          style={{
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'monospace',
            border: '1px solid #ccc',
            borderRadius: '3px',
            background: dark ? '#1a1a1a' : '#fff',
            color: dark ? '#fff' : '#333',
          }}
        >
          {dark ? '☀ light' : '☾ dark'}
        </button>
      </div>
      <Routes>
        <Route path="/" element={<HomeShell />} />
        <Route path="/components" element={<ComponentGalleryPage />} />
        <Route path="/components/:componentName" element={<ComponentDemoPage />} />
        <Route path="/demos/right-sidebar-panels" element={<RightSidebarPanelDemosPage />} />
      </Routes>
    </>
  )
}

export default App
