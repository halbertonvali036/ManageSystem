import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { MailCheck, Send } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'
import SecurityStatusBadge from '@/components/security/SecurityStatusBadge'
import { formatSecurityDateTime } from '@/models/accountSecurity'

/**
 * Email verification status for the signed-in account.
 *
 * The badge only ever reflects what the backend reported. Resend asks the
 * backend to send a new message and reports the outcome it returns — it never
 * claims an email was sent.
 */
function EmailVerificationCard({ email, verified, verifiedAt, canSubmit, isPending, onResend }) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const verifiedOn = formatSecurityDateTime(verifiedAt)
  const isVerified = verified === true
  const status = isVerified ? 'verified' : verified === false ? 'unverified' : null
  const resendDisabled = !canSubmit || isPending
  const resendTitle = isVerified
    ? copy('This address is already verified')
    : canSubmit
      ? copy('Ask the backend to send a new verification email')
      : copy('Available once the account security backend is connected')

  return (
    <SecuritySection
      id="email-verification"
      className="verification-section"
      eyebrow={t('accountPolish.email')}
      title={t('accountPolish.emailVerification')}
      description={t('accountPolish.confirmsThatThisAccountAddressCanReceiveSignIn')}
      icon={<MailCheck size={20} aria-hidden="true" />}
      action={
        <SecurityStatusBadge
          subject="verification"
          value={verified === null ? null : status}
        />
      }
    >
      <div className="verification-section__row">
        <div className="verification-section__address">
          <p className="verification-section__label">{t('accountPolish.accountAddress')}</p>
          <p className="verification-section__value">{email ?? '—'}</p>
          {isVerified && verifiedOn ? (
            <p className="verification-section__note">Verified on {verifiedOn}</p>
          ) : null}
        </div>

        <button
          type="button"
          className="btn btn--outline btn--icon-left verification-section__resend"
          onClick={onResend}
          disabled={resendDisabled}
          aria-disabled={resendDisabled}
          title={resendTitle}
        >
          {isPending ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
          {isPending ? copy('Sending…') : copy('Resend verification email')}
        </button>
      </div>

      {verified === null ? (
        <SecurityNotice tone="pending" title={t('accountPolish.verificationStatusUnavailable')}>{t('accountPolish.theBackendHasNotReportedWhetherThisAddressIs')}</SecurityNotice>
      ) : null}

      {!isVerified && canSubmit ? (
        <SecurityNotice tone="info" title={t('accountPolish.checkYourInbox')}>{t('accountPolish.theVerificationLinkIsSentByTheBackendTo')}</SecurityNotice>
      ) : null}
    </SecuritySection>
  )
}

export default EmailVerificationCard
