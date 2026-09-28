import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'

const MIN_PASSWORD_LENGTH = 6

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }

const validate = (values) => {
  const errors = {}

  if (!values.currentPassword) {
    errors.currentPassword = 'Current password is required.'
  }

  if (!values.newPassword) {
    errors.newPassword = 'New password is required.'
  } else if (values.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'New password must be different from the current one.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.'
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  error,
  revealed,
  onChange,
  onBlur,
  onToggleReveal,
  disabled,
}) {
  const copy = useAccountCopy()
  const errorId = `${id}-error`

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={id}>
        {label}
      </label>
      <div className="form__input-wrapper">
        <input
          id={id}
          className={`form__input${error ? ' form__input--error' : ''}`}
          type={revealed ? 'text' : 'password'}
          name={id}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="form__toggle"
          onClick={onToggleReveal}
          aria-label={`${revealed ? copy('Hide') : copy('Show')} ${label.toLowerCase()}`}
          aria-pressed={revealed}
          disabled={disabled}
        >
          {revealed ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p className="form__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Password change form for the signed-in account.
 *
 * The form only ever calls `onSubmit` with the current and new password; the
 * parent decides whether the backend accepts the change. Submitting stays
 * disabled while no backend is connected, so nothing here reports a successful
 * password change on its own.
 */
function PasswordChangeCard({ canSubmit, isPending, formError, onSubmit }) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const [values, setValues] = useState(EMPTY_FORM)
  const [revealed, setRevealed] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [errors, setErrors] = useState({})
  const formId = useId()
  const fieldsDisabled = isPending
  const submitDisabled = isPending || !canSubmit

  const handleChange = (field) => (event) => {
    const nextValue = event.target.value
    setValues((previous) => ({ ...previous, [field]: nextValue }))
    setErrors((previous) => {
      if (!previous[field]) {
        return previous
      }
      const nextErrors = { ...previous }
      delete nextErrors[field]
      if (field === 'newPassword' && previous.confirmPassword && nextValue !== values.confirmPassword) {
        delete nextErrors.confirmPassword
      }
      return nextErrors
    })
  }

  const handleBlur = () => {
    setErrors((previous) => ({ ...previous, ...validate(values) }))
  }

  const handleToggleReveal = (field) => () => {
    setRevealed((previous) => ({ ...previous, [field]: !previous[field] }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || submitDisabled) {
      return
    }

    const changed = await onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })

    if (changed) {
      setValues(EMPTY_FORM)
      setErrors({})
    }
  }

  const actionTitle = canSubmit
    ? copy('The backend verifies the current password and applies its own policy')
    : copy('Available once the account security backend is connected')

  return (
    <SecuritySection
      id="password"
      className="password-section"
      eyebrow={t('accountPolish.credentials')}
      title={t('accountPolish.changePassword')}
      description={t('accountPolish.updatesThePasswordForTheAccountYouAreSigned')}
      icon={<KeyRound size={20} aria-hidden="true" />}
    >
      <form className="form password-form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="form__error-area" key={formError} role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}

        <PasswordField
          id={`${formId}-current-password`}
          label={t('accountPolish.currentPassword')}
          autoComplete="current-password"
          value={values.currentPassword}
          error={errors.currentPassword}
          revealed={revealed.currentPassword}
          onChange={handleChange('currentPassword')}
          onBlur={handleBlur}
          onToggleReveal={handleToggleReveal('currentPassword')}
          disabled={fieldsDisabled}
        />

        <PasswordField
          id={`${formId}-new-password`}
          label={t('accountPolish.newPassword')}
          autoComplete="new-password"
          value={values.newPassword}
          error={errors.newPassword}
          revealed={revealed.newPassword}
          onChange={handleChange('newPassword')}
          onBlur={handleBlur}
          onToggleReveal={handleToggleReveal('newPassword')}
          disabled={fieldsDisabled}
        />

        <PasswordField
          id={`${formId}-confirm-password`}
          label={t('accountPolish.confirmNewPassword')}
          autoComplete="new-password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          revealed={revealed.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur}
          onToggleReveal={handleToggleReveal('confirmPassword')}
          disabled={fieldsDisabled}
        />

        <p className="form__hint" id={`${formId}-password-hint`}>
          {t('accountPolish.passwordHint', { count: MIN_PASSWORD_LENGTH })}
        </p>

        <div className="password-form__actions">
          <button
            type="submit"
            className="btn btn--primary btn--icon-left"
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
            title={actionTitle}
          >
            {isPending ? (
              <>
                <span className="spinner" aria-hidden="true" />{t('accountPolish.updatingHellip')}</>
            ) : (
              <>
                <KeyRound size={16} aria-hidden="true" />{t('accountPolish.updatePassword')}</>
            )}
          </button>
        </div>
      </form>

      {!canSubmit ? (
        <SecurityNotice tone="pending" title={t('accountPolish.integrationPending')}>{t('accountPolish.passwordChangesArePerformedByTheBackendUntilIt')}</SecurityNotice>
      ) : null}
    </SecuritySection>
  )
}

export default PasswordChangeCard
