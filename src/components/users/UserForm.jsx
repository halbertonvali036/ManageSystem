import { useState } from 'react'
import useRoles from '@/hooks/useRoles'
import { USER_STATUS_LABELS } from '@/models/user'
import { toUserFormValues, toUserPayload } from '@/utils/userForm'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STATUS_OPTIONS = [
  { value: '', label: 'Select a status' },
  ...Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const EMPTY_VALUES = toUserFormValues()

function UserForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save User',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const { roles, isLoading: rolesLoading } = useRoles()
  const [values, setValues] = useState(() => toUserFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.fullName.trim()) {
      errors.fullName = 'Full name is required.'
    }
    if (!toValidate.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(toValidate.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!toValidate.roleId) {
      errors.roleId = 'Select a role.'
    }
    if (!toValidate.status) {
      errors.status = 'Select a status.'
    }

    return errors
  }

  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setClientErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleBlur = (field) => () => {
    setClientErrors((prev) => ({ ...prev, [field]: validate()[field] }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    const nextErrors = validate()
    setClientErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    onSubmit(toUserPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const relationHint = (loading, available, kind) =>
    !loading && !available ? (
      <p className="form__hint">No {kind} available yet.</p>
    ) : null

  return (
    <form className="user-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="user-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="user-fullName">
            Full Name <span className="form__required">*</span>
          </label>
          <input
            id="user-fullName"
            className={inputClass('fullName')}
            type="text"
            autoComplete="off"
            value={values.fullName}
            onChange={setField('fullName')}
            onBlur={handleBlur('fullName')}
            placeholder="e.g. Jane Doe"
            disabled={isSubmitting}
          />
          {fieldError('fullName') ? (
            <p className="form__error">{fieldError('fullName')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="user-email">
            Email <span className="form__required">*</span>
          </label>
          <input
            id="user-email"
            className={inputClass('email')}
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={setField('email')}
            onBlur={handleBlur('email')}
            placeholder="e.g. jane.doe@example.com"
            disabled={isSubmitting}
          />
          {fieldError('email') ? (
            <p className="form__error">{fieldError('email')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="user-username">
            Username
          </label>
          <input
            id="user-username"
            className="form__input"
            type="text"
            autoComplete="off"
            value={values.username}
            onChange={setField('username')}
            placeholder="e.g. jane.doe"
            disabled={isSubmitting}
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="user-roleId">
            Role <span className="form__required">*</span>
          </label>
          <select
            id="user-roleId"
            className="form__input form__select"
            value={values.roleId}
            onChange={setField('roleId')}
            disabled={isSubmitting || rolesLoading || roles.length === 0}
          >
            <option value="">
              {rolesLoading
                ? 'Loading roles\u2026'
                : roles.length === 0
                  ? 'No roles available'
                  : 'Select a role'}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name ?? role.code ?? 'Role'}
              </option>
            ))}
          </select>
          {fieldError('roleId') ? (
            <p className="form__error">{fieldError('roleId')}</p>
          ) : null}
          {relationHint(rolesLoading, roles.length > 0, 'roles')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="user-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="user-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('status') ? (
            <p className="form__error">{fieldError('status')}</p>
          ) : null}
        </div>
      </div>

      <div className="user-form__actions">
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Saving&hellip;
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}

export default UserForm