import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import authService from '@/services/authService'
import { isValidEmail } from '@/utils/validation'

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function RegisterPage() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validate = (fields = values) => {
    const nextErrors = {}
    if (!fields.firstName.trim()) nextErrors.firstName = 'First name is required.'
    if (!fields.lastName.trim()) nextErrors.lastName = 'Last name is required.'
    if (!fields.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(fields.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!fields.password) {
      nextErrors.password = 'Password is required.'
    } else if (fields.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }
    if (!fields.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (fields.confirmPassword !== fields.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    setFormError('')
    try {
      await authService.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
    } catch (error) {
      setFormError(error.message || 'Account creation is currently unavailable.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const field = (name, label, options = {}) => {
    const { type = 'text', autoComplete, placeholder, toggle } = options
    const error = errors[name]
    const toggleShown = name === 'password' ? showPassword : showConfirmPassword
    const inputType = toggle ? (toggleShown ? 'text' : 'password') : type
    const setToggle = name === 'password' ? setShowPassword : setShowConfirmPassword

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
            aria-describedby={error ? `register-${name}-error` : undefined}
          />
          {toggle ? (
            <button
              type="button"
              className="form__toggle"
              onClick={() => setToggle((shown) => !shown)}
              aria-label={`${toggleShown ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
              aria-pressed={toggleShown}
              disabled={isSubmitting}
            >
              {toggleShown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          ) : null}
        </div>
        {error ? <p className="form__error" id={`register-${name}-error`}>{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="auth-card auth-register-card anim-scale-in">
      <div className="auth-card__head">
        <p className="auth-card__eyebrow anim-fade-up anim-delay-1">Get started</p>
        <h2 className="auth-card__title anim-fade-up anim-delay-1">Create your account</h2>
        <p className="auth-card__subtitle anim-fade-up anim-delay-2">Set up your access to the academic workspace.</p>
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="form__error-area" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        ) : null}

        <div className="auth-register__name-grid">
          {field('firstName', 'First name', { autoComplete: 'given-name', placeholder: 'First name' })}
          {field('lastName', 'Last name', { autoComplete: 'family-name', placeholder: 'Last name' })}
        </div>
        {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
        {field('password', 'Password', { autoComplete: 'new-password', placeholder: 'At least 6 characters', toggle: true })}
        {field('confirmPassword', 'Confirm password', { autoComplete: 'new-password', placeholder: 'Re-enter your password', toggle: true })}

        <p className="auth-register__note">
          Access roles are assigned by your institution. Registration does not select a role.
        </p>

        <button type="submit" className="btn btn--primary btn--block auth-cta" disabled={isSubmitting}>
          {isSubmitting ? (
            <><span className="spinner" aria-hidden="true" /> Creating account&hellip;</>
          ) : (
            <><UserPlus size={16} className="auth-cta__icon" aria-hidden="true" /> Create Account</>
          )}
        </button>

        <p className="auth-register-prompt">
          Already have an account? <Link to="/login" className="form__link">Sign in</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
