import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import {
  KeyRound,
  ListChecks,
  LogIn,
  LogOut,
  MailCheck,
  MonitorSmartphone,
  ShieldOff,
  ShieldQuestion,
} from 'lucide-react'
import SecuritySection from '@/components/security/SecuritySection'
import {
  SECURITY_EVENT,
  formatSecurityLastActive,
  getSecurityEventLabel,
  getSecurityEventType,
} from '@/models/accountSecurity'

const EVENT_ICONS = {
  [SECURITY_EVENT.LOGIN]: LogIn,
  [SECURITY_EVENT.LOGOUT]: LogOut,
  [SECURITY_EVENT.PASSWORD_CHANGED]: KeyRound,
  [SECURITY_EVENT.PASSWORD_CHANGE_FAILED]: ShieldQuestion,
  [SECURITY_EVENT.EMAIL_VERIFIED]: MailCheck,
  [SECURITY_EVENT.VERIFICATION_EMAIL_SENT]: MailCheck,
  [SECURITY_EVENT.SESSION_REVOKED]: MonitorSmartphone,
  [SECURITY_EVENT.TWO_FACTOR_ENABLED]: ShieldQuestion,
  [SECURITY_EVENT.TWO_FACTOR_DISABLED]: ShieldOff,
  [SECURITY_EVENT.RECOVERY_REQUESTED]: KeyRound,
}

/**
 * Security activity for the signed-in account.
 *
 * Read-only history reported by the backend — sign-ins, password changes,
 * session revocations and two-factor changes. No event is ever created, seeded
 * or inferred in the browser.
 */
function SecurityActivityCard({ events }) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  return (
    <SecuritySection
      id="security-activity"
      className="activity-section"
      eyebrow={t('accountPolish.history')}
      title={t('accountPolish.securityActivity')}
      description={t('accountPolish.recentSecurityEventsRecordedForThisAccount')}
      icon={<ListChecks size={20} aria-hidden="true" />}
    >
      {events.length > 0 ? (
        <ul className="activity-list">
          {events.map((event) => {
            const type = getSecurityEventType(event.type)
            const Icon = EVENT_ICONS[type] ?? ListChecks
            const occurred = formatSecurityLastActive(event.occurredAt)

            return (
              <li key={event.id} className="activity-item">
                <span className="activity-item__icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <div className="activity-item__body">
                  <p className="activity-item__label">{getSecurityEventLabel(type)}</p>
                  <p className="activity-item__meta">
                    {[
                      event.device ?? null,
                      event.location ?? null,
                      event.ipAddress ? `IP ${event.ipAddress}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || copy('No device details reported')}
                  </p>
                  {event.detail ? <p className="activity-item__detail">{event.detail}</p> : null}
                </div>
                <span className="activity-item__time">{occurred ?? copy('Time not reported')}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="security-empty">
          <h3 className="security-empty__title">{t('accountPolish.noSecurityActivityReported')}</h3>
          <p className="security-empty__text">{t('accountPolish.signInsPasswordChangesSessionRevocationsAndTwoFactor')}</p>
        </div>
      )}
    </SecuritySection>
  )
}

export default SecurityActivityCard
