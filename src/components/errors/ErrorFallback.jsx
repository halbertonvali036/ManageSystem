import { Link } from 'react-router-dom'
import { Home, RefreshCw, TriangleAlert } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import { getRoleDashboardPath } from '@/utils/roles'

const isDev = import.meta.env.DEV

function ErrorFallback({ error, onRetry }) {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = isAuthenticated
    ? getRoleDashboardPath(user?.role)
    : '/login'

  return (
    <div className="route-error">
      <StatusPage
        tone="danger"
        icon={TriangleAlert}
        title={t('audit.errorTitle')}
        description={t('audit.errorDescription')}
      >
        <button
          type="button"
          className="btn btn--outline"
          onClick={onRetry}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {t('common.retry')}
        </button>
        <Link to={dashboardPath} className="btn btn--primary">
          <Home size={16} aria-hidden="true" />
          {t(isAuthenticated ? 'audit.workspace' : 'audit.login')}
        </Link>
      </StatusPage>

      {isDev && error ? (
        <details className="error-fallback__details">
          <summary>{t('audit.technicalDetails')}</summary>
          <pre>{error.message}</pre>
          {error.stack ? <pre>{error.stack}</pre> : null}
        </details>
      ) : null}
    </div>
  )
}

export default ErrorFallback
