import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'
import { SECURITY_PATH } from '@/utils/constants'

/**
 * Entry point to the Account & Security page.
 *
 * The real password, verification, session and two-factor surfaces live on
 * `/security`; this section only points there so the settings screen never
 * duplicates them.
 */
function SecuritySettingsSection() {
  return (
    <SettingsPlaceholder
      title="Account &amp; Security"
      status="Account page"
      text="Password changes, email verification, active sessions, two-factor setup and security activity for your own account are managed on the Account &amp; Security page."
      icon={<ShieldCheck size={16} aria-hidden="true" />}
      action={
        <Link
          to={SECURITY_PATH}
          className="btn btn--primary"
          aria-label="Open Account &amp; Security"
        >
          Open
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      }
    />
  )
}

export default SecuritySettingsSection
