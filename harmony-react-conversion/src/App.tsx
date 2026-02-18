import { Routes, Route } from 'react-router-dom'
import { ShellLayout } from './components/harmony/ShellLayout'
import { ComponentGalleryPage } from './pages/ComponentGalleryPage'
import { ComponentDemoPage } from './pages/ComponentDemoPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ShellLayout />} />
      <Route path="/components" element={<ComponentGalleryPage />} />
      <Route path="/components/:componentName" element={<ComponentDemoPage />} />
    </Routes>
  )
}

export default App
