import useTranslation from '@/hooks/useTranslation'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Mail, Send } from 'lucide-react'
import authService from '@/services/authService'
import {
  BackendNotConnectedError,
  getRequestErrorMessage,
  HTTP_STATUS,
} from '@/services/httpClient'
import { isValidEmail } from '@/utils/validation'

const FORGOT_PASSWORD_COOLDOWN_SECONDS = 60

const getEmailFieldMessage = (error) => {
  const messages = error?.data?.errors?.email
  if (!Array.isArray(messages)) {
    return ''
  }

  const firstMessage = messages.find(
    (message) => typeof message === 'string' && message.trim(),
  )
  return firstMessage ? firstMessage.trim() : ''
}

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef(0)
  const timerRef = useRef(null)
  const sendingRef = useRef(false)

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    },
    [],
  )

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

  const startCooldown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    cooldownRef.current = FORGOT_PASSWORD_COOLDOWN_SECONDS
    setCooldown(FORGOT_PASSWORD_COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      cooldownRef.current = Math.max(0, cooldownRef.current - 1)
      setCooldown(cooldownRef.current)
      if (cooldownRef.current === 0 && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, 1000)
  }

  const sendRecoveryEmail = async (address) => {
    if (sendingRef.current || cooldownRef.current > 0) {
      return
    }

    const nextErrors = validate({ email: address })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    sendingRef.current = true
    setIsLoading(true)
    setFormError('')
    try {
      await authService.forgotPassword(address.trim())
      setSucceeded(true)
      startCooldown()
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setFormError(t('recovery.recoveryUnavailable'))
      } else if (error?.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        const fieldMessage = getEmailFieldMessage(error)
        if (fieldMessage) {
          setErrors((prev) => ({ ...prev, emailMessage: fieldMessage }))
        } else {
          setFormError(
            getRequestErrorMessage(error) || t('recovery.recoveryFailed'),
          )
        }
      } else {
        setFormError(
          getRequestErrorMessage(error) || t('recovery.recoveryFailed'),
        )
      }
    } finally {
      sendingRef.current = false
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await sendRecoveryEmail(email)
  }

  const handleBlur = () => {
    setErrors(validate())
  }

  if (succeeded) {
    const resendLabel =
      cooldown > 0
        ? t('auth.forgot.resendIn', { seconds: cooldown })
        : t('auth.forgot.resend')

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

          <Link to="/login" className="btn btn--primary auth-cta">
            <ArrowLeft size={16} className="auth-cta__icon" aria-hidden="true" />
            {t('recovery.back')}
          </Link>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => sendRecoveryEmail(email)}
            disabled={cooldown > 0 || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                {t('auth.forgot.submitting')}
              </>
            ) : (
              <>
                <Send size={16} aria-hidden="true" />
                {resendLabel}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  const hasEmailError = Boolean(errors.email || errors.emailMessage)

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
            <span>{formError}</span>
          </div>
        ) : null}

        <div className="form__field">
          <label className="form__label" htmlFor="forgot-email">
            {t('auth.common.email')}
          </label>
          <input
            id="forgot-email"
            className={`form__input${hasEmailError ? ' form__input--error' : ''}`}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setErrors((prev) =>
                prev.emailMessage ? { ...prev, emailMessage: '' } : prev,
              )
            }}
            onBlur={handleBlur}
            disabled={isLoading}
            autoFocus
            aria-invalid={hasEmailError}
            aria-describedby={hasEmailError ? 'forgot-email-error' : 'forgot-email-hint'}
          />
          <p className="form__hint" id="forgot-email-hint">
            {t('recovery.recoveryHint')}
          </p>
          {hasEmailError ? (
            <p className="form__error" id="forgot-email-error">
              {errors.emailMessage ?? t(errors.email)}
            </p>
          ) : null}
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
