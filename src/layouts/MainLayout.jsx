import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AmbientParticles from '@/components/common/AmbientParticles'
import PageHeader from '@/components/common/PageHeader'
import AppFooter from '@/components/layout/AppFooter'
import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'

function MainLayout() {
  const { pathname } = useLocation()
  const ambientVariant = pathname === '/admin' || pathname.startsWith('/admin/') ? 'admin' : 'dashboard'
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
          <AppHeader onOpenMobile={() => setMobileSidebarOpen(true)} />
          <main className="app-layout__main ambient-particles-host">
            <AmbientParticles variant={ambientVariant} intensity="low" />
            <div className="app-container">
              <PageHeader />
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default MainLayout
