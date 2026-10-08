import useTranslation from '@/hooks/useTranslation'
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
  const { t } = useTranslation()
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
          placeholder={t('recovery.passwordPlaceholder')}
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
      {error ? <p className="form__error" id={`${id}-error`}>{t(error)}</p> : null}
    </div>
  )
}

function ResetPasswordPage() {
  const { t } = useTranslation()
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
    } else if (toValidate.password.length < 6) {
      nextErrors.password = 'auth.errors.passwordShort'
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
    try {
      await authService.resetPassword(token, password)
      setSucceeded(true)
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setFormError('recovery.resetUnavailable')
      } else {
        setFormError('recovery.resetFailed')
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
            <span>{t(formError)}</span>
          </div>
        ) : null}

        <PasswordField
          id="reset-password"
          label={t('recovery.newPassword')}
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
          {t('recovery.passwordHint')}
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
