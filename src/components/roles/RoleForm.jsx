import { useState } from 'react'
import { ROLE_STATUS_LABELS } from '@/models/role'
import { toRoleFormValues, toRolePayload } from '@/utils/roleForm'

const STATUS_OPTIONS = [
  { value: '', label: 'Select a status' },
  ...Object.entries(ROLE_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const EMPTY_VALUES = toRoleFormValues()

function RoleForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Role',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const [values, setValues] = useState(() => toRoleFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.name.trim()) {
      errors.name = 'Role name is required.'
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
    onSubmit(toRolePayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  return (
    <form className="role-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="role-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="role-name">
            Role Name <span className="form__required">*</span>
          </label>
          <input
            id="role-name"
            className={inputClass('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={setField('name')}
            onBlur={handleBlur('name')}
            placeholder="e.g. Administrator"
            disabled={isSubmitting}
          />
          {fieldError('name') ? (
            <p className="form__error">{fieldError('name')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="role-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="role-status"
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

        <div className="form__field role-form__field--full">
          <label className="form__label" htmlFor="role-description">
            Description
          </label>
          <textarea
            id="role-description"
            className="form__input"
            rows="3"
            value={values.description}
            onChange={setField('description')}
            placeholder="Optional description of this role"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="role-form__actions">
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

export default RoleForm