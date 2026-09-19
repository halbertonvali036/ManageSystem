import { Menu } from 'lucide-react'
import UserMenu from '@/components/layout/UserMenu'

function AppHeader({ onOpenMobile }) {
  return (
    <header className="app-header">
      <button
        type="button"
        className="app-header__menu"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu size={22} aria-hidden="true" />
      </button>
      <UserMenu />
    </header>
  )
}

export default AppHeader