import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  MailCheck,
  UserPlus,
} from 'lucide-react'
import authService from '@/services/authService'
import { BackendNotConnectedError } from '@/services/httpClient'
import ExternalAuthPanel from '@/components/auth/ExternalAuthPanel'
import useExternalAuth from '@/hooks/useExternalAuth'
import useTranslation from '@/hooks/useTranslation'
import { EXTERNAL_AUTH_INTENT } from '@/models/externalAuth'
import { isValidEmail } from '@/utils/validation'

const MIN_PASSWORD_LENGTH = 6

/**
 * Public registration.
 *
 * There is no role selector: a visitor becomes a platform user, and the backend
 * decides the account it actually creates. Elevated roles are never
 * offered here — administration is provisioned internally.
 */
const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const FIELD_ORDER = ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
const DETAIL_FIELD_ORDER = ['firstName', 'lastName', 'email']

function VerifyEmailView({ email, onResend, isResending, resendError }) {
  const { t } = useTranslation()

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.register.verifyEyebrow')}</p>
        <h1 className="auth-card__title anim-fade-up anim-delay-1">{t('auth.register.verifyTitle')}</h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {t('auth.register.verifySubtitle')}
        </p>
      </div>

      <div className="auth-state" role="status">
        <span className="auth-state__icon auth-state__icon--info" aria-hidden="true">
          <MailCheck size={22} />
        </span>
        <h3 className="auth-state__title">{t('auth.register.verifyHeading')}</h3>
        <p className="auth-state__text">
          {t('auth.register.verifyText', { email })}
        </p>

        {resendError ? (
          <div className="form__error-area anim-shake" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{resendError}</span>
          </div>
        ) : null}

        <div className="auth-register__resend">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <span className="spinner" aria-hidden="true" />
                {t('auth.register.resending')}
              </>
            ) : (
              <>
                <Mail size={16} aria-hidden="true" />
                {t('auth.register.resend')}
              </>
            )}
          </button>
        </div>

        <div className="auth-back">
          <Link to="/login" className="form__link">
            <LogIn size={14} aria-hidden="true" />
            {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}

function AccountCreatedView() {
  const { t } = useTranslation()

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.register.createdEyebrow')}</p>
        <h1 className="auth-card__title anim-fade-up anim-delay-1">{t('auth.register.createdTitle')}</h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {t('auth.register.createdSubtitle')}
        </p>
      </div>

      <div className="auth-state" role="status">
        <span className="auth-state__icon auth-state__icon--success" aria-hidden="true">
          <Check size={22} />
        </span>
        <h3 className="auth-state__title">{t('auth.register.createdHeading')}</h3>
        <p className="auth-state__text">{t('auth.register.createdText')}</p>
        <Link to="/login" className="btn btn--primary auth-cta">
          <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
          {t('auth.register.createdCta')}
        </Link>
      </div>
    </div>
  )
}

