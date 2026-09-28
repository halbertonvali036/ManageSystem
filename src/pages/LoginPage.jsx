import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  QrCode,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useExternalAuth from '@/hooks/useExternalAuth'
import useTranslation from '@/hooks/useTranslation'
import ExternalAuthPanel from '@/components/auth/ExternalAuthPanel'
import { EXTERNAL_AUTH_INTENT } from '@/models/externalAuth'
import { getRoleDashboardPath, ROLES, ROLE_NAMES } from '@/utils/roles'
import { isValidEmail } from '@/utils/validation'
import { BackendNotConnectedError } from '@/services/httpClient'

/**
 * Public sign-in: email and password only.
 *
 * The visitor never picks a role. Authentication decides the role and the
 * dashboard is chosen from the role the session comes back with, so the same
 * form serves every public account once the backend owns sign-in. There is no
 * Student or Admin selector here, and no demo credential on screen.
 *
 * `restrictedRole` and `initialCredentials` exist only for the unlisted
 * /admin/login development entry point, which stays separate from public auth.
 */
function LoginPage({ restrictedRole = null, initialCredentials = null }) {
  const isAdminEntry = restrictedRole === ROLES.ADMIN
  const { t } = useTranslation()

  const [email, setEmail] = useState(initialCredentials?.email ?? '')
  const [password, setPassword] = useState(initialCredentials?.password ?? '')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const externalAuth = useExternalAuth()
  const navigate = useNavigate()

  // Google and QR sign-in are offered on the public sign-in only. Admin access
  // stays email/password only, so no admin identity can ever be requested
  // through an external provider or a paired device.
  const allowsProviderSignIn = !isAdminEntry

  const values = { email, password }

  const validate = (toValidate = values) => {
    const nextErrors = {}
    const trimmedEmail = toValidate.email.trim()

    if (!trimmedEmail) {
      nextErrors.email = t('auth.errors.emailRequired')
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = t('auth.errors.emailInvalid')
    }

    if (!toValidate.password) {
      nextErrors.password = t('auth.errors.passwordRequired')
    } else if (toValidate.password.length < 6) {
      nextErrors.password = t('auth.errors.passwordShort')
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
      // The session — and therefore the role — comes back from authentication.
      // Routing always follows that role, never a role chosen on this screen.
      const session = await login({ email: email.trim(), password }, { remember, restrictedRole })
      navigate(getRoleDashboardPath(session.user.role), { replace: true })
    } catch (error) {
      setFormError(t(error instanceof BackendNotConnectedError ? 'audit.authUnavailable'
        : error.code === 'ROLE_NOT_ALLOWED' ? 'audit.adminOnly'
        : error.code === 'INVALID_CREDENTIALS' || error.status === 401 ? 'audit.invalidCredentials'
        : 'auth.errors.signInFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    externalAuth.begin({
      intent: EXTERNAL_AUTH_INTENT.LOGIN,
      returnTo: '/login',
    })
  }

  return (
    <div className="auth-card auth-signin-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">
          {isAdminEntry ? ROLE_NAMES[ROLES.ADMIN] : t('auth.login.eyebrow')}
        </p>
        <h2 className="auth-card__title anim-fade-up anim-delay-1">
          {isAdminEntry ? t('auth.login.adminTitle') : t('auth.login.title')}
        </h2>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          {isAdminEntry ? t('auth.login.adminSubtitle') : t('auth.login.subtitle')}
        </p>
      </div>

      {allowsProviderSignIn ? (
        <ExternalAuthPanel
          intent={EXTERNAL_AUTH_INTENT.LOGIN}
          isAvailable={externalAuth.isAvailable}
          isPending={externalAuth.isPending}
          error={externalAuth.error}
          onStart={handleGoogleSignIn}
        >
          <Link to="/login/qr" className="auth-qr-entry">
            <QrCode size={16} aria-hidden="true" />
            <span className="auth-qr-entry__label">{t('auth.login.qrTitle')}</span>
            <span className="auth-qr-entry__hint">{t('auth.login.qrHint')}</span>
          </Link>
        </ExternalAuthPanel>
      ) : null}

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
          <label className="form__label" htmlFor="login-email">
            {t('auth.common.email')}
          </label>
          <input
            id="login-email"
            className={`form__input${errors.email ? ' form__input--error' : ''}`}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t('auth.common.emailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={handleBlur}
            disabled={isLoading}
            autoFocus
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email ? <p className="form__error" id="login-email-error">{errors.email}</p> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="login-password">
            {t('auth.common.password')}
          </label>
          <div className="form__input-wrapper">
            <input
              id="login-password"
              className={`form__input${errors.password ? ' form__input--error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder={t('auth.common.password')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={handleBlur}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              className="form__toggle"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')
              }
              aria-pressed={showPassword}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {errors.password ? (
            <p className="form__error" id="login-password-error">{errors.password}</p>
          ) : null}
        </div>

        <div className="form__row">
          <label className="form__checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={isLoading}
            />
            <span>{t('auth.login.rememberMe')}</span>
          </label>
          <Link to="/forgot-password" className="form__link">
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block auth-cta"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {t('auth.login.submitting')}
            </>
          ) : (
            <>
              <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
              {t('auth.login.submit')}
            </>
          )}
        </button>

        {isAdminEntry ? (
          // Development entry point only. It is not linked from the landing
          // page, the public sign-in or registration, and it carries no public
          // sign-up path — admin accounts are provisioned internally.
          <p className="auth-dev-note">
            <KeyRound size={14} aria-hidden="true" />
            <span>
              {ROLE_NAMES[ROLES.ADMIN]} workspace development entry. Not linked
              from the public site.
            </span>
          </p>
        ) : (
          <p className="auth-register-prompt">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="form__link">
              {t('auth.login.createOne')}
            </Link>
          </p>
        )}
      </form>
    </div>
  )
}

export default LoginPage
