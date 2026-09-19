import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

const EMPTY_VALUES = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const EMPTY_SHOWN = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  show,
  onToggleShow,
  error,
}) {
  return (
    <div className="form__field">
      <label className="form__label" htmlFor={id}>
        {label}
      </label>
      <div className="form__input-wrapper">
        <input
          id={id}
          className={`form__input${error ? ' form__input--error' : ''}`}
          type={show ? 'text' : 'password'}
          name={id}
          autoComplete={
            id === 'change-password-current'
              ? 'current-password'
              : 'new-password'
          }
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        <button
          type="button"
          className="form__toggle"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
        >
          {show ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? <p className="form__error">{error}</p> : null}
    </div>
  )
}

function StudentChangePasswordForm({
  onSubmit,
  submitError,
  isSubmitting,
  onCancel,
}) {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [showFields, setShowFields] = useState(EMPTY_SHOWN)
  const [errors, setErrors] = useState({})

  const validate = (toValidate = values) => {
    const nextErrors = {}

    if (!toValidate.currentPassword) {
      nextErrors.currentPassword = 'Current password is required.'
    }

    if (!toValidate.newPassword) {
      nextErrors.newPassword = 'New password is required.'
    } else if (toValidate.newPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters.'
    }

    if (!toValidate.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.'
    } else if (toValidate.confirmPassword !== toValidate.newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const setField = (field) => (event) => {
    const nextValue = event.target.value

    setValues((prev) => ({ ...prev, [field]: nextValue }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))

    if (field === 'newPassword' && values.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const handleBlur = () => {
    setErrors((prev) => ({ ...prev, ...validate() }))
  }

  const toggleShow = (field) => () => {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <PasswordField
        id="change-password-current"
        label="Current Password"
        value={values.currentPassword}
        onChange={setField('currentPassword')}
        onBlur={handleBlur}
        show={showFields.currentPassword}
        onToggleShow={toggleShow('currentPassword')}
        error={errors.currentPassword}
      />

      <PasswordField
        id="change-password-new"
        label="New Password"
        value={values.newPassword}
        onChange={setField('newPassword')}
        onBlur={handleBlur}
        show={showFields.newPassword}
        onToggleShow={toggleShow('newPassword')}
        error={errors.newPassword}
      />

      <PasswordField
        id="change-password-confirm"
        label="Confirm New Password"
        value={values.confirmPassword}
        onChange={setField('confirmPassword')}
        onBlur={handleBlur}
        show={showFields.confirmPassword}
        onToggleShow={toggleShow('confirmPassword')}
        error={errors.confirmPassword}
      />

      <p className="form__hint">
        Use at least 6 characters. Your new password must be different from
        your previous passwords.
      </p>

      <div className="student-form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Changing&hellip;
            </>
          ) : (
            <>
              <KeyRound size={16} aria-hidden="true" />
              Change Password
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default StudentChangePasswordForm