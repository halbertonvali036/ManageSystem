import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath, roleMatchesPortal } from '@/utils/roles'

function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!roleMatchesPortal(user?.role, location.pathname)) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute