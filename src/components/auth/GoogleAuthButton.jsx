import GoogleMark from '@/components/auth/GoogleMark'
import useTranslation from '@/hooks/useTranslation'

/**
 * Professional "Continue with Google" action.
 *
 * A real button so it keeps keyboard access, focus order and native touch
 * behaviour. The provider name is written out, the official mark is used
 * unmodified, and the control never looks like the primary CTA of the page —
 * it sits alongside email/password as one option among others.
 *
 * `disabled` is driven by the real availability of the integration: while the
 * backend OAuth flow does not exist the action is disabled and explains why
 * through `title` plus the note rendered by the parent.
 */
function GoogleAuthButton({
  label,
  isPending = false,
  disabled = false,
  onClick,
  title,
  noteId,
  className,
}) {
  const isDisabled = disabled || isPending || typeof onClick !== 'function'
  const { t } = useTranslation()
  const pendingLabel = t('authProvider.connecting')

  return (
    <button
      type="button"
      className={`auth-provider${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isPending}
      aria-describedby={noteId}
      title={isPending ? t('authProvider.waiting') : title}
    >
      {isPending ? (
        <span className="spinner auth-provider__spinner" aria-hidden="true" />
      ) : (
        <GoogleMark />
      )}
      <span className="auth-provider__label">{isPending ? pendingLabel : label ?? t('auth.common.googleContinue')}</span>
    </button>
  )
}

export default GoogleAuthButton
