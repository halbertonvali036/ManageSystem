import { Link } from 'react-router-dom'
import { Home, ShieldAlert } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'

function UnauthorizedPage() {
  const { user } = useAuth()
  const dashboardPath = getRoleDashboardPath(user?.role)

  return (
    <StatusPage
      code="403"
      tone="danger"
      icon={ShieldAlert}
      title="Access denied"
      description="Your account does not have permission to access this area. If you believe this is a mistake, please contact your administrator."
    >
      <Link to={dashboardPath} className="btn btn--primary">
        <Home size={16} aria-hidden="true" />
        Go to Dashboard
      </Link>
    </StatusPage>
  )
}

export default UnauthorizedPage