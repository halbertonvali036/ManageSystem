import useTranslation from '@/hooks/useTranslation'

/**
 * Visual separator between the provider action and the email form.
 *
 * Exposed as a separator with an accessible name so the two sign-in methods are
 * announced as distinct, while the visible rule lines are decorative.
 */
function AuthDivider({ label }) {
  const { t } = useTranslation()
  label = label ?? t('authProvider.emailDivider')
  return (
    <div className="auth-divider" role="separator" aria-label={label}>
      <span className="auth-divider__line" aria-hidden="true" />
      <span className="auth-divider__label">{label}</span>
      <span className="auth-divider__line" aria-hidden="true" />
    </div>
  )
}

export default AuthDivider
