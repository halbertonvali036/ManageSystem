import { useState } from 'react'
import useSemesters from '@/hooks/useSemesters'
import { CLASS_STATUS_LABELS } from '@/models/class'
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

const toAcademicYearValue = (academicYear) =>
  academicYear?.name ??
  academicYear?.academicYear ??
  (typeof academicYear === 'string' ? academicYear : academicYear?.id) ??
  ''

const toSemesterValue = (semester) =>
  semester?.name ??
  semester?.semester ??
  (typeof semester === 'string' ? semester : semester?.id) ??
  ''

function ClassForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Create Class',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
  courses = [],
  academicYears = [],
  coursesLoading = false,
  academicYearsLoading = false,
}) {
  const [values, setValues] = useState(() => toClassFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const courseOptions = toCourseOptions(courses)
  const coursesAvailable = courseOptions.length > 0

  const academicYearOptions = academicYears.map((academicYear) => ({
    value: String(toAcademicYearValue(academicYear)).trim(),
    label: toAcademicYearValue(academicYear) || '—',
  }))
  const yearsAvailable = academicYearOptions.length > 0

  const selectedAcademicYear = academicYears.find(
    (academicYear) =>
      String(toAcademicYearValue(academicYear)).trim() === values.academicYear,
  )
  const selectedYearId = selectedAcademicYear?.id ?? null
  const { semesters, isLoading: semestersLoading } = useSemesters(selectedYearId)
  const semesterOptions = semesters.map((semester) => ({
    value: String(toSemesterValue(semester)).trim(),
    label: toSemesterValue(semester) || '—',
  }))
  const semestersAvailable = semesterOptions.length > 0

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

    if (
      toValidate.academicYear &&
      yearsAvailable &&
      !academicYearOptions.some(
        (option) => option.value === String(toValidate.academicYear).trim(),
      )
    ) {
      errors.academicYear = 'Select a valid academic year.'
    } else if (yearsAvailable && !toValidate.academicYear) {
      errors.academicYear = 'Academic year is required.'
    }

    if (
      toValidate.semester &&
      semestersAvailable &&
      !semesterOptions.some(
        (option) => option.value === String(toValidate.semester).trim(),
      )
    ) {
      errors.semester = 'Select a valid semester.'
    } else if (
      toValidate.academicYear &&
      !toValidate.semester &&
      semestersAvailable
    ) {
      errors.semester = 'Semester is required.'
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
    const nextValue = event.target.value
    setValues((prev) => {
      if (field === 'academicYear') {
        return { ...prev, academicYear: nextValue, semester: '' }
      }
      return { ...prev, [field]: nextValue }
    })
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

  const ariaInvalid = (field) => (fieldError(field) ? 'true' : 'false')

  const courseSelectDisabled = isSubmitting || coursesLoading || !coursesAvailable
  const academicYearSelectDisabled =
    isSubmitting || academicYearsLoading || !yearsAvailable
  const semesterSelectDisabled =
    isSubmitting || semestersLoading || !values.academicYear

  return (
    <form className="class-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <fieldset className="form__section">
        <legend className="form__section-title">Identity</legend>

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
              aria-invalid={ariaInvalid('classCode')}
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
              aria-invalid={ariaInvalid('status')}
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
              aria-invalid={ariaInvalid('name')}
            />
            {renderedError('name')}
          </div>
        </div>
      </fieldset>

      <fieldset className="form__section">
        <legend className="form__section-title">Course assignment</legend>

        <div className="class-form__grid">
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
              aria-invalid={ariaInvalid('course')}
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
            <label className="form__label" htmlFor="class-academicYear">
              Academic Year <span className="form__required">*</span>
            </label>
            <select
              id="class-academicYear"
              className="form__input form__select"
              value={values.academicYear}
              onChange={setField('academicYear')}
              onBlur={handleBlur('academicYear')}
              disabled={academicYearSelectDisabled}
              aria-invalid={ariaInvalid('academicYear')}
            >
              {academicYearsLoading ? (
                <option value="">Loading academic years&hellip;</option>
              ) : yearsAvailable ? (
                <>
                  <option value="">Select academic year</option>
                  {academicYearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No academic years available yet</option>
              )}
            </select>
            {!academicYearsLoading && !yearsAvailable ? (
              <p className="form__hint">
                Academic year options will appear here once academic year records
                exist.
              </p>
            ) : (
              renderedError('academicYear')
            )}
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="class-semester">
              Semester <span className="form__required">*</span>
            </label>
            <select
              id="class-semester"
              className="form__input form__select"
              value={values.semester}
              onChange={setField('semester')}
              onBlur={handleBlur('semester')}
              disabled={semesterSelectDisabled}
              aria-invalid={ariaInvalid('semester')}
            >
              {values.academicYear ? (
                semestersLoading ? (
                  <option value="">Loading semesters&hellip;</option>
                ) : semestersAvailable ? (
                  <>
                    <option value="">Select semester</option>
                    {semesterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">No semesters for this academic year</option>
                )
              ) : (
                <option value=""></option>
              )}
            </select>
            {values.academicYear &&
            !semestersLoading &&
            yearsAvailable &&
            !semestersAvailable ? (
              <p className="form__hint">
                No semester records exist for this academic year yet. Add
                semesters from the academic year details page first.
              </p>
            ) : (
              renderedError('semester')
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="form__section">
        <legend className="form__section-title">Schedule</legend>

        <div className="class-form__grid">
          <div className="form__field">
            <label className="form__label" htmlFor="class-room">
              Room <span className="form__optional">Optional</span>
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
              aria-invalid={ariaInvalid('room')}
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
              aria-invalid={ariaInvalid('capacity')}
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
              aria-invalid={ariaInvalid('startTime')}
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
              aria-invalid={ariaInvalid('endTime')}
            />
            {renderedError('endTime')}
          </div>

          <div className="form__field class-form__field--full">
            <label className="form__label" htmlFor="class-days">
              Days / Schedule <span className="form__optional">Optional</span>
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
              aria-invalid={ariaInvalid('days')}
            />
            <p className="form__hint">
              Combined with the times above and stored in the schedule, e.g.
              Mon/Wed 09:00&ndash;10:30.
            </p>
            {renderedError('days')}
          </div>
        </div>
      </fieldset>

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