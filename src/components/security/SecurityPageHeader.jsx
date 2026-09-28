import useTranslation from '@/hooks/useTranslation'
import { Link, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'
import { SECURITY_PATH } from '@/utils/constants'


/**
 * Page header for the account-level security route.
 * The breadcrumb returns to the signed-in role's own portal, because account
 * security is an account page rather than an academic-management screen.
 */
function SecurityPageHeader() {
  const { t } = useTranslation()
  const SECURITY_TITLE = t('workspace.nav.security')
  const { pathname } = useLocation()
  const { user } = useAuth()
  const isSecurityRoute = pathname === SECURITY_PATH || pathname.startsWith(`${SECURITY_PATH}/`)

  return (
    <div className="page-header">
      <p className="breadcrumb">
        <Link to={getRoleDashboardPath(user?.role)} className="breadcrumb__link">
          {t('workspace.breadcrumbHome')}
        </Link>
        <span className="breadcrumb__separator" aria-hidden="true">
          /
        </span>
        {isSecurityRoute ? (
          <span className="breadcrumb__current">{SECURITY_TITLE}</span>
        ) : (
          <span className="breadcrumb__current">{t('workspace.nav.account')}</span>
        )}
      </p>
      <h1 className="page-header__title">{SECURITY_TITLE}</h1>
    </div>
  )
}

export default SecurityPageHeader
