import { Menu } from 'lucide-react'
import CommandPaletteTrigger from '@/components/commandPalette/CommandPaletteTrigger'
import ThemeToggle from '@/components/common/ThemeToggle'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserMenu from '@/components/layout/UserMenu'
import { STUDENT_PORTAL_LABEL } from '@/utils/studentConstants'

function StudentHeader({ onOpenMobile }) {
  return (
    <header className="app-header">
      <div className="app-header__start">
        <button
          type="button"
          className="app-header__menu"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <span className="student-context">{STUDENT_PORTAL_LABEL}</span>
      </div>
      <div className="app-header__actions">
        <ThemeToggle />
        <CommandPaletteTrigger />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}

export default StudentHeader