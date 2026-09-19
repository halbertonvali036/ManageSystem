import { useState } from 'react'
import useDepartments from '@/hooks/useDepartments'
import { SUBJECT_STATUS_LABELS } from '@/models/subject'
import {
  toSubjectFormValues,
  toSubjectPayload,
} from '@/utils/subjectForm'

const STATUS_OPTIONS = [
  { value: '', label: 'Select a status' },
  ...Object.entries(SUBJECT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const EMPTY_VALUES = toSubjectFormValues()

function SubjectForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Subject',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const { departments, isLoading: departmentsLoading } = useDepartments()
  const [values, setValues] = useState(() => toSubjectFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.code.trim()) {
      errors.code = 'Subject code is required.'
    }
    if (!toValidate.name.trim()) {
      errors.name = 'Subject name is required.'
    }
    if (!toValidate.departmentId) {
      errors.departmentId = 'Select a department.'
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
    onSubmit(toSubjectPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const relationHint = (loading, available, kind) =>
    !loading && !available ? (
      <p className="form__hint">No {kind} available yet.</p>
    ) : null

  return (
    <form className="subject-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="subject-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="subject-code">
            Subject Code <span className="form__required">*</span>
          </label>
          <input
            id="subject-code"
            className={inputClass('code')}
            type="text"
            autoComplete="off"
            value={values.code}
            onChange={setField('code')}
            onBlur={handleBlur('code')}
            placeholder="e.g. CS101"
            disabled={isSubmitting}
          />
          {fieldError('code') ? (
            <p className="form__error">{fieldError('code')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="subject-name">
            Subject Name <span className="form__required">*</span>
          </label>
          <input
            id="subject-name"
            className={inputClass('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={setField('name')}
            onBlur={handleBlur('name')}
            placeholder="e.g. Introduction to Programming"
            disabled={isSubmitting}
          />
          {fieldError('name') ? (
            <p className="form__error">{fieldError('name')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="subject-departmentId">
            Department <span className="form__required">*</span>
          </label>
          <select
            id="subject-departmentId"
            className="form__input form__select"
            value={values.departmentId}
            onChange={setField('departmentId')}
            disabled={isSubmitting || departmentsLoading || departments.length === 0}
          >
            <option value="">
              {departmentsLoading
                ? 'Loading departments\u2026'
                : departments.length === 0
                  ? 'No departments available'
                  : 'Select a department'}
            </option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {fieldError('departmentId') ? (
            <p className="form__error">{fieldError('departmentId')}</p>
          ) : null}
          {relationHint(departmentsLoading, departments.length > 0, 'departments')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="subject-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="subject-status"
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

        <div className="form__field subject-form__field--full">
          <label className="form__label" htmlFor="subject-description">
            Description
          </label>
          <textarea
            id="subject-description"
            className="form__input"
            rows="3"
            value={values.description}
            onChange={setField('description')}
            placeholder="Optional description of this subject"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="subject-form__actions">
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

export default SubjectForm