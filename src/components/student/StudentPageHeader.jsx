import { Link, useLocation } from 'react-router-dom'
import { STUDENT_NAV_ITEMS } from '@/utils/studentConstants'

const findPageTitle = (pathname) => {
  const match = STUDENT_NAV_ITEMS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )
  if (match) {
    return match.label
  }
  return 'Student'
}

function StudentPageHeader() {
  const { pathname } = useLocation()
  const title = findPageTitle(pathname)

  return (
    <div className="page-header">
      <p className="breadcrumb">
        <Link to="/student/dashboard" className="breadcrumb__link">
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

export default StudentPageHeader