import { Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import CommandPaletteTrigger from '@/components/commandPalette/CommandPaletteTrigger'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import ThemeToggle from '@/components/common/ThemeToggle'
import NotificationBell from '@/components/notifications/NotificationBell'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import { getRoleDashboardPath } from '@/utils/roles'

/**
 * The shared header for the account-level pages.
 *
 * One header for Account & Security, Plan & Billing and Support rather than one
 * per page: the controls a person needs here are the same everywhere, and three
 * copies would be three places for the account navigation to drift out of.
 *
 * Only what is not navigation lives here — the two display preferences and the
 * tools reached for constantly. The account destinations (profile, security,
 * billing, support, notifications, sign-out) are all in the left sidebar, so the
 * topbar stays a statement of where you are rather than a second copy of where
 * you can go. On a narrow screen the same sidebar becomes a drawer, so the menu
 * button is kept: it opens the one navigation that exists.
 */
function AccountHeader({ onOpenMobile }) {
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
        <span className="account-context">{t('appShell.section.account')}</span>
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

/**
 * Breadcrumb + page heading for the account-level pages.
 *
 * The breadcrumb returns to the signed-in role's own portal, because these pages
 * are account pages rather than part of platform administration. There is no
 * "back" action: each of them is reached from the sidebar, and the rail stays
 * visible beside them, so a back link would only repeat the way out.
 */
function AccountPageHeader({ titleKey, path }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isCurrent = pathname === path

  return (
    <div className="page-header">
      <p className="breadcrumb">
        <Link to={getRoleDashboardPath(user?.role)} className="breadcrumb__link">
          {t('workspace.breadcrumbHome')}
        </Link>
        <span className="breadcrumb__separator" aria-hidden="true">
          /
        </span>
        {isCurrent ? (
          <span className="breadcrumb__current">{t(titleKey)}</span>
        ) : (
          <span className="breadcrumb__current">{t('workspace.nav.account')}</span>
        )}
      </p>
      <h1 className="page-header__title">{t(titleKey)}</h1>
    </div>
  )
}

export { AccountHeader, AccountPageHeader }