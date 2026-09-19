import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppFooter from '@/components/layout/AppFooter'
import TeacherHeader from '@/components/teacher/TeacherHeader'
import TeacherPageHeader from '@/components/teacher/TeacherPageHeader'
import TeacherSidebar from '@/components/teacher/TeacherSidebar'

function TeacherLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="app-layout">
        <TeacherSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="app-layout__body">
          <TeacherHeader onOpenMobile={() => setMobileSidebarOpen(true)} />
          <main className="app-layout__main">
            <div className="app-container">
              <TeacherPageHeader />
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default TeacherLayout