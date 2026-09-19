import { useState } from 'react'
import { CLASS_STATUS_LABELS } from '@/models/class'
import { formatTeacherName } from '@/models/teacher'
import { extractClassPayload, toClassFormValues } from '@/utils/classForm'

const CLASS_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]*$/

const EMPTY_VALUES = toClassFormValues()

const MAX_CAPACITY = 500

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number)
  if (hours == null || minutes == null || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  return hours * 60 + minutes
}

const toCourseOptions = (courses) =>
  courses.map((course) => {
    const value =
      course?.courseCode ?? course?.id ?? (typeof course === 'string' ? course : '')
    const label =
      typeof course === 'string'
        ? course
        : course.name || course.courseName || value
    return { value: String(value).trim(), label }
  })

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

function ClassForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Create Class',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
  courses = [],
  teachers = [],
  coursesLoading = false,
  teachersLoading = false,
}) {
  const [values, setValues] = useState(() => toClassFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const courseOptions = toCourseOptions(courses)
  const teacherOptions = toTeacherOptions(teachers)
  const coursesAvailable = courseOptions.length > 0
  const teachersAvailable = teacherOptions.length > 0

  const validate = (toValidate = values) => {
    const errors = {}

    const classCode = toValidate.classCode.trim()
    if (!classCode) {
      errors.classCode = 'Class code is required.'
    } else if (
      classCode.length > 20 ||
      classCode.length < 2 ||
      !CLASS_CODE_PATTERN.test(classCode)
    ) {
      errors.classCode =
        'Enter a valid class code using letters, numbers or hyphens (e.g. CS-101-A).'
    }

    if (!toValidate.name.trim()) {
      errors.name = 'Class name is required.'
    }

    if (
      toValidate.course &&
      coursesAvailable &&
      !courseOptions.some((option) => option.value === toValidate.course)
    ) {
      errors.course = 'Select a valid course.'
    } else if (!toValidate.course && coursesAvailable) {
      errors.course = 'Course is required.'
    }

    if (!toValidate.academicYear.trim()) {
      errors.academicYear = 'Academic year is required.'
    }

    if (!toValidate.semester.trim()) {
      errors.semester = 'Semester is required.'
    }

    if (
      toValidate.teacher &&
      teachersAvailable &&
      !teacherOptions.some((option) => option.value === toValidate.teacher)
    ) {
      errors.teacher = 'Select a valid teacher.'
    } else if (!toValidate.teacher && teachersAvailable) {
      errors.teacher = 'Teacher is required.'
    }

    const capacity = toValidate.capacity.trim()
    if (!capacity) {
      errors.capacity = 'Capacity is required.'
    } else if (!/^\d+$/.test(capacity)) {
      errors.capacity = 'Capacity must be a whole number.'
    } else {
      const capacityValue = Number(capacity)
      if (
        !Number.isInteger(capacityValue) ||
        capacityValue < 1 ||
        capacityValue > MAX_CAPACITY
      ) {
        errors.capacity = `Capacity must be between 1 and ${MAX_CAPACITY}.`
      }
    }

    if (!toValidate.startTime) {
      errors.startTime = 'Start time is required.'
    }

    if (!toValidate.endTime) {
      errors.endTime = 'End time is required.'
    } else {
      const startMinutes = toMinutes(toValidate.startTime)
      const endMinutes = toMinutes(toValidate.endTime)
      if (startMinutes != null && endMinutes != null && endMinutes <= startMinutes) {
        errors.endTime = 'End time must be after start time.'
      }
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
    onSubmit(extractClassPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const renderedError = (field) =>
    fieldError(field) ? <p className="form__error">{fieldError(field)}</p> : null

  const courseSelectDisabled = isSubmitting || coursesLoading || !coursesAvailable
  const teacherSelectDisabled = isSubmitting || teachersLoading || !teachersAvailable

  return (
    <form className="class-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="class-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="class-classCode">
            Class Code <span className="form__required">*</span>
          </label>
          <input
            id="class-classCode"
            className={inputClass('classCode')}
            type="text"
            autoComplete="off"
            value={values.classCode}
            onChange={setField('classCode')}
            onBlur={handleBlur('classCode')}
            placeholder="e.g. CS-101-A"
            disabled={isSubmitting}
          />
          {renderedError('classCode')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="class-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
          >
            <option value="">Select status</option>
            {Object.entries(CLASS_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {renderedError('status')}
        </div>

        <div className="form__field class-form__field--full">
          <label className="form__label" htmlFor="class-name">
            Class Name <span className="form__required">*</span>
          </label>
          <input
            id="class-name"
            className={inputClass('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={setField('name')}
            onBlur={handleBlur('name')}
            placeholder="e.g. Introduction to Computer Science - Group A"
            disabled={isSubmitting}
          />
          {renderedError('name')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-course">
            Course <span className="form__required">*</span>
          </label>
          <select
            id="class-course"
            className="form__input form__select"
            value={values.course}
            onChange={setField('course')}
            onBlur={handleBlur('course')}
            disabled={courseSelectDisabled}
          >
            {coursesLoading ? (
              <option value="">Loading courses&hellip;</option>
            ) : coursesAvailable ? (
              <>
                <option value="">Select course</option>
                {courseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No courses available yet</option>
            )}
          </select>
          {!coursesLoading && !coursesAvailable ? (
            <p className="form__hint">
              Course options will appear here once course records exist.
            </p>
          ) : (
            renderedError('course')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-teacher">
            Teacher <span className="form__required">*</span>
          </label>
          <select
            id="class-teacher"
            className="form__input form__select"
            value={values.teacher}
            onChange={setField('teacher')}
            onBlur={handleBlur('teacher')}
            disabled={teacherSelectDisabled}
          >
            {teachersLoading ? (
              <option value="">Loading teachers&hellip;</option>
            ) : teachersAvailable ? (
              <>
                <option value="">Select teacher</option>
                {teacherOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No teachers available yet</option>
            )}
          </select>
          {!teachersLoading && !teachersAvailable ? (
            <p className="form__hint">
              Teacher options will appear here once teacher records exist.
            </p>
          ) : (
            renderedError('teacher')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-academicYear">
            Academic Year <span className="form__required">*</span>
          </label>
          <input
            id="class-academicYear"
            className={inputClass('academicYear')}
            type="text"
            autoComplete="off"
            value={values.academicYear}
            onChange={setField('academicYear')}
            onBlur={handleBlur('academicYear')}
            placeholder="e.g. 2025-2026"
            disabled={isSubmitting}
          />
          {renderedError('academicYear')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-semester">
            Semester <span className="form__required">*</span>
          </label>
          <input
            id="class-semester"
            className={inputClass('semester')}
            type="text"
            autoComplete="off"
            value={values.semester}
            onChange={setField('semester')}
            onBlur={handleBlur('semester')}
            placeholder="e.g. Fall 2026"
            disabled={isSubmitting}
          />
          {renderedError('semester')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-room">
            Room
          </label>
          <input
            id="class-room"
            className={inputClass('room')}
            type="text"
            autoComplete="off"
            value={values.room}
            onChange={setField('room')}
            onBlur={handleBlur('room')}
            placeholder="e.g. B-204"
            disabled={isSubmitting}
          />
          {renderedError('room')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-capacity">
            Capacity <span className="form__required">*</span>
          </label>
          <input
            id="class-capacity"
            className={inputClass('capacity')}
            type="number"
            inputMode="numeric"
            min="1"
            max={MAX_CAPACITY}
            step="1"
            autoComplete="off"
            value={values.capacity}
            onChange={setField('capacity')}
            onBlur={handleBlur('capacity')}
            placeholder="e.g. 40"
            disabled={isSubmitting}
          />
          {renderedError('capacity')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-startTime">
            Start Time <span className="form__required">*</span>
          </label>
          <input
            id="class-startTime"
            className={inputClass('startTime')}
            type="time"
            autoComplete="off"
            value={values.startTime}
            onChange={setField('startTime')}
            onBlur={handleBlur('startTime')}
            disabled={isSubmitting}
          />
          {renderedError('startTime')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="class-endTime">
            End Time <span className="form__required">*</span>
          </label>
          <input
            id="class-endTime"
            className={inputClass('endTime')}
            type="time"
            autoComplete="off"
            value={values.endTime}
            onChange={setField('endTime')}
            onBlur={handleBlur('endTime')}
            disabled={isSubmitting}
          />
          {renderedError('endTime')}
        </div>

        <div className="form__field class-form__field--full">
          <label className="form__label" htmlFor="class-days">
            Days / Schedule
          </label>
          <input
            id="class-days"
            className={inputClass('days')}
            type="text"
            autoComplete="off"
            value={values.days}
            onChange={setField('days')}
            onBlur={handleBlur('days')}
            placeholder="e.g. Mon/Wed/Fri"
            disabled={isSubmitting}
          />
          <p className="form__hint">
            Combined with the times above and stored in the schedule, e.g.
            Mon/Wed 09:00&ndash;10:30.
          </p>
          {renderedError('days')}
        </div>
      </div>

      <div className="class-form__actions">
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
              Creating&hellip;
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}

export default ClassForm