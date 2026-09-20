import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'

function NotFoundPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const dashboardPath = isAuthenticated
    ? getRoleDashboardPath(user?.role)
    : '/login'

  return (
    <StatusPage
      code="404"
      tone="neutral"
      icon={Compass}
      title="Page not found"
      description="The page you are looking for does not exist or may have been moved. Check the address or head back to a page you know."
      className="status-page--standalone"
    >
      <button
        type="button"
        className="btn btn--outline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Go Back
      </button>
      <Link to={dashboardPath} className="btn btn--primary">
        <Home size={16} aria-hidden="true" />
        {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
      </Link>
    </StatusPage>
  )
}

export default NotFoundPage