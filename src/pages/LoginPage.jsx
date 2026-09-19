import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react'
import BrandLogo from '@/components/common/BrandLogo'
import useAuth from '@/hooks/useAuth'
import { DEMO_ACCOUNTS } from '@/services/authService'
import { getRoleDashboardPath, ROLE_NAMES } from '@/utils/roles'
import { isValidEmail } from '@/utils/validation'

const DEMO_ROLES = DEMO_ACCOUNTS.map((account) => account.role)

const getAccountByRole = (role) =>
  DEMO_ACCOUNTS.find((account) => account.role === role)

function LoginPage() {
  const [role, setRole] = useState(DEMO_ROLES[0])
  const initialAccount = getAccountByRole(role)
  const [email, setEmail] = useState(initialAccount.email)
  const [password, setPassword] = useState(initialAccount.password)
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotHint, setShowForgotHint] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const values = { email, password }

  const validate = (toValidate = values) => {
    const nextErrors = {}
    const trimmedEmail = toValidate.email.trim()

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!toValidate.password) {
      nextErrors.password = 'Password is required.'
    } else if (toValidate.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    return nextErrors
  }

  const handleBlur = () => {
    setErrors((prev) => ({ ...prev, ...validate() }))
  }

  const handleRoleChange = (nextRole) => {
    if (nextRole === role) {
      return
    }
    const account = getAccountByRole(nextRole)
    setRole(nextRole)
    setEmail(account.email)
    setPassword(account.password)
    setFormError('')
    setErrors({})
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
      await login({ email: email.trim(), password }, { remember })
      navigate(getRoleDashboardPath(role), { replace: true })
    } catch (error) {
      setFormError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotClick = (event) => {
    event.preventDefault()
    setShowForgotHint(true)
  }

  return (
    <div className="auth-card anim-scale-in">
      <div className="auth-card__head">
        <BrandLogo size={44} />
        <h2 className="auth-card__title anim-fade-up anim-delay-1">
          Welcome back
        </h2>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">
          Sign in to your account to continue.
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
          <span className="form__label" id="demo-role-label">
            Demo role
          </span>
          <div
            className="role-selector"
            role="group"
            aria-labelledby="demo-role-label"
          >
            {DEMO_ROLES.map((demoRole) => (
              <button
                key={demoRole}
                type="button"
                className={`role-selector__option${
                  role === demoRole ? ' role-selector__option--active' : ''
                }`}
                onClick={() => handleRoleChange(demoRole)}
                aria-pressed={role === demoRole}
                disabled={isLoading}
              >
                {ROLE_NAMES[demoRole]}
              </button>
            ))}
          </div>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
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
          {errors.email ? <p className="form__error">{errors.email}</p> : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="login-password">
            Password
          </label>
          <div className="form__input-wrapper">
            <input
              id="login-password"
              className={`form__input${errors.password ? ' form__input--error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={handleBlur}
              disabled={isLoading}
            />
            <button
              type="button"
              className="form__toggle"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? (
            <p className="form__error">{errors.password}</p>
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
            <span>Remember me</span>
          </label>
          <a
            href="#forgot-password"
            className="form__link"
            onClick={handleForgotClick}
            aria-disabled="true"
          >
            Forgot password?
          </a>
        </div>

        {showForgotHint ? (
          <p className="form__hint anim-fade-in">
            Password reset is not available yet in the demo.
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn--primary btn--block auth-cta"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Signing in&hellip;
            </>
          ) : (
            <>
              <LogIn size={16} className="auth-cta__icon" aria-hidden="true" />
              Sign in
            </>
          )}
        </button>

        <ul className="form__demo form__demo-list">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.role}>
              <strong>{ROLE_NAMES[account.role]}:</strong> {account.email} /{' '}
              {account.password}
            </li>
          ))}
        </ul>
      </form>
    </div>
  )
}

export default LoginPage