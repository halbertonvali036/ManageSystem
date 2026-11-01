import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  LogIn,
  Mail,
  MailCheck,
} from 'lucide-react'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'
import useTranslation from '@/hooks/useTranslation'
import useVerificationResend from '@/hooks/useVerificationResend'
import { isValidEmail } from '@/utils/validation'

/**
 * Public email-verification landing page.
 *
 * The token arrives in the query string. It is read into state before the URL
 * is cleaned with a replace navigation, so removing it cannot lose the value
 * that the request needs. `startedRef` makes the request idempotent under React
 * StrictMode's double effect invocation: exactly one verify call is sent.
 */
function VerifyEmailPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const [token] = useState(
    () => new URLSearchParams(location.search).get('token') ?? '',
  )
  const [email, setEmail] = useState(
    () => new URLSearchParams(location.search).get('email') ?? '',
  )
  const [status, setStatus] = useState(token ? 'verifying' : 'missing')
  const [errorKey, setErrorKey] = useState('')
  const [emailError, setEmailError] = useState('')
  const startedRef = useRef(false)
  const verificationResend = useVerificationResend()

  // Read the token first (above), then remove it from the address bar so it
  // does not linger in history or get copied into a referrer.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!params.has('token')) {
      return
    }
    params.delete('token')
    const search = params.toString()
    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : '',
        hash: location.hash,
      },
      { replace: true },
    )
  }, [location.hash, location.pathname, location.search, navigate])

  // Verification links should never leak their token to third-party hosts.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'referrer')
    meta.setAttribute('content', 'no-referrer')
    document.head.appendChild(meta)
    return () => {
      meta.remove()
    }
  }, [])

  useEffect(() => {
    if (!token || startedRef.current) {
      return
    }
    startedRef.current = true

    const verify = async () => {
      try {
        await authService.verifyEmail(token)
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setErrorKey(
          error instanceof BackendNotConnectedError
            ? 'auth.verifyEmail.unavailable'
            : 'auth.verifyEmail.errorText',
        )
      }
    }

    verify()
  }, [token])

  const handleResend = async (event) => {
    event.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setEmailError('auth.errors.emailRequired')
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setEmailError('auth.errors.emailInvalid')
      return
    }

    setEmailError('')
    await verificationResend.resend(trimmedEmail)
  }

  const isProblem = status === 'error' || status === 'missing'
  const resendLabel = verificationResend.isSending
    ? t('auth.verification.resending')
    : verificationResend.cooldown > 0
      ? t('auth.verification.resendIn', { seconds: verificationResend.cooldown })
      : t('auth.verification.resend')

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">
          {t('auth.verifyEmail.eyebrow')}
        </p>
        <h1 className="auth-card__title anim-fade-up anim-delay-1">
          {t('auth.verifyEmail.title')}
        </h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {t('auth.verifyEmail.subtitle')}
        </p>
      </div>

      {status === 'verifying' ? (
        <div className="auth-state" role="status">
          <span className="auth-state__icon auth-state__icon--info" aria-hidden="true">
            <span className="spinner" />
          </span>
          <h3 className="auth-state__title">{t('auth.verifyEmail.verifyingTitle')}</h3>
          <p className="auth-state__text">{t('auth.verifyEmail.verifyingText')}</p>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="auth-state" role="status">
          <span className="auth-state__icon auth-state__icon--success" aria-hidden="true">
            <CheckCircle2 size={22} />
          </span>
          <h3 className="auth-state__title">{t('auth.verifyEmail.successTitle')}</h3>
          <p className="auth-state__text">{t('auth.verifyEmail.successText')}</p>
          <Link to="/login" className="btn btn--primary auth-cta">
            <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
            {t('auth.verifyEmail.successCta')}
          </Link>
        </div>
      ) : null}

      {isProblem ? (
        <div className="auth-state">
          <span className="auth-state__icon auth-state__icon--danger" aria-hidden="true">
            <AlertCircle size={22} />
          </span>
          <h3 className="auth-state__title">
            {status === 'missing'
              ? t('auth.verifyEmail.missingTitle')
              : t('auth.verifyEmail.errorTitle')}
          </h3>
          <p className="auth-state__text">
            {status === 'missing'
              ? t('auth.verifyEmail.missingText')
              : t(errorKey || 'auth.verifyEmail.errorText')}
          </p>

          <form className="form auth-verify__resend" onSubmit={handleResend} noValidate>
            <h4 className="auth-verify__resend-title">
              {t('auth.verifyEmail.resendHeading')}
            </h4>

            {verificationResend.status === 'sent' ? (
              <p className="auth-verify__message" role="status">
                <MailCheck size={16} aria-hidden="true" />
                <span>{t('auth.verification.resendSent')}</span>
              </p>
            ) : null}

            {verificationResend.status === 'failed' ? (
              <div className="form__error-area anim-shake" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{t('auth.verification.resendFailed')}</span>
              </div>
            ) : null}

            <div className="form__field">
              <label className="form__label" htmlFor="verify-email-address">
                {t('auth.common.email')}
              </label>
              <input
                id="verify-email-address"
                className={`form__input${emailError ? ' form__input--error' : ''}`}
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t('auth.common.emailPlaceholder')}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailError('')
                }}
                disabled={verificationResend.isSending}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'verify-email-address-error' : undefined}
              />
              {emailError ? (
                <p className="form__error" id="verify-email-address-error">
                  {t(emailError)}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="btn btn--secondary"
              disabled={!verificationResend.canResend}
            >
              {verificationResend.isSending ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  {resendLabel}
                </>
              ) : (
                <>
                  <Mail size={16} aria-hidden="true" />
                  {resendLabel}
                </>
              )}
            </button>
          </form>

          <div className="auth-back">
            <Link to="/login" className="form__link">
              <LogIn size={14} aria-hidden="true" />
              {t('auth.verifyEmail.signIn')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default VerifyEmailPage
