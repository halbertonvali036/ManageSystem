import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AuthProvider from '@/context/AuthProvider'
import RouteErrorBoundary from '@/components/errors/RouteErrorBoundary'
import './styles/global.css'
import './styles/motion.css'
import './styles/teacher.css'
import './styles/student.css'
import './styles/admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RouteErrorBoundary>
          <App />
        </RouteErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)