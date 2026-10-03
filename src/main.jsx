import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AuthProvider from '@/context/AuthProvider'
import LocaleProvider from '@/context/LocaleProvider'
import ThemeProvider from '@/context/ThemeProvider'
import RouteErrorBoundary from '@/components/errors/RouteErrorBoundary'
import './styles/theme.css'
import './styles/global.css'
import './styles/motion.css'
import './styles/auth.css'
import './styles/portal.css'
import './styles/workspace.css'
import './styles/data-tables.css'
import './styles/forms.css'
import './styles/detail-pages.css'
import './styles/system.css'
import './styles/billing.css'
import './styles/security.css'
import './styles/external-auth.css'
import './styles/qr-login.css'
import './styles/notifications.css'
import './styles/sites.css'
import './styles/workspaces.css'
import './styles/database.css'
import './styles/capabilities.css'
import './styles/integrations.css'
import './styles/domains.css'
import './styles/members.css'
import './styles/activity.css'
import './styles/ai.css'
import './styles/deployments.css'
import './styles/editor.css'
import './styles/publishing.css'
import './styles/site-forms.css'
import './styles/site-design.css'
import './styles/language-switcher.css'
import './styles/site-motion.css'
import './styles/builder-motion.css'
import './styles/dashboard-polish.css'
import './styles/account-polish.css'
import './styles/builder-polish.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <ThemeProvider>
          <AuthProvider>
            <RouteErrorBoundary>
              <App />
            </RouteErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)
