import {
  CreditCard,
  LifeBuoy,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import {
  BILLING_PATH,
  SECURITY_PATH,
  SUPPORT_ANCHOR,
} from '@/utils/constants'
import { getRoleProfilePath, ROLE_NAMES } from '@/utils/roles'

function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const displayName = user?.name?.trim() || t('userMenu.defaultName')

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const profilePath = getRoleProfilePath(user?.role)
  // Legacy academic role names are internal labels; the public product only
  // ever shows a generic account role.
  const roleLabel = user?.role === 'user'
    ? t('userMenu.accountRole')
    : (ROLE_NAMES[user?.role] ?? user?.role)

  const profileLabel = t('userMenu.profileFor', { name: displayName })

  return (
    <div className="user-menu" data-role={user?.role}>
      <Link
        to={profilePath}
        className="user-menu__identity"
        aria-label={profileLabel}
        title={profileLabel}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="user-menu__info">
          <span className="user-menu__name">{displayName}</span>
          <span className="user-menu__meta">
            <span className="user-menu__role">{roleLabel}</span>
            {user?.email ? (
              <span className="user-menu__email">{user.email}</span>
            ) : null}
          </span>
        </span>
      </Link>
      <span className="user-menu__divider" aria-hidden="true" />
      <div className="user-menu__actions">
        <Link
          to={BILLING_PATH}
          className="user-menu__action user-menu__action--billing"
          aria-label={t('userMenu.billing')}
          title={t('userMenu.billing')}
        >
          <CreditCard size={16} aria-hidden="true" />
          <span className="user-menu__action-label">{t('userMenu.billing')}</span>
        </Link>
        <Link
          to={SECURITY_PATH}
          className="user-menu__action user-menu__action--security"
          aria-label={t('userMenu.security')}
          title={t('userMenu.security')}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          <span className="user-menu__action-label">{t('userMenu.security')}</span>
        </Link>
        <Link
          to={SUPPORT_ANCHOR}
          className="user-menu__action user-menu__action--support"
          aria-label={t('userMenu.support')}
          title={t('userMenu.support')}
        >
          <LifeBuoy size={16} aria-hidden="true" />
          <span className="user-menu__action-label">{t('userMenu.supportShort')}</span>
        </Link>
        <button
          type="button"
          className="user-menu__action user-menu__action--logout"
          onClick={handleLogout}
          aria-label={t('userMenu.logout')}
          title={t('userMenu.logout')}
        >
          <LogOut size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default UserMenu
