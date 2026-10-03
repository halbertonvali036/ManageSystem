import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AmbientParticles from '@/components/common/AmbientParticles'
import AppFooter from '@/components/layout/AppFooter'
import AppSidebar from '@/components/layout/AppSidebar'
import { AccountHeader, AccountPageHeader } from '@/components/layout/AccountHeader'

/**
 * The shell for the account-level pages: Account & Security, Plan & Billing and
 * Support.
 *
 * One layout for all three. They are the same kind of page — a signed-in person
 * managing their own account — and they keep the same chrome as the rest of the
 * application: the shared sidebar, the shared header and the shared footer. What
 * they do *not* have is a "back" action. Each one is reached from the sidebar and
 * the rail stays on screen beside it, so a back link would only repeat the way
 * out; leaving is what the sidebar is for.
 *
 * @param {{ titleKey: string, path: string }} props
 */
function AccountLayout({ titleKey, path }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="app-layout">
        <AppSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="app-layout__body">
          <AccountHeader onOpenMobile={() => setMobileSidebarOpen(true)} />
          <main className="app-layout__main ambient-particles-host">
            <AmbientParticles variant="admin" intensity="low" />
            <div className="app-container premium-account">
              <AccountPageHeader titleKey={titleKey} path={path} />
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default AccountLayout