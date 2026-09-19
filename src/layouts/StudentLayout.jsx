import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppFooter from '@/components/layout/AppFooter'
import StudentHeader from '@/components/student/StudentHeader'
import StudentPageHeader from '@/components/student/StudentPageHeader'
import StudentSidebar from '@/components/student/StudentSidebar'

function StudentLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="app-layout">
        <StudentSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="app-layout__body">
          <StudentHeader onOpenMobile={() => setMobileSidebarOpen(true)} />
          <main className="app-layout__main">
            <div className="app-container">
              <StudentPageHeader />
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default StudentLayout