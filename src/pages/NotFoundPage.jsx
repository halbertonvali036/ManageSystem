import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'
import useAuth from '@/hooks/useAuth'
import useTranslation from '@/hooks/useTranslation'
import { getRoleDashboardPath } from '@/utils/roles'

function NotFoundPage() {
  const { t } = useTranslation()
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
      title={t('audit.notFoundTitle')}
      description={t('audit.notFoundDescription')}
      className="status-page--standalone"
    >
      <button
        type="button"
        className="btn btn--outline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('audit.back')}
      </button>
      <Link to={dashboardPath} className="btn btn--primary">
        <Home size={16} aria-hidden="true" />
        {t(isAuthenticated ? 'audit.workspace' : 'audit.login')}
      </Link>
    </StatusPage>
  )
}

export default NotFoundPage
