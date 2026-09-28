import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { CalendarClock, Mail, ShieldCheck, UserCircle, Users } from 'lucide-react'
import SecuritySection from '@/components/security/SecuritySection'
import SecurityStatusBadge from '@/components/security/SecurityStatusBadge'
import { ROLE_NAMES } from '@/utils/roles'
import { formatSecurityDateTime } from '@/models/accountSecurity'

const UNAVAILABLE_LABEL = 'Unavailable'
const EM_DASH = '—'

/**
 * Compact account summary for the signed-in user.
 *
 * Name, email and role come from the authenticated session; account status,
 * email verification and last sign-in come from the backend. Any value the
 * backend has not reported renders as an em dash or an unavailable chip.
 */
function AccountSummaryCard({ user, overview }) {
  const { t } = useTranslation()
  const copy = useAccountCopy()
  const name = user?.name ?? overview?.displayName ?? null
  const email = user?.email ?? overview?.email ?? null
  const roleLabel = user?.role === 'user' ? t('userMenu.accountRole') : user?.role ? (ROLE_NAMES[user.role] ?? user.role) : null
  const lastSignIn = formatSecurityDateTime(overview?.lastSignInAt)
  const accountStatus = overview?.accountStatus ?? null
  const emailVerified = overview?.emailVerified ?? null

  return (
    <SecuritySection
      id="account-summary"
      className="account-summary"
      eyebrow={t('accountPolish.account')}
      title={t('accountPolish.accountSummary')}
      description={t('accountPolish.theIdentityAndAccountStateThisSessionIsSigned')}
      icon={<UserCircle size={20} aria-hidden="true" />}
    >
      <div className="account-summary__grid">
        <div className="account-summary__identity">
          <span className="account-summary__avatar" aria-hidden="true">
            <UserCircle size={26} />
          </span>
          <div className="account-summary__identity-text">
            <p className="account-summary__name">{name ?? copy(UNAVAILABLE_LABEL)}</p>
            <p className="account-summary__email">
              <Mail size={13} aria-hidden="true" />
              {email ?? EM_DASH}
            </p>
          </div>
        </div>

        <dl className="account-summary__fields">
          <div className="account-summary__field">
            <dt className="account-summary__label">
              <Users size={13} aria-hidden="true" />{t('accountPolish.role')}</dt>
            <dd className="account-summary__value">{roleLabel ?? EM_DASH}</dd>
          </div>

          <div className="account-summary__field">
            <dt className="account-summary__label">
              <ShieldCheck size={13} aria-hidden="true" />{t('accountPolish.accountStatus')}</dt>
            <dd className="account-summary__value">
              {accountStatus ? (
                <SecurityStatusBadge subject="account" value={accountStatus} />
              ) : (
                <span className="account-summary__unavailable">{copy(UNAVAILABLE_LABEL)}</span>
              )}
            </dd>
          </div>

          <div className="account-summary__field">
            <dt className="account-summary__label">
              <Mail size={13} aria-hidden="true" />{t('accountPolish.emailVerification')}</dt>
            <dd className="account-summary__value">
              {emailVerified === null ? (
                <span className="account-summary__unavailable">{copy(UNAVAILABLE_LABEL)}</span>
              ) : (
                <SecurityStatusBadge subject="verification" value={emailVerified} />
              )}
            </dd>
          </div>

          <div className="account-summary__field">
            <dt className="account-summary__label">
              <CalendarClock size={13} aria-hidden="true" />{t('accountPolish.lastSignIn')}</dt>
            <dd className="account-summary__value">
              {lastSignIn ?? (
                <span className="account-summary__unavailable">{copy(UNAVAILABLE_LABEL)}</span>
              )}
              {lastSignIn && overview?.lastSignInDevice ? (
                <span className="account-summary__hint">{overview.lastSignInDevice}</span>
              ) : null}
            </dd>
          </div>
        </dl>
      </div>

      <p className="account-summary__foot-note">{t('accountPolish.onlyTheBackendCanReportAccountStateForThis')}</p>
    </SecuritySection>
  )
}

export default AccountSummaryCard
