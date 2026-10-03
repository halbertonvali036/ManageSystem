import useTranslation from '@/hooks/useTranslation'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Card from '@/components/common/Card'
import AccountSummaryCard from '@/components/security/AccountSummaryCard'
import ActiveSessionsCard from '@/components/security/ActiveSessionsCard'
import ConnectedAccountsCard from '@/components/security/ConnectedAccountsCard'
import EmailVerificationCard from '@/components/security/EmailVerificationCard'
import NotificationPreferencesCard from '@/components/security/NotificationPreferencesCard'
import PasswordChangeCard from '@/components/security/PasswordChangeCard'
import QrLoginCard from '@/components/security/QrLoginCard'
import SecurityActivityCard from '@/components/security/SecurityActivityCard'
import SecurityNotice from '@/components/security/SecurityNotice'
import TwoFactorCard from '@/components/security/TwoFactorCard'
import useAccountSecurity from '@/hooks/useAccountSecurity'
import useAuth from '@/hooks/useAuth'
import useExternalAuth from '@/hooks/useExternalAuth'
import { TWO_FACTOR_STATUS } from '@/models/accountSecurity'
import {
  EXTERNAL_AUTH_INTENT,
  EXTERNAL_AUTH_PROVIDER,
  getOAuthErrorDetails,
} from '@/models/externalAuth'

const resolveTwoFactorStatus = (enabled) => {
  if (enabled === true) {
    return TWO_FACTOR_STATUS.ENABLED
  }
  if (enabled === false) {
    return TWO_FACTOR_STATUS.DISABLED
  }
  return null
}

/**
 * Account & Security — account page for the authenticated user.
 *
 * Every value shown here comes from the authenticated session or from
 * `useAccountSecurity`. While the account/security backend is absent the hook
 * resolves safe empty values, so the page renders explicit unavailable and
 * empty states. No verification, revocation, two-factor change or QR pairing is
 * ever fabricated.
 *
 * Support lives on its own page. Asking the account team for help is a different
 * job from hardening the account, and putting it here made a long page longer
 * while giving the sidebar no destination it could link to.
 */
function SecurityPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { hash } = useLocation()
  const externalAuth = useExternalAuth()
  const {
    overview,
    sessions,
    events,
    canManageSecurity,
    hasOtherSessions,
    isLoading,
    loadError,
    backendUnavailable,
    actionError,
    errorAction,
    pendingAction,
    refetch,
    changePassword,
    resendVerification,
    revokeSession,
    revokeOtherSessions,
    beginTwoFactorSetup,
    disableTwoFactor,
  } = useAccountSecurity()

  useEffect(() => {
    if (!hash || isLoading) {
      return
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash, isLoading])

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />{t('accountPolish.loadingAccountSecurityHellip')}</div>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <div className="table-state table-state--error">
          <h2 className="table-state__title">{t('accountPolish.failedToLoadAccountSecurity')}</h2>
          <p className="table-state__text">{loadError}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>{t('accountPolish.retry')}</button>
        </div>
      </Card>
    )
  }

  const twoFactorStatus = resolveTwoFactorStatus(overview?.twoFactorEnabled)
  const passwordError = errorAction === 'password' ? actionError : null
  const linkingError = externalAuth.error
    ? getOAuthErrorDetails(externalAuth.error)
    : null
  const pageError = actionError && errorAction !== 'password' ? actionError : null

  return (
    <div className="account-security-page">
      <p className="page-description">{t('accountPolish.reviewYourAccountDetailsUpdateYourPasswordCheckWhere')}</p>

      {backendUnavailable ? (
        <SecurityNotice tone="pending" title={t('accountPolish.securityBackendNotConnected')}>{t('accountPolish.accountStatusSessionsVerificationAndTwoFactorActionsAre')}</SecurityNotice>
      ) : null}

      {pageError || linkingError ? (
        <div className="form__error-area" key={pageError ?? linkingError.code} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>
            {pageError ??
              `${linkingError.title} ${linkingError.hint}`}
          </span>
        </div>
      ) : null}

      <AccountSummaryCard user={user} overview={overview} />

      <ConnectedAccountsCard
        accounts={overview?.connectedAccounts ?? []}
        isAvailable={externalAuth.isAvailable}
        pendingProvider={
          externalAuth.isPending ? EXTERNAL_AUTH_PROVIDER.GOOGLE : null
        }
        onConnect={() =>
          externalAuth.begin({
            intent: EXTERNAL_AUTH_INTENT.LINK,
            returnTo: '/security#connected-accounts',
          })
        }
      />

      <div className="account-security-columns">
        <PasswordChangeCard
          canSubmit={canManageSecurity}
          isPending={pendingAction === 'password'}
          formError={passwordError}
          onSubmit={changePassword}
        />

        <EmailVerificationCard
          email={user?.email ?? overview?.email ?? null}
          verified={overview?.emailVerified ?? null}
          verifiedAt={overview?.emailVerifiedAt ?? null}
          canSubmit={canManageSecurity && overview?.emailVerified === false}
          isPending={pendingAction === 'verification'}
          onResend={resendVerification}
        />
      </div>

      <ActiveSessionsCard
        sessions={sessions}
        canManageSecurity={canManageSecurity}
        hasOtherSessions={hasOtherSessions}
        pendingAction={pendingAction}
        onRevokeSession={revokeSession}
        onRevokeOtherSessions={revokeOtherSessions}
      />

      <div className="account-security-columns">
        <TwoFactorCard
          status={twoFactorStatus}
          method={overview?.twoFactorMethod ?? null}
          enabledAt={overview?.twoFactorEnabledAt ?? null}
          recoveryCodesRemaining={overview?.recoveryCodesRemaining ?? null}
          canManageSecurity={canManageSecurity}
          pendingAction={pendingAction}
          onBeginSetup={beginTwoFactorSetup}
          onDisable={disableTwoFactor}
        />

        <QrLoginCard />
      </div>

      <NotificationPreferencesCard />

      <SecurityActivityCard events={events} />
    </div>
  )
}

export default SecurityPage
