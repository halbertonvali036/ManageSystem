import { useState } from 'react'
import {
  ACADEMIC_PERIOD_STATUS,
  ACADEMIC_PERIOD_STATUS_LABELS,
} from '@/models/academicYear'

const EMPTY_VALUES = {
  name: '',
  startDate: '',
  endDate: '',
  status: ACADEMIC_PERIOD_STATUS.UPCOMING,
}

const STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  ...Object.entries(ACADEMIC_PERIOD_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

function AcademicPeriodForm({
  label = 'Academic Year',
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const [values, setValues] = useState(() => ({ ...EMPTY_VALUES, ...initialValues }))
  const [clientErrors, setClientErrors] = useState({})

  const nameFieldId = `academic-period-${label.toLowerCase().replace(/\s+/g, '-')}-name`

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.name.trim()) {
      errors.name = `${label} name is required.`
    }

    if (!toValidate.startDate) {
      errors.startDate = 'Start date is required.'
    }

    if (!toValidate.endDate) {
      errors.endDate = 'End date is required.'
    } else if (
      toValidate.startDate &&
      toValidate.endDate <= toValidate.startDate
    ) {
      errors.endDate = 'End date must be after the start date.'
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
    onSubmit(values)
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const renderedError = (field) =>
    fieldError(field) ? <p className="form__error">{fieldError(field)}</p> : null

  return (
    <form className="academic-period-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="academic-period-form__grid">
        <div className="form__field academic-period-form__field--full">
          <label className="form__label" htmlFor={nameFieldId}>
            {label} <span className="form__required">*</span>
          </label>
          <input
            id={nameFieldId}
            className={inputClass('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={setField('name')}
            onBlur={handleBlur('name')}
            placeholder={
              label === 'Semester' ? 'e.g. Semester 1' : 'e.g. 2025-2026'
            }
            disabled={isSubmitting}
          />
          {renderedError('name')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="academic-period-startDate">
            Start Date <span className="form__required">*</span>
          </label>
          <input
            id="academic-period-startDate"
            className={inputClass('startDate')}
            type="date"
            autoComplete="off"
            value={values.startDate}
            onChange={setField('startDate')}
            onBlur={handleBlur('startDate')}
            disabled={isSubmitting}
          />
          {renderedError('startDate')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="academic-period-endDate">
            End Date <span className="form__required">*</span>
          </label>
          <input
            id="academic-period-endDate"
            className={inputClass('endDate')}
            type="date"
            autoComplete="off"
            value={values.endDate}
            onChange={setField('endDate')}
            onBlur={handleBlur('endDate')}
            disabled={isSubmitting}
          />
          {renderedError('endDate')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="academic-period-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="academic-period-status"
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
          {renderedError('status')}
        </div>
      </div>

      <div className="academic-period-form__actions">
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

export default AcademicPeriodForm