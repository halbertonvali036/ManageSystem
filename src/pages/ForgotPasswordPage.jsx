import useTranslation from '@/hooks/useTranslation'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Mail, Send } from 'lucide-react'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { isValidEmail } from '@/utils/validation'

function ForgotPasswordPage() {
  const { t } = useTranslation()
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
      nextErrors.email = 'auth.errors.emailRequired'
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'auth.errors.emailInvalid'
    }

    return nextErrors
  }

  const handleBlur = () => {
    setErrors(validate())
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
        setFormError('recovery.recoveryUnavailable')
      } else {
        setFormError('recovery.recoveryFailed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (succeeded) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.forgot.eyebrow')}</p>
          <h1 className="auth-card__title anim-fade-up anim-delay-1">
            {t('recovery.inbox')}
          </h1>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            {t('auth.forgot.sent')}
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
            {t('recovery.inbox')}
          </h3>
          <p className="auth-state__text">{t('auth.forgot.sent')}</p>
          <Link to="/login" className="btn btn--primary auth-cta">
            <ArrowLeft size={16} className="auth-cta__icon" aria-hidden="true" />
            {t('recovery.back')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.forgot.eyebrow')}</p>
        <h1 className="auth-card__title anim-fade-up anim-delay-1">
          {t('auth.forgot.title')}
        </h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {t('auth.forgot.subtitle')}
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
            <span>{t(formError)}</span>
          </div>
        ) : null}

        <div className="form__field">
          <label className="form__label" htmlFor="forgot-email">
            {t('auth.common.email')}
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
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'forgot-email-error' : 'forgot-email-hint'}
          />
          <p className="form__hint" id="forgot-email-hint">
            {t('recovery.recoveryHint')}
          </p>
          {errors.email ? <p className="form__error" id="forgot-email-error">{t(errors.email)}</p> : null}
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block auth-cta"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {t('auth.forgot.submitting')}
            </>
          ) : (
            <>
              <Send size={16} className="auth-cta__icon" aria-hidden="true" />
              {t('auth.forgot.submit')}
            </>
          )}
        </button>

        <div className="auth-back">
          <Link to="/login" className="form__link">
            <ArrowLeft size={15} aria-hidden="true" />
            {t('recovery.back')}
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
