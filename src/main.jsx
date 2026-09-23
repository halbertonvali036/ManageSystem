import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AuthProvider from '@/context/AuthProvider'
import ThemeProvider from '@/context/ThemeProvider'
import RouteErrorBoundary from '@/components/errors/RouteErrorBoundary'
import './styles/theme.css'
import './styles/global.css'
import './styles/motion.css'
import './styles/teacher.css'
import './styles/student.css'
import './styles/admin.css'
import './styles/auth.css'
import './styles/portal.css'
import './styles/admin-dashboard.css'
import './styles/teacher-dashboard.css'
import './styles/student-dashboard.css'
import './styles/data-tables.css'
import './styles/forms.css'
import './styles/detail-pages.css'
import './styles/timetable.css'
import './styles/reports.css'
import './styles/system.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <RouteErrorBoundary>
            <App />
          </RouteErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)