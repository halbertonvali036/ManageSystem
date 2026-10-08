import { Link, useLocation } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { findPageTitleKey, routeOwnsHeading } from '@/models/navigation'

/**
 * In-page heading and breadcrumb for the shared shell.
 *
 * The name of the current route is rendered in the topbar, so this component
 * exists for the page's own <h1> and the trail back to the portal. Titles come
 * from the same navigation model the sidebar and topbar use, so a route never
 * shows a name that is missing from the menu.
 */
function PageHeader() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  const titleKey = findPageTitleKey(pathname)
  const title = titleKey ? t(titleKey) : pathname
  const inAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const homePath = inAdmin ? '/admin' : '/workspaces'
  const isHome = pathname === homePath
  const ownsHeading = routeOwnsHeading(pathname)

  if (pathname.startsWith('/workspaces/') && ownsHeading) return null

  return (
    <div className="page-header">
      <p className="breadcrumb">
        {isHome ? (
          <span className="breadcrumb__current">{title}</span>
        ) : (
          <>
            <Link to={homePath} className="breadcrumb__link">
              {t(inAdmin ? 'admin.nav.overview' : 'workspace.breadcrumbHome')}
            </Link>
            <span className="breadcrumb__separator" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb__current">{title}</span>
          </>
        )}
      </p>
      {!ownsHeading && <h1 className="page-header__title">{title}</h1>}
    </div>
  )
}

export default PageHeader
