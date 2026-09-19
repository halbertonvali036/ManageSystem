import { Link, useLocation } from 'react-router-dom'
import { SIDEBAR_ITEMS } from '@/utils/constants'

const FALLBACK_TITLES = {
  '/403': 'Access denied',
}

const findPageTitle = (pathname) => {
  const match = SIDEBAR_ITEMS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )
  if (match) {
    return match.label
  }
  return FALLBACK_TITLES[pathname] ?? 'Page'
}

function PageHeader() {
  const { pathname } = useLocation()
  const title = findPageTitle(pathname)

  return (
    <div className="page-header">
      <p className="breadcrumb">
        <Link to="/dashboard" className="breadcrumb__link">
          Home
        </Link>
        <span className="breadcrumb__separator" aria-hidden="true">
          /
        </span>
        <span className="breadcrumb__current">{title}</span>
      </p>
      <h1 className="page-header__title">{title}</h1>
    </div>
  )
}

export default PageHeader