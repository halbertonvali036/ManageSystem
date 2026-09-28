import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { LogOut, MonitorSmartphone } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'
import { formatSecurityLastActive, formatSessionDevice } from '@/models/accountSecurity'

const UNKNOWN_DEVICE = 'Device not reported'

/**
 * Active sessions for the signed-in account.
 *
 * Read-only data: device, browser, location, IP and last-active values are
 * rendered only when the backend sends them. Revoking a session never removes a
 * row locally — the list refreshes from the backend after a confirmed change.
 */
function ActiveSessionsCard({
  sessions,
  canManageSecurity,
  hasOtherSessions,
  pendingAction,
  onRevokeSession,
  onRevokeOtherSessions,
}) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  return (
    <SecuritySection
      id="sessions"
      className="sessions-section"
      eyebrow={t('accountPolish.sessions')}
      title={t('accountPolish.activeSessions')}
      description={t('accountPolish.browsersAndDevicesCurrentlySignedInToThisAccount')}
      icon={<MonitorSmartphone size={20} aria-hidden="true" />}
      action={
        <button
          type="button"
          className="btn btn--outline btn--icon-left sessions-section__signout"
          onClick={onRevokeOtherSessions}
          disabled={!canManageSecurity || !hasOtherSessions}
          aria-disabled={!canManageSecurity || !hasOtherSessions}
          title={
            canManageSecurity
              ? copy('Sign out every other session')
              : copy('Available once the account security backend is connected')
          }
        >
          <LogOut size={16} aria-hidden="true" />{t('accountPolish.signOutOtherSessions')}</button>
      }
    >
      {sessions.length > 0 ? (
        <ul className="sessions-list">
          {sessions.map((session) => {
            const device = formatSessionDevice(session) ?? UNKNOWN_DEVICE
            const lastActive = formatSecurityLastActive(session.lastActiveAt)
            const isPendingRevoke = pendingAction === `session:${session.id}`

            return (
              <li
                key={session.id}
                className={`session-item${session.isCurrent ? ' session-item--current' : ''}`}
              >
                <span className="session-item__icon" aria-hidden="true">
                  <MonitorSmartphone size={18} />
                </span>
                <div className="session-item__identity">
                  <p className="session-item__label">
                    {device}
                    {session.isCurrent ? (
                      <span className="session-item__badge">{t('accountPolish.currentSession')}</span>
                    ) : null}
                  </p>
                  <p className="session-item__meta">
                    {session.location ? `${session.location} · ` : ''}
                    {session.ipAddress ? `IP ${session.ipAddress} · ` : ''}
                    {lastActive ? `Last active ${lastActive}` : copy('Last active not reported')}
                  </p>
                </div>
                <span className="session-item__actions">
                  <button
                    type="button"
                    className="btn session-item__action"
                    onClick={() => onRevokeSession(session.id)}
                    disabled={!canManageSecurity || isPendingRevoke}
                    aria-disabled={!canManageSecurity || isPendingRevoke}
                    title={
                      canManageSecurity
                        ? copy('Revoke this session')
                        : copy('Available once the account security backend is connected')
                    }
                  >
                    {isPendingRevoke ? copy('Revoking…') : copy('Revoke')}
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="security-empty">
          <h3 className="security-empty__title">{t('accountPolish.noSessionsReported')}</h3>
          <p className="security-empty__text">{t('accountPolish.activeSessionsAppearHereOnceTheBackendReportsThem')}</p>
        </div>
      )}

      {!canManageSecurity ? (
        <SecurityNotice tone="pending" title={t('accountPolish.integrationPending')}>{t('accountPolish.sessionRevocationIsPerformedByTheBackendWhichOwns')}</SecurityNotice>
      ) : null}
    </SecuritySection>
  )
}

export default ActiveSessionsCard
