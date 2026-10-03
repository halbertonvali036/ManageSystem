import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import CommandPaletteTrigger from '@/components/commandPalette/CommandPaletteTrigger'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import NotificationBell from '@/components/notifications/NotificationBell'
import PageTitle from '@/components/common/PageTitle'
import ThemeToggle from '@/components/common/ThemeToggle'
import useTranslation from '@/hooks/useTranslation'

/**
 * Topbar for the signed-in application.
 *
 * Deliberately thin. Everything that *is* navigation — profile, plan, security,
 * support, notifications, sign-out — lives in the left sidebar, so repeating
 * them here would give the same destination two homes and let the two copies
 * drift apart. The topbar carries no profile control of its own: the identity
 * entry pinned above Logout in the sidebar is the one place it lives.
 *
 * What remains is what cannot be a navigation item: where you are, the tools you
 * reach for constantly (search, notifications), and the two display preferences
 * (language, theme) that are switches rather than destinations.
 */
function AppHeader({ onOpenMobile }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <header className="app-header">
      <div className="app-header__start">
        <button
          type="button"
          className="app-header__menu"
          onClick={onOpenMobile}
          aria-label={t('appShell.openMenu')}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <PageTitle pathname={pathname} />
      </div>
      <div className="app-header__actions">
        <LanguageSwitcher variant="compact" />
        <ThemeToggle />
        <CommandPaletteTrigger />
        <NotificationBell />
      </div>
    </header>
  )
}

export default AppHeader
