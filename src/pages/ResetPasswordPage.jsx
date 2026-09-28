import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  show,
  onToggleShow,
  error,
  disabled,
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
          autoComplete="new-password"
          placeholder="Enter your new password"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="form__toggle"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          disabled={disabled}
        >
          {show ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? <p className="form__error" id={`${id}-error`}>{error}</p> : null}
    </div>
  )
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showFields, setShowFields] = useState({
    password: false,
    confirm: false,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  if (!token) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow anim-fade-up anim-delay-1">Account recovery</p>
          <h2 className="auth-card__title anim-fade-up anim-delay-1">
            Reset password
          </h2>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            We could not process your request.
          </p>
        </div>

        <div className="auth-state">
          <span
            className="auth-state__icon auth-state__icon--danger"
            aria-hidden="true"
          >
            <KeyRound size={22} />
          </span>
          <h3 className="auth-state__title">Invalid or missing token</h3>
          <p className="auth-state__text">
            This password reset link is invalid or has expired. Please request a
            new one to continue.
          </p>
          <Link to="/forgot-password" className="btn btn--primary auth-cta">
            Request a new link
          </Link>
          <div className="auth-back">
            <Link to="/login" className="form__link">
              <ArrowLeft size={15} aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const values = { password, confirm }

  const validate = (toValidate = values) => {
    const nextErrors = {}

    if (!toValidate.password) {
      nextErrors.password = 'New password is required.'
    } else if (toValidate.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    if (!toValidate.confirm) {
      nextErrors.confirm = 'Confirm your new password.'
    } else if (toValidate.confirm !== toValidate.password) {
      nextErrors.confirm = 'Passwords do not match.'
    }

    return nextErrors
  }

  const handleBlur = () => {
    setErrors((prev) => ({ ...prev, ...validate() }))
  }

  const toggleShow = (field) => () => {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsLoading(true)
    setFormError('')
    try {
      await authService.resetPassword(token, password)
      setSucceeded(true)
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setFormError(error.message)
      } else {
        setFormError('Unable to reset your password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (succeeded) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow anim-fade-up anim-delay-1">Account recovery</p>
          <h2 className="auth-card__title anim-fade-up anim-delay-1">
            Password reset
          </h2>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            Please sign in with your new password.
          </p>
        </div>

        <div className="auth-state" role="status">
          <span
            className="auth-state__icon auth-state__icon--success"
            aria-hidden="true"
          >
            <CheckCircle2 size={22} />
          </span>
          <h3 className="auth-state__title">Password updated successfully.</h3>
          <p className="auth-state__text">
            You can now sign in with your new password.
          </p>
          <Link to="/login" className="btn btn--primary auth-cta">
            <ArrowLeft size={16} className="auth-cta__icon" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">Account recovery</p>
        <h2 className="auth-card__title anim-fade-up anim-delay-1">
          Set a new password
        </h2>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          Choose a strong password you have not used before.
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            className="form__error-area anim-shake"
            key={formError}
            role="alert"
          >
            <AlertCircle size={16} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}

        <PasswordField
          id="reset-password"
          label="New Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={handleBlur}
          show={showFields.password}
          onToggleShow={toggleShow('password')}
          error={errors.password}
          disabled={isLoading}
        />

        <PasswordField
          id="reset-password-confirm"
          label="Confirm New Password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          onBlur={handleBlur}
          show={showFields.confirm}
          onToggleShow={toggleShow('confirm')}
          error={errors.confirm}
          disabled={isLoading}
        />

        <p className="form__hint">
          Use at least 6 characters. Your new password must be different from
          your previous passwords.
        </p>

        <button
          type="submit"
          className="btn btn--primary btn--block auth-cta"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Updating&hellip;
            </>
          ) : (
            <>
              <CheckCircle2
                size={16}
                className="auth-cta__icon"
                aria-hidden="true"
              />
              Reset password
            </>
          )}
        </button>

        <div className="auth-back">
          <Link to="/login" className="form__link">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ResetPasswordPage
