import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath, isAdminPath, isKnownRole, roleMatchesPortal } from '@/utils/roles'

function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !isKnownRole(user?.role)) {
    return <Navigate to={isAdminPath(location.pathname) ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />
  }

  if ((adminOnly && user?.role !== 'admin') || !roleMatchesPortal(user?.role, location.pathname)) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
