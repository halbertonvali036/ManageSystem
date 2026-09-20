import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Mail, Send } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { isValidEmail } from '@/utils/validation'

// Neutral copy deliberately hides whether a specific account exists.
const NEUTRAL_SUCCESS =
  'If an account exists, recovery instructions have been sent.'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const values = { email }

  const validate = (toValidate = values) => {
    const nextErrors = {}
    const trimmedEmail = toValidate.email.trim()

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    return nextErrors
  }

  const handleBlur = () => {
    setErrors((prev) => ({ ...prev, ...validate() }))
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
      await authService.forgotPassword(email.trim())
      setSucceeded(true)
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setFormError(error.message)
      } else {
        setFormError('Unable to request recovery instructions. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (succeeded) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <BrandLogo size={44} />
          <h2 className="auth-card__title anim-fade-up anim-delay-1">
            Check your inbox
          </h2>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            Recovery link on its way
          </p>
        </div>

        <div className="auth-state" role="status">
          <span
            className="auth-state__icon auth-state__icon--success"
            aria-hidden="true"
          >
            <Mail size={22} />
          </span>
          <h3 className="auth-state__title">
            Recovery instructions sent
          </h3>
          <p className="auth-state__text">{NEUTRAL_SUCCESS}</p>
          <Link to="/login" className="btn btn--primary auth-cta">
            <ArrowLeft size={16} className="auth-cta__icon" aria-hidden="true" />
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <BrandLogo size={44} />
        <h2 className="auth-card__title anim-fade-up anim-delay-1">
          Forgot password?
        </h2>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          No worries — we will help you get back in.
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

        <div className="form__field">
          <label className="form__label" htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            className={`form__input${errors.email ? ' form__input--error' : ''}`}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={handleBlur}
            disabled={isLoading}
            autoFocus
          />
          <p className="form__hint">
            We will send recovery instructions to this address.
          </p>
          {errors.email ? <p className="form__error">{errors.email}</p> : null}
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block auth-cta"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending&hellip;
            </>
          ) : (
            <>
              <Send size={16} className="auth-cta__icon" aria-hidden="true" />
              Send recovery link
            </>
          )}
        </button>

        <div className="auth-back">
          <Link to="/login" className="form__link">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordPage