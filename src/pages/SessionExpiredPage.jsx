import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import StatusPage from '@/components/common/StatusPage'

function SessionExpiredPage() {
  return (
    <StatusPage
      code="401"
      tone="neutral"
      icon={ShieldCheck}
      title="Session expired"
      description="Your session has ended for security. Please sign in again to continue."
      className="status-page--standalone"
    >
      <Link to="/login" className="btn btn--primary">
        Return to Login
      </Link>
    </StatusPage>
  )
}

export default SessionExpiredPage