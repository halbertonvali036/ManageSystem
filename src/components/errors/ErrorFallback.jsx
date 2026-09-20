import { Link } from 'react-router-dom'
import { Home, RefreshCw, TriangleAlert } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'

const isDev = import.meta.env.DEV

function ErrorFallback({ error, onRetry }) {
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = isAuthenticated
    ? getRoleDashboardPath(user?.role)
    : '/login'

  return (
    <div className="route-error">
      <StatusPage
        tone="danger"
        icon={TriangleAlert}
        title="Something went wrong"
        description="An unexpected error occurred while loading this page. You can try again or return to your dashboard."
      >
        <button
          type="button"
          className="btn btn--outline"
          onClick={onRetry}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Try Again
        </button>
        <Link to={dashboardPath} className="btn btn--primary">
          <Home size={16} aria-hidden="true" />
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Link>
      </StatusPage>

      {isDev && error ? (
        <details className="error-fallback__details">
          <summary>Technical details</summary>
          <pre>{error.message}</pre>
          {error.stack ? <pre>{error.stack}</pre> : null}
        </details>
      ) : null}
    </div>
  )
}

export default ErrorFallback