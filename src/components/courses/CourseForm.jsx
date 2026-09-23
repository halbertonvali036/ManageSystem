import { useState } from 'react'
import { COURSE_STATUS_LABELS } from '@/models/course'
import { formatDepartmentName } from '@/models/department'
import { formatTeacherName } from '@/models/teacher'
import { toCourseFormValues } from '@/utils/courseForm'

const COURSE_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]*$/

const EMPTY_VALUES = toCourseFormValues()

const MAX_CREDITS = 30

const toTeacherOptions = (teachers) =>
  teachers.map((teacher) => {
    const value =
      teacher?.teacherId ?? teacher?.id ?? (typeof teacher === 'string' ? teacher : '')
    const label =
      typeof teacher === 'string'
        ? teacher
        : teacher.fullName || formatTeacherName(teacher) || value
    return { value: String(value).trim(), label }
  })

function CourseForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Course',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
  teachers = [],
  teachersLoading = false,
  departments = [],
  departmentsLoading = false,
}) {
  const [values, setValues] = useState(() => toCourseFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const teacherOptions = toTeacherOptions(teachers)
  const teachersAvailable = teacherOptions.length > 0
  const departmentOptions = departments.map((department) =>
    typeof department === 'string' ? department : formatDepartmentName(department),
  )
  const departmentsAvailable = departmentOptions.length > 0

  const validate = (toValidate = values) => {
    const errors = {}

    const courseCode = toValidate.courseCode.trim()
    if (!courseCode) {
      errors.courseCode = 'Course code is required.'
    } else if (
      courseCode.length > 20 ||
      !COURSE_CODE_PATTERN.test(courseCode) ||
      courseCode.length < 2
    ) {
      errors.courseCode =
        'Enter a valid course code using letters, numbers or hyphens (e.g. CS-101).'
    }

    if (!toValidate.name.trim()) {
      errors.name = 'Course name is required.'
    }

    const credits = toValidate.credits.trim()
    if (!credits) {
      errors.credits = 'Credits are required.'
    } else if (!/^\d+$/.test(credits)) {
      errors.credits = 'Credits must be a whole number.'
    } else {
      const creditsValue = Number(credits)
      if (!Number.isInteger(creditsValue) || creditsValue < 1 || creditsValue > MAX_CREDITS) {
        errors.credits = `Credits must be between 1 and ${MAX_CREDITS}.`
      }
    }

    if (
      toValidate.department &&
      departmentsAvailable &&
      !departmentOptions.includes(toValidate.department)
    ) {
      errors.department = 'Select a valid department.'
    }

    if (
      toValidate.teacher &&
      teachersAvailable &&
      !teacherOptions.some((option) => option.value === toValidate.teacher)
    ) {
      errors.teacher = 'Select a valid teacher.'
    }

    if (!toValidate.status) {
      errors.status = 'Status is required.'
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
    <form className="course-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="course-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="course-courseCode">
            Course Code <span className="form__required">*</span>
          </label>
          <input
            id="course-courseCode"
            className={inputClass('courseCode')}
            type="text"
            autoComplete="off"
            value={values.courseCode}
            onChange={setField('courseCode')}
            onBlur={handleBlur('courseCode')}
            placeholder="e.g. CS-101"
            disabled={isSubmitting}
            aria-invalid={fieldError('courseCode') ? 'true' : 'false'}
          />
          {renderedError('courseCode')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="course-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="course-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
            aria-invalid={fieldError('status') ? 'true' : 'false'}
          >
            <option value="">Select status</option>
            {Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {renderedError('status')}
        </div>

        <div className="form__field course-form__field--full">
          <label className="form__label" htmlFor="course-name">
            Course Name <span className="form__required">*</span>
          </label>
          <input
            id="course-name"
            className={inputClass('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={setField('name')}
            onBlur={handleBlur('name')}
            placeholder="e.g. Introduction to Computer Science"
            disabled={isSubmitting}
            aria-invalid={fieldError('name') ? 'true' : 'false'}
          />
          {renderedError('name')}
        </div>

        <div className="form__field course-form__field--full">
          <label className="form__label" htmlFor="course-description">
            Description <span className="form__optional">Optional</span>
          </label>
          <textarea
            id="course-description"
            className={`form__input${fieldError('description') ? ' form__input--error' : ''}`}
            rows="3"
            autoComplete="off"
            value={values.description}
            onChange={setField('description')}
            onBlur={handleBlur('description')}
            placeholder="Brief description of the course"
            disabled={isSubmitting}
          />
          {renderedError('description')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="course-credits">
            Credits <span className="form__required">*</span>
          </label>
          <input
            id="course-credits"
            className={inputClass('credits')}
            type="number"
            inputMode="numeric"
            min="1"
            max={MAX_CREDITS}
            step="1"
            autoComplete="off"
            value={values.credits}
            onChange={setField('credits')}
            onBlur={handleBlur('credits')}
            placeholder="e.g. 3"
            disabled={isSubmitting}
            aria-invalid={fieldError('credits') ? 'true' : 'false'}
          />
          {renderedError('credits')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="course-department">
            Department <span className="form__optional">Optional</span>
          </label>
          <select
            id="course-department"
            className="form__input form__select"
            value={values.department}
            onChange={setField('department')}
            onBlur={handleBlur('department')}
            disabled={isSubmitting || departmentsLoading || !departmentsAvailable}
            aria-invalid={fieldError('department') ? 'true' : 'false'}
          >
            <option value="">
              {departmentsLoading
                ? 'Loading departments\u2026'
                : departmentsAvailable
                  ? 'Select department'
                  : 'No departments available yet'}
            </option>
            {departmentsAvailable
              ? departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))
              : null}
          </select>
          {departmentsLoading || departmentsAvailable ? (
            renderedError('department')
          ) : (
            <p className="form__hint">
              Department options will appear here once department data is
              available.
            </p>
          )}
        </div>

        <div className="form__field course-form__field--full">
          <label className="form__label" htmlFor="course-teacher">
            Assigned Teacher <span className="form__optional">Optional</span>
          </label>
          <select
            id="course-teacher"
            className="form__input form__select"
            value={values.teacher}
            onChange={setField('teacher')}
            onBlur={handleBlur('teacher')}
            disabled={isSubmitting || teachersLoading || !teachersAvailable}
            aria-invalid={fieldError('teacher') ? 'true' : 'false'}
          >
            <option value="">
              {teachersLoading
                ? 'Loading teachers\u2026'
                : teachersAvailable
                  ? 'Select teacher'
                  : 'No teachers available yet'}
            </option>
            {teachersAvailable
              ? teacherOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : null}
          </select>
          {teachersLoading || teachersAvailable ? (
            renderedError('teacher')
          ) : (
            <p className="form__hint">
              Teacher options will appear here once teacher records exist.
            </p>
          )}
        </div>
      </div>

      <div className="course-form__actions">
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

export default CourseForm