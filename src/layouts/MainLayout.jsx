import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import AppFooter from '@/components/layout/AppFooter'
import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'

function MainLayout() {
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
          <main className="app-layout__main">
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