function RegisterPage() {
  const { t } = useTranslation()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('form')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const externalAuth = useExternalAuth()

  const validate = (toValidate = values, scope = 'all') => {
    const nextErrors = {}

    if (scope !== 'security') {
      if (!toValidate.firstName.trim()) {
        nextErrors.firstName = t('auth.errors.firstNameRequired')
      }
      if (!toValidate.lastName.trim()) {
        nextErrors.lastName = t('auth.errors.lastNameRequired')
      }
      if (!toValidate.email.trim()) {
        nextErrors.email = t('auth.errors.emailRequired')
      } else if (!isValidEmail(toValidate.email.trim())) {
        nextErrors.email = t('auth.errors.emailInvalid')
      }
    }

    if (scope !== 'details') {
      if (!toValidate.password) {
        nextErrors.password = t('auth.errors.passwordRequired')
      } else if (toValidate.password.length < MIN_PASSWORD_LENGTH) {
        nextErrors.password = t('auth.errors.passwordShort')
      }
      if (!toValidate.confirmPassword) {
        nextErrors.confirmPassword = t('auth.errors.confirmRequired')
      } else if (toValidate.confirmPassword !== toValidate.password) {
        nextErrors.confirmPassword = t('auth.errors.passwordMismatch')
      }
    }

    return nextErrors
  }

  const updateField = (event) => {
    const { name, value } = event.target
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError('')
  }

  const handleBlur = (event) => {
    const field = event.target.name
    const nextErrors = validate()
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  const focusField = (name) => {
    document.getElementById(`register-${name}`)?.focus()
  }

  const focusFirstError = (nextErrors, scope) => {
    const order = scope === 'details' ? DETAIL_FIELD_ORDER : FIELD_ORDER
    const firstInvalid = order.find((name) => nextErrors[name])
    if (firstInvalid) focusField(firstInvalid)
  }

  const handleContinue = (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate(values, 'details')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors, 'details')
      return
    }

    setStep(2)
    setFormError('')
  }

  const handleBack = () => {
    setStep(1)
    setFormError('')
    setErrors((current) => {
      const next = { ...current }
      delete next.password
      delete next.confirmPassword
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors, 'all')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      // No role is sent: the backend decides what the account is. Public
      // registration can never request an Admin account.
      const response = await authService.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      // Post-registration flows are driven strictly by the backend response.
      // Without a real response these states stay unreachable and no fake
      // success, email, or redirect is simulated.
      if (response?.requiresVerification) {
        setStatus('verify-email')
      } else {
        setStatus('created')
      }
    } catch (error) {
      setFormError(error instanceof BackendNotConnectedError ? t('audit.registrationUnavailable') : t('auth.errors.signInFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (isResending) return

    setIsResending(true)
    setResendError('')
    try {
      await authService.resendVerification(values.email.trim())
    } catch (error) {
      setResendError(error.message || t('auth.register.resendFailed'))
    } finally {
      setIsResending(false)
    }
  }

  const field = (name, label, options = {}) => {
    const { type = 'text', autoComplete, placeholder, toggle, helper } = options
    const error = errors[name]
    const toggleShown = name === 'password' ? showPassword : showConfirmPassword
    const inputType = toggle ? (toggleShown ? 'text' : 'password') : type
    const setToggle = name === 'password' ? setShowPassword : setShowConfirmPassword
    const describedBy = error
      ? `register-${name}-error`
      : helper
        ? `register-${name}-hint`
        : undefined

    return (
      <div className="form__field" key={name}>
        <label className="form__label" htmlFor={`register-${name}`}>{label}</label>
        <div className={toggle ? 'form__input-wrapper' : undefined}>
          <input
            id={`register-${name}`}
            className={`form__input${error ? ' form__input--error' : ''}`}
            type={inputType}
            name={name}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={values[name]}
            onChange={updateField}
            onBlur={handleBlur}
            disabled={isSubmitting}
            autoFocus={name === 'firstName'}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />
          {toggle ? (
            <button
              type="button"
              className="form__toggle"
              onClick={() => setToggle((shown) => !shown)}
              aria-label={
                toggleShown
                  ? t('auth.common.hidePassword')
                  : t('auth.common.showPassword')
              }
              aria-pressed={toggleShown}
              disabled={isSubmitting}
            >
              {toggleShown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          ) : null}
        </div>
        {helper ? (
          <p className="form__hint" id={`register-${name}-hint`}>{helper}</p>
        ) : null}
        {error ? (
          <p className="form__error" id={`register-${name}-error`}>{error}</p>
        ) : null}
      </div>
    )
  }

  if (status === 'verify-email') {
    return (
      <VerifyEmailView
        email={values.email.trim()}
        onResend={handleResend}
        isResending={isResending}
        resendError={resendError}
      />
    )
  }

  if (status === 'created') {
    return <AccountCreatedView />
  }

  const handleGoogleSignUp = () => {
    externalAuth.begin({
      intent: EXTERNAL_AUTH_INTENT.REGISTER,
      returnTo: '/register',
    })
  }

  return (
    <div className="auth-card auth-register-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">{t('auth.register.eyebrow')}</p>
        <h1 className="auth-card__title anim-fade-up anim-delay-1">{t('auth.register.title')}</h1>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {t('auth.register.subtitle')}
        </p>
      </div>

      {/* Google is an alternative first step only. The backend still decides
          the account that gets created. */}
      <ExternalAuthPanel
        intent={EXTERNAL_AUTH_INTENT.REGISTER}
        isAvailable={externalAuth.isAvailable}
        isPending={externalAuth.isPending}
        error={externalAuth.error}
        onStart={handleGoogleSignUp}
      />

      <div className="auth-register__steps" role="list" aria-label={t('auth.register.title')}>
        <div
          className={`auth-register__step${step === 1 ? ' auth-register__step--active' : ' auth-register__step--done'}`}
          role="listitem"
          aria-current={step === 1 ? 'step' : undefined}
        >
          <span className="auth-register__step-marker" aria-hidden="true">
            {step === 2 ? <Check size={13} /> : 1}
          </span>
          <span className="auth-register__step-label">{t('auth.register.stepDetails')}</span>
        </div>
        <div className="auth-register__step-line" aria-hidden="true" />
        <div
          className={`auth-register__step${step === 2 ? ' auth-register__step--active' : ''}`}
          role="listitem"
          aria-current={step === 2 ? 'step' : undefined}
        >
          <span className="auth-register__step-marker" aria-hidden="true">2</span>
          <span className="auth-register__step-label">{t('auth.register.stepSecurity')}</span>
        </div>
      </div>

      <form className="form" onSubmit={step === 1 ? handleContinue : handleSubmit} noValidate>
        {formError ? (
          <div className="form__error-area anim-shake" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="auth-register__panel anim-fade-up" key="step-1">
            <div className="auth-register__name-grid">
              {field('firstName', t('auth.register.firstName'), {
                autoComplete: 'given-name',
                placeholder: t('auth.register.firstNamePlaceholder'),
              })}
              {field('lastName', t('auth.register.lastName'), {
                autoComplete: 'family-name',
                placeholder: t('auth.register.lastNamePlaceholder'),
              })}
            </div>
            {field('email', t('auth.common.email'), {
              type: 'email',
              autoComplete: 'email',
              placeholder: t('auth.common.emailPlaceholder'),
              helper: t('auth.register.emailHelper'),
            })}
          </div>
        ) : (
          <div className="auth-register__panel anim-fade-up" key="step-2">
            {field('password', t('auth.common.password'), {
              autoComplete: 'new-password',
              placeholder: t('auth.register.passwordPlaceholder'),
              toggle: true,
              helper: t('auth.register.passwordHelper'),
            })}
            {field('confirmPassword', t('auth.register.confirmPassword'), {
              autoComplete: 'new-password',
              placeholder: t('auth.register.confirmPasswordPlaceholder'),
              toggle: true,
            })}
          </div>
        )}

        <div className="auth-register__actions">
          {step === 2 ? (
            <button
              type="button"
              className="btn btn--outline auth-register__back"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t('common.back')}
            </button>
          ) : null}

          {step === 1 ? (
            <button type="submit" className="btn btn--primary btn--block auth-cta">
              {t('auth.register.next')}
              <ArrowRight size={16} className="auth-cta__icon" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn--primary btn--block auth-cta"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  {t('auth.register.submitting')}
                </>
              ) : (
                <>
                  <UserPlus size={16} className="auth-cta__icon" aria-hidden="true" />
                  {t('auth.register.submit')}
                </>
              )}
            </button>
          )}
        </div>

        <p className="auth-register-prompt">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className="form__link">{t('auth.register.signIn')}</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
