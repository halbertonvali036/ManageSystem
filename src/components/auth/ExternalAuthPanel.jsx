import { useId } from 'react'
import { AlertCircle, PlugZap, ShieldCheck } from 'lucide-react'
import AuthDivider from '@/components/auth/AuthDivider'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import { getOAuthErrorDetails } from '@/models/externalAuth'
import useTranslation from '@/hooks/useTranslation'

/**
 * Shared external-auth block for the Login and Register cards.
 *
 * Google is offered as one option next to email/password — it is never the only
 * way in and never styled as the page's primary CTA. The action is disabled
 * while the backend OAuth flow does not exist, and the reason is stated in
 * plain language instead of being left as a dead control.
 *
 * `onStart` is expected to return the authorization URL produced by the backend.
 * Redirecting is the caller's job, so this component never navigates on its own.
 *
 * `children` is an optional extra sign-in method rendered above the divider, so
 * the "or continue with email" line always introduces the email form directly.
 */
function ExternalAuthPanel({
  intent = 'login',
  isAvailable = false,
  isPending = false,
  error = null,
  onStart,
  children,
}) {
  const noteId = useId()
  const { t } = useTranslation()
  const details = getOAuthErrorDetails(error)
  const hasError = Boolean(error)
  const isRegister = intent === 'register'

  return (
    <div className="auth-external">
      {hasError ? (
        <div className="form__error-area anim-shake" key={details.code} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>
            <strong className="auth-external__error-title">{details.title}</strong>{' '}
            {details.hint}
          </span>
        </div>
      ) : null}

      <GoogleAuthButton
        isPending={isPending}
        disabled={!isAvailable}
        onClick={onStart}
        noteId={noteId}
        title={
          isAvailable
            ? t(isRegister ? 'authProvider.registerTitle' : 'authProvider.loginTitle')
            : t('auth.common.googleUnavailable')
        }
      />

      {isAvailable ? (
        <p className="auth-external__note" id={noteId}>
          <ShieldCheck size={14} aria-hidden="true" />
          {t('authProvider.privacy')}
        </p>
      ) : (
        <p className="auth-external__note auth-external__note--pending" id={noteId} role="note">
          <PlugZap size={14} aria-hidden="true" />
          {t('authProvider.unavailable')}
        </p>
      )}

      {children}

      <AuthDivider />
    </div>
  )
}

export default ExternalAuthPanel
