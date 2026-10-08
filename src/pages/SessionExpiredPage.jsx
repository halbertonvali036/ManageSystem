import useTranslation from '@/hooks/useTranslation'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'

function SessionExpiredPage() {
  const { t } = useTranslation()
  return (
    <StatusPage
      code="401"
      tone="neutral"
      icon={ShieldCheck}
      title={t('auth.sessionExpired.title')}
      description={t('auth.sessionExpired.description')}
      className="status-page--standalone"
    >
      <Link to="/login" className="btn btn--primary">
        {t('auth.sessionExpired.cta')}
      </Link>
    </StatusPage>
  )
}

export default SessionExpiredPage