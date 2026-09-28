import { Outlet } from 'react-router-dom'
import AppFooter from '@/components/layout/AppFooter'
import BillingPageHeader from '@/components/billing/BillingPageHeader'
import BillingHeader from '@/components/billing/BillingHeader'

/**
 * Account layout for Plan & Billing.
 *
 * Deliberately sidebar-free: billing is an account concern shared by every
 * authenticated role, not an academic-management screen. The shared header
 * (theme, notifications, user menu) and footer are kept so the page still
 * feels part of the signed-in application.
 */
function BillingLayout() {
  return (
    <div className="app-shell">
      <div className="app-layout app-layout--focused">
        <div className="app-layout__body">
          <BillingHeader />
          <main className="app-layout__main">
            <div className="app-container">
              <BillingPageHeader />
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default BillingLayout
