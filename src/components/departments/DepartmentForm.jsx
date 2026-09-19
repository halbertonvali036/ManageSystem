import { useState } from 'react'
import useTeachers from '@/hooks/useTeachers'
import { DEPARTMENT_STATUS_LABELS } from '@/models/department'
import { formatTeacherName } from '@/models/teacher'
import {
  toDepartmentFormValues,
  toDepartmentPayload,
} from '@/utils/departmentForm'

const STATUS_OPTIONS = [
  { value: '', label: 'Select a status' },
  ...Object.entries(DEPARTMENT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const EMPTY_VALUES = toDepartmentFormValues()

function DepartmentForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Department',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const { teachers, isLoading: teachersLoading } = useTeachers()
  const [values, setValues] = useState(() => toDepartmentFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.code.trim()) {
      errors.code = 'Department code is required.'
    }
    if (!toValidate.name.trim()) {
      errors.name = 'Department name is required.'
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
    onSubmit(toDepartmentPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const relationHint = (loading, available, kind) =>
    !loading && !available ? (
      <p className="form__hint">No {kind} available yet.</p>
    ) : null

  return (
    <form className="department-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="department-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="department-code">
            Department Code <span className="form__required">*</span>
          </label>
          <input
            id="department-code"
            className={inputClass('code')}
            type="text"
            autoComplete="off"
            value={values.code}
            onChange={setField('code')}
            onBlur={handleBlur('code')}
            placeholder="e.g. CS"
            disabled={isSubmitting}
          />
          {fieldError('code') ? (
            <p className="form__error">{fieldError('code')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="department-name">
            Department Name <span className="form__required">*</span>
          </label>
          <input
            id="department-name"
            className={inputClass('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={setField('name')}
            onBlur={handleBlur('name')}
            placeholder="e.g. Computer Science"
            disabled={isSubmitting}
          />
          {fieldError('name') ? (
            <p className="form__error">{fieldError('name')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="department-headOfDepartment">
            Head of Department
          </label>
          <select
            id="department-headOfDepartment"
            className="form__input form__select"
            value={values.headOfDepartment}
            onChange={setField('headOfDepartment')}
            disabled={isSubmitting || teachersLoading || teachers.length === 0}
          >
            <option value="">
              {teachersLoading
                ? 'Loading teachers\u2026'
                : teachers.length === 0
                  ? 'No teachers available'
                  : 'Unassigned'}
            </option>
            {teachers.map((teacher) => (
              <option key={teacher.id ?? teacher.teacherId} value={teacher.id ?? teacher.teacherId}>
                {formatTeacherName(teacher)}
              </option>
            ))}
          </select>
          {fieldError('headOfDepartment') ? (
            <p className="form__error">{fieldError('headOfDepartment')}</p>
          ) : null}
          {relationHint(teachersLoading, teachers.length > 0, 'teachers')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="department-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="department-status"
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

        <div className="form__field department-form__field--full">
          <label className="form__label" htmlFor="department-description">
            Description
          </label>
          <textarea
            id="department-description"
            className="form__input"
            rows="3"
            value={values.description}
            onChange={setField('description')}
            placeholder="Optional description of this department"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="department-form__actions">
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

export default DepartmentForm