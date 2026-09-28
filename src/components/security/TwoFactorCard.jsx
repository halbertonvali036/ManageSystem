import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { useId, useState } from 'react'
import { KeySquare, ShieldOff, Smartphone } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'
import SecurityStatusBadge from '@/components/security/SecurityStatusBadge'
import { formatSecurityDateTime, getTwoFactorMethodLabel } from '@/models/accountSecurity'

const SETUP_STEPS = [
  {
    key: 'secret',
    title: '1. Secret and QR code',
    text: 'The backend issues a short-lived shared secret and provisioning URI. The QR image is rendered from that value here — nothing is generated in the browser.',
  },
  {
    key: 'verify',
    title: '2. Confirm the code',
    text: 'The code from your authenticator app is sent to the backend, which validates it. This page never validates or stores a code.',
  },
  {
    key: 'recovery',
    title: '3. Recovery codes',
    text: 'Recovery codes are generated and shown once by the backend. None is displayed here until a real setup completes.',
  },
]

/**
 * Two-factor authentication foundation.
 *
 * No secret, provisioning URI, QR image, code or recovery code is ever produced
 * in the browser. The status badge reports only what the backend returned, and
 * every action is performed by the backend.
 */
function TwoFactorCard({
  status,
  method,
  enabledAt,
  recoveryCodesRemaining,
  canManageSecurity,
  pendingAction,
  onBeginSetup,
  onDisable,
}) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const codeId = useId()
  const isEnabled = status === 'enabled'
  const isPending = pendingAction === 'two-factor-setup' || pendingAction === 'two-factor-disable'
  const methodLabel = getTwoFactorMethodLabel(method)
  const enabledOn = formatSecurityDateTime(enabledAt)
  const actionsDisabled = !canManageSecurity || isPending

  return (
    <SecuritySection
      id="two-factor"
      className="twofactor-section"
      eyebrow={t('accountPolish.secondFactor')}
      title={t('accountPolish.twoFactorAuthentication')}
      description={t('accountPolish.anExtraStepAtSignInUsingACode')}
      icon={<KeySquare size={20} aria-hidden="true" />}
      action={<SecurityStatusBadge subject="twoFactor" value={status} />}
    >
      <div className="twofactor-section__row">
        <div className="twofactor-section__state">
          <p className="twofactor-section__label">{t('accountPolish.currentState')}</p>
          <p className="twofactor-section__value">
            {status ? (
              <>
                {methodLabel ?? (isEnabled ? copy('Second factor enabled') : copy('No method active'))}
                {enabledOn ? ` · since ${enabledOn}` : ''}
              </>
            ) : (
              copy('The backend has not reported a two-factor state.')
            )}
          </p>
          {isEnabled && recoveryCodesRemaining !== null ? (
            <p className="twofactor-section__note">
              {recoveryCodesRemaining} recovery code
              {recoveryCodesRemaining === 1 ? '' : 's'} remaining
            </p>
          ) : null}
        </div>

        <span className="twofactor-section__actions">
          {!isEnabled ? (
            <button
              type="button"
              className="btn btn--primary btn--icon-left"
              onClick={onBeginSetup}
              disabled={actionsDisabled}
              aria-disabled={actionsDisabled}
              title={
                canManageSecurity
                  ? copy('The backend issues the setup secret')
                  : copy('Available once the account security backend is connected')
              }
            >
              {pendingAction === 'two-factor-setup' ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <Smartphone size={16} aria-hidden="true" />
              )}
              {pendingAction === 'two-factor-setup' ? copy('Starting…') : copy('Set up authenticator app')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--outline btn--icon-left"
              onClick={() => onDisable(code)}
              disabled={actionsDisabled || !code}
              aria-disabled={actionsDisabled || !code}
              title={
                canManageSecurity
                  ? copy('Disabling two-factor requires a current code')
                  : copy('Available once the account security backend is connected')
              }
            >
              {pendingAction === 'two-factor-disable' ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <ShieldOff size={16} aria-hidden="true" />
              )}
              {pendingAction === 'two-factor-disable' ? copy('Disabling…') : copy('Disable two-factor')}
            </button>
          )}
        </span>
      </div>

      <div className="twofactor-section__setup">
        <p className="twofactor-section__setup-label">{t('accountPolish.authenticatorAppSetup')}</p>
        <ol className="twofactor-steps">
          {SETUP_STEPS.map((step, index) => (
            <li key={step.key} className="twofactor-step">
              <span className="twofactor-step__index" aria-hidden="true">
                {index + 1}
              </span>
              <div className="twofactor-step__body">
                <h3 className="twofactor-step__title">{copy(step.title)}</h3>
                <p className="twofactor-step__text">{copy(step.text)}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="twofactor-section__verify">
          <div className="form__field">
            <label className="form__label" htmlFor={codeId}>
              {isEnabled ? copy('Current authenticator code') : copy('Verification code')}
            </label>
            <input
              id={codeId}
              className="form__input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={12}
              placeholder={t('accountPolish.enterTheCodeFromYourApp')}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, ''))}
              disabled={!isEnabled || actionsDisabled}
            />
            <p className="form__hint">{t('accountPolish.aCodeIsOnlyNeededToTurnTwoFactor')}</p>
          </div>
        </div>
      </div>

      {!canManageSecurity ? (
        <SecurityNotice tone="pending" title={t('accountPolish.integrationPending')}>{t('accountPolish.twoFactorSetupVerificationAndRecoveryCodesAreBackend')}</SecurityNotice>
      ) : null}
    </SecuritySection>
  )
}

export default TwoFactorCard
