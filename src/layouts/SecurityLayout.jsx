import { Outlet } from 'react-router-dom'
import AppFooter from '@/components/layout/AppFooter'
import SecurityHeader from '@/components/security/SecurityHeader'
import SecurityPageHeader from '@/components/security/SecurityPageHeader'

/**
 * Account layout for Account & Security.
 *
 * Deliberately sidebar-free: sign-in and credential security is an account
 * concern shared by every authenticated role, not an academic-management
 * screen. The shared header (theme, notifications, user menu) and footer are
 * kept so the page still feels part of the signed-in application.
 */
function SecurityLayout() {
  return (
    <div className="app-shell">
      <div className="app-layout app-layout--focused">
        <div className="app-layout__body">
          <SecurityHeader />
          <main className="app-layout__main">
            <div className="app-container">
              <SecurityPageHeader />
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default SecurityLayout
