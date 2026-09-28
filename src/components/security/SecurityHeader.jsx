import useTranslation from '@/hooks/useTranslation'
import CommandPaletteTrigger from '@/components/commandPalette/CommandPaletteTrigger'
import ThemeToggle from '@/components/common/ThemeToggle'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import UserMenu from '@/components/layout/UserMenu'
import NotificationBell from '@/components/notifications/NotificationBell'

/**
 * Header for the account-level security route.
 * Same shared controls as the portal headers, with an "Account" context pill
 * instead of a role pill and no sidebar toggle.
 */
function SecurityHeader() {
  const { t } = useTranslation()
  return (
    <header className="app-header">
      <div className="app-header__start">
        <span className="security-context">{t('accountPolish.account')}</span>
      </div>
      <div className="app-header__actions">
        <LanguageSwitcher variant="compact" />
        <ThemeToggle />
        <CommandPaletteTrigger />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}

export default SecurityHeader
