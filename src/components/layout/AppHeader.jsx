import { Menu, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import CommandPaletteTrigger from '@/components/commandPalette/CommandPaletteTrigger'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import NotificationBell from '@/components/notifications/NotificationBell'
import ThemeToggle from '@/components/common/ThemeToggle'
import UserMenu from '@/components/layout/UserMenu'
import useTranslation from '@/hooks/useTranslation'
import { NEW_SITE_PATH } from '@/utils/constants'

function AppHeader({ onOpenMobile }) {
  const { t } = useTranslation()

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
      </div>
      <div className="app-header__actions">
        {/* The one action the workspace always offers. It stays a link so it
            works with keyboard navigation and does not depend on a form. */}
        <Link to={NEW_SITE_PATH} className="btn btn--primary app-header__cta">
          <Plus size={16} aria-hidden="true" />
          <span className="app-header__cta-label">{t('appShell.newSiteCta')}</span>
        </Link>
        <LanguageSwitcher variant="compact" />
        <ThemeToggle />
        <CommandPaletteTrigger />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}

export default AppHeader
