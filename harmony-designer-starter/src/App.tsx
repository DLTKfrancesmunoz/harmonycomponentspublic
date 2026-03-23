import { useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { ShellLayout } from './components/harmony/ShellLayout'
import { Card } from './components/harmony/Card'
import { ComponentGalleryPage } from './pages/ComponentGalleryPage'
import { ComponentDemoPage } from './pages/ComponentDemoPage'

/** Default product theme for the designer preview (change via document.documentElement.classList if needed). */
const DEFAULT_THEME = 'theme-ppm'

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
          <Link
            to="/components"
            className="text-primary"
            style={{ textDecoration: 'underline' }}
          >
            Browse components
          </Link>
        </div>
      </Card>
    </ShellLayout>
  )
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove(
      'theme-cp',
      'theme-ppm',
      'theme-vp',
      'theme-maconomy',
    )
    document.documentElement.classList.add(DEFAULT_THEME)
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomeShell />} />
      <Route path="/components" element={<ComponentGalleryPage />} />
      <Route path="/components/:componentName" element={<ComponentDemoPage />} />
    </Routes>
  )
}

export default App
