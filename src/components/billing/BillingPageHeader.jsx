import useTranslation from '@/hooks/useTranslation'
import { Link, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'


/**
 * Page header for the account-level billing route.
 * The breadcrumb returns to the signed-in role's own portal, because billing
 * is an account page rather than an academic-management screen.
 */
function BillingPageHeader() {
  const { t } = useTranslation()
  const BILLING_TITLE = t('workspace.nav.billing')
  const { pathname } = useLocation()
  const { user } = useAuth()
  const isBillingRoute = pathname === '/billing' || pathname.startsWith('/billing/')

  return (
    <div className="page-header">
      <p className="breadcrumb">
        <Link to={getRoleDashboardPath(user?.role)} className="breadcrumb__link">
          {t('workspace.breadcrumbHome')}
        </Link>
        <span className="breadcrumb__separator" aria-hidden="true">
          /
        </span>
        {isBillingRoute ? (
          <span className="breadcrumb__current">{BILLING_TITLE}</span>
        ) : (
          <span className="breadcrumb__current">{t('workspace.nav.account')}</span>
        )}
      </p>
      <h1 className="page-header__title">{BILLING_TITLE}</h1>
    </div>
  )
}

export default BillingPageHeader
