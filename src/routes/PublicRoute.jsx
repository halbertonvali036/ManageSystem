import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'

function PublicRoute() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />
  }

  return <Outlet />
}

export default PublicRoute