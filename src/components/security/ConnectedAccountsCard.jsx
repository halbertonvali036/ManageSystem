import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { Link2, ShieldCheck, Unlink } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'
import GoogleMark from '@/components/auth/GoogleMark'
import {
  CONNECTED_ACCOUNT_STATUS,
  EXTERNAL_AUTH_PROVIDER,
  getExternalAuthProviderLabel,
} from '@/models/externalAuth'
import { formatSecurityDateTime } from '@/models/accountSecurity'

/**
 * Connected accounts section — Google account-linking readiness.
 *
 * This is UX only. The connection state is whatever the backend reported; the
 * connect action asks the backend to start a re-authenticated linking flow and
 * never links, merges or verifies an address on its own. A Google account can
 * only be attached to the account that is already signed in, which is why no
 * email field is offered here.
 */
function ConnectedAccountsCard({
  accounts = [],
  isAvailable = false,
  pendingProvider = null,
  onConnect,
  onDisconnect,
}) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const google = accounts.find(
    (account) => account.provider === EXTERNAL_AUTH_PROVIDER.GOOGLE,
  )
  const isConnected = google?.status === CONNECTED_ACCOUNT_STATUS.CONNECTED
  const providerLabel = getExternalAuthProviderLabel(EXTERNAL_AUTH_PROVIDER.GOOGLE)
  const isPending = pendingProvider === EXTERNAL_AUTH_PROVIDER.GOOGLE
  const canConnect = isAvailable && typeof onConnect === 'function'
  const canDisconnect = isAvailable && typeof onDisconnect === 'function'
  const connectedOn = formatSecurityDateTime(google?.connectedAt)
  const providerEmail = google?.email ?? null

  return (
    <SecuritySection
      id="connected-accounts"
      className="connected-accounts-section"
      eyebrow={t('accountPolish.signInMethods')}
      title={t('accountPolish.connectedAccounts')}
      description={t('accountPolish.useGoogleToSignInToTheAccountYou')}
      icon={<Link2 size={20} aria-hidden="true" />}
    >
      <div className="connected-account">
        <span className="connected-account__icon" aria-hidden="true">
          <GoogleMark size={20} />
        </span>

        <div className="connected-account__body">
          <p className="connected-account__label">{providerLabel}</p>
          {isConnected ? (
            <>
              <p className="connected-account__meta">
                {providerEmail ? (
                  <>{t('accountPolish.linkedTo')}<strong>{providerEmail}</strong>
                  </>
                ) : (
                  copy('Linked to this account')
                )}
                {connectedOn ? ` — ${t('accountPolish.connectedOn', { date: connectedOn })}` : ''}
              </p>
              <p className="connected-account__hint">{t('accountPolish.googleSignInWillOpenThisAccountYourEmail')}</p>
            </>
          ) : (
            <>
              <p className="connected-account__meta">{t('accountPolish.notConnectedLinkGoogleSoYouCanSignIn')}</p>
              <p className="connected-account__hint">{t('accountPolish.youWillConfirmTheConnectionOnGoogleAndOnly')}</p>
            </>
          )}
        </div>

        {isConnected ? (
          <div className="connected-account__actions">
            <button
              type="button"
              className="btn btn--outline btn--icon-left"
              onClick={() => onDisconnect(EXTERNAL_AUTH_PROVIDER.GOOGLE)}
              disabled={!canDisconnect || isPending}
              aria-disabled={!canDisconnect || isPending}
              title={
                canDisconnect
                  ? copy('Ask the backend to remove this Google connection')
                  : copy('Available once the backend manages account connections')
              }
            >
              <Unlink size={16} aria-hidden="true" />
              {isPending ? copy('Removing…') : copy('Remove')}
            </button>
          </div>
        ) : (
          <div className="connected-account__actions">
            <button
              type="button"
              className="btn btn--outline btn--icon-left"
              onClick={() => onConnect(EXTERNAL_AUTH_PROVIDER.GOOGLE)}
              disabled={!canConnect || isPending}
              aria-disabled={!canConnect || isPending}
              title={
                canConnect
                  ? copy('Continue on Google to link this account')
                  : copy('Available once the backend supports Google account linking')
              }
            >
              <Link2 size={16} aria-hidden="true" />
              {isPending ? copy('Connecting…') : t('accountPolish.connectProvider', { provider: providerLabel })}
            </button>
          </div>
        )}
      </div>

      {!isAvailable ? (
        <SecurityNotice tone="pending" title={t('accountPolish.notAvailableYet')}>{t('accountPolish.linkingIsABackendOperationTheConnectAndRemove')}</SecurityNotice>
      ) : (
        <SecurityNotice tone="info" title={t('accountPolish.youStayInControl')}>{t('accountPolish.linkingNeverChangesYourRoleYourEmailAddressOr')}</SecurityNotice>
      )}

      <p className="connected-accounts-section__footnote">
        <ShieldCheck size={14} aria-hidden="true" />{t('accountPolish.googleAccessTokensAreNeverStoredInThisBrowser')}</p>
    </SecuritySection>
  )
}

export default ConnectedAccountsCard
