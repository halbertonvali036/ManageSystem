import useTranslation from '@/hooks/useTranslation'
import { Link } from 'react-router-dom'
import { Home, ShieldAlert } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'
import useAuth from '@/hooks/useAuth'
import { getRoleDashboardPath } from '@/utils/roles'

function UnauthorizedPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const dashboardPath = getRoleDashboardPath(user?.role)

  return (
    <StatusPage
      code="403"
      tone="danger"
      icon={ShieldAlert}
      title={t('recovery.denied')}
      description={t('recovery.deniedText')}
    >
      <Link to={dashboardPath} className="btn btn--primary">
        <Home size={16} aria-hidden="true" />
        {t('recovery.home')}
      </Link>
    </StatusPage>
  )
}

export default UnauthorizedPage