import { Menu } from 'lucide-react'
import CommandPaletteTrigger from '@/components/commandPalette/CommandPaletteTrigger'
import NotificationBell from '@/components/notifications/NotificationBell'
import ThemeToggle from '@/components/common/ThemeToggle'
import UserMenu from '@/components/layout/UserMenu'

function AppHeader({ onOpenMobile }) {
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
        <span className="admin-context">Admin</span>
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

export default AppHeader