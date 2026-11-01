import useTranslation from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'
import authService from '@/services/authService'
import {
  BackendNotConnectedError,
  getRequestErrorMessage,
  HTTP_STATUS,
} from '@/services/httpClient'

const MIN_RESET_PASSWORD_LENGTH = 8

const isInvalidTokenError = (error) => {
  if (error?.status === HTTP_STATUS.BAD_REQUEST) {
    return true
  }

  const message = typeof error?.message === 'string' ? error.message : ''
  return /(invalid|expired|used)/i.test(message) && /(token|link)/i.test(message)
}

const getPasswordFieldMessage = (error) => {
  const messages = error?.data?.errors?.newPassword
  if (!Array.isArray(messages)) {
    return ''
  }

  const firstMessage = messages.find(
    (message) => typeof message === 'string' && message.trim(),
  )
  return firstMessage ? firstMessage.trim() : ''
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
  errorMessage,
  disabled,
}) {
  const { t } = useTranslation()
  const hasError = Boolean(error || errorMessage)
  return (
    <div className="form__field">
      <label className="form__label" htmlFor={id}>
        {label}
      </label>
      <div className="form__input-wrapper">
        <input
          id={id}
          className={`form__input${hasError ? ' form__input--error' : ''}`}
          type={show ? 'text' : 'password'}
          name={id}
          autoComplete="new-password"
          placeholder={t('recovery.passwordPlaceholder')}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="form__toggle"
          onClick={onToggleShow}
          aria-label={t(show ? 'auth.common.hidePassword' : 'auth.common.showPassword')}
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
      {hasError ? (
        <p className="form__error" id={`${id}-error`}>
          {errorMessage ?? t(error)}
        </p>
      ) : null}
    </div>
  )
}

function ResetPasswordPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  // Read the token before cleaning the address bar. The state keeps the value
  // available for the submit request even after the query string is gone.
  const [token] = useState(
    () => new URLSearchParams(location.search).get('token') ?? '',
  )

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showFields, setShowFields] = useState({
    password: false,
    confirm: false,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  // The token must not linger in history or leak through the Referer header.
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

  // Reset links should never expose their token to third-party hosts.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'referrer')
    meta.setAttribute('content', 'no-referrer')
    document.head.appendChild(meta)
    return () => {
      meta.remove()
    }
  }, [])

  if (!token) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.forgot.eyebrow')}</p>
          <h1 className="auth-card__title anim-fade-up anim-delay-1">
            {t('auth.reset.submit')}
          </h1>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            {t('recovery.invalidToken')}
          </p>
        </div>

        <div className="auth-state">
          <span
            className="auth-state__icon auth-state__icon--danger"
            aria-hidden="true"
          >
            <KeyRound size={22} />
          </span>
          <h3 className="auth-state__title">{t('recovery.invalidToken')}</h3>
          <p className="auth-state__text">
            {t('recovery.invalidTokenText')}
          </p>
          <Link to="/forgot-password" className="btn btn--primary auth-cta">
            {t('recovery.newLink')}
          </Link>
          <div className="auth-back">
            <Link to="/login" className="form__link">
              <ArrowLeft size={15} aria-hidden="true" />
              {t('recovery.back')}
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
      nextErrors.password = 'auth.errors.passwordRequired'
    } else if (toValidate.password.length < MIN_RESET_PASSWORD_LENGTH) {
      nextErrors.password = 'auth.reset.passwordShort'
    }

    if (!toValidate.confirm) {
      nextErrors.confirm = 'auth.errors.confirmRequired'
    } else if (toValidate.confirm !== toValidate.password) {
      nextErrors.confirm = 'auth.errors.passwordMismatch'
    }

    return nextErrors
  }

  const handleBlur = () => {
    setErrors(validate())
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
    setTokenError('')
    try {
      await authService.resetPassword(token, password)
      // The password is never needed after a successful reset.
      setPassword('')
      setConfirm('')
      setErrors({})
      setSucceeded(true)
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setFormError(t('recovery.resetUnavailable'))
      } else if (error?.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        const fieldMessage = getPasswordFieldMessage(error)
        if (fieldMessage) {
          setErrors((prev) => ({ ...prev, passwordMessage: fieldMessage }))
        } else {
          setFormError(
            getRequestErrorMessage(error) || t('recovery.resetFailed'),
          )
        }
      } else if (isInvalidTokenError(error)) {
        setTokenError(
          getRequestErrorMessage(error) || t('recovery.invalidTokenText'),
        )
      } else {
        setFormError(getRequestErrorMessage(error) || t('recovery.resetFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenError) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.forgot.eyebrow')}</p>
          <h1 className="auth-card__title anim-fade-up anim-delay-1">
            {t('auth.reset.submit')}
          </h1>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            {t('recovery.invalidToken')}
          </p>
        </div>

        <div className="auth-state">
          <span
            className="auth-state__icon auth-state__icon--danger"
            aria-hidden="true"
          >
            <KeyRound size={22} />
          </span>
          <h3 className="auth-state__title">{t('recovery.invalidToken')}</h3>
          <p className="auth-state__text" role="alert">{tokenError}</p>
          <p className="auth-state__text">{t('recovery.invalidTokenText')}</p>
          <Link to="/forgot-password" className="btn btn--primary auth-cta">
            {t('recovery.newLink')}
          </Link>
          <div className="auth-back">
            <Link to="/login" className="form__link">
              <ArrowLeft size={15} aria-hidden="true" />
              {t('recovery.back')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (succeeded) {
    return (
      <div className="auth-card anim-scale-in">
        <div className="auth-card__head">
          <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.forgot.eyebrow')}</p>
          <h1 className="auth-card__title anim-fade-up anim-delay-1">
            {t('auth.reset.done')}
          </h1>
          <p className="auth-card__subtitle anim-fade-up anim-delay-2">
            {t('auth.reset.done')}
          </p>
        </div>

        <div className="auth-state" role="status">
          <span
            className="auth-state__icon auth-state__icon--success"
            aria-hidden="true"
          >
            <CheckCircle2 size={22} />
          </span>
          <h3 className="auth-state__title">{t('auth.reset.done')}</h3>
          <p className="auth-state__text">
            {t('auth.reset.done')}
          </p>
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
          {t('auth.reset.title')}
        </h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {t('auth.reset.subtitle')}
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
          label={t('recovery.newPassword')}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setErrors((prev) =>
              prev.passwordMessage ? { ...prev, passwordMessage: '' } : prev,
            )
          }}
          onBlur={handleBlur}
          show={showFields.password}
          onToggleShow={toggleShow('password')}
          error={errors.password}
          errorMessage={errors.passwordMessage}
          disabled={isLoading}
        />

        <PasswordField
          id="reset-password-confirm"
          label={t('recovery.confirmPassword')}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          onBlur={handleBlur}
          show={showFields.confirm}
          onToggleShow={toggleShow('confirm')}
          error={errors.confirm}
          disabled={isLoading}
        />

        <p className="form__hint">
          {t('auth.reset.passwordHint')}
        </p>

        <button
          type="submit"
          className="btn btn--primary btn--block auth-cta"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {t('auth.reset.submitting')}
            </>
          ) : (
            <>
              <CheckCircle2
                size={16}
                className="auth-cta__icon"
                aria-hidden="true"
              />
              {t('auth.reset.submit')}
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

export default ResetPasswordPage
