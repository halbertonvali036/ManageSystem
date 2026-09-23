import { useState } from 'react'
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
} from '@/models/assessment'
import {
  toAssessmentFormValues,
  toAssessmentPayload,
} from '@/utils/assessmentForm'

const STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  ...Object.entries(ASSESSMENT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  ...Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const EMPTY_VALUES = toAssessmentFormValues()

const MAX_SCORE_LIMIT = 1000

const toCourseId = (course) => course?.id ?? course?.courseCode ?? course
const toClassId = (classRecord) =>
  classRecord?.id ?? classRecord?.classCode ?? classRecord

const toCourseLabel = (course) =>
  typeof course === 'string'
    ? course
    : course.name || course.courseName || toCourseId(course)

const toClassLabel = (classRecord) =>
  typeof classRecord === 'string'
    ? classRecord
    : classRecord.name ||
      classRecord.className ||
      toClassId(classRecord)

const resolveClassCourseId = (classRecord) =>
  classRecord.courseId ??
  (typeof classRecord.course === 'object' && classRecord.course
    ? classRecord.course.id
    : null) ??
  toCourseId(classRecord.course)

function AssessmentForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Create Assessment',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
  courses = [],
  classes = [],
  coursesLoading = false,
  classesLoading = false,
}) {
  const [values, setValues] = useState(() => toAssessmentFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const courseOptions = courses.map((course) => ({
    value: String(toCourseId(course)),
    label: toCourseLabel(course),
  }))
  const classOptions = classes.map((classRecord) => ({
    value: String(toClassId(classRecord)),
    label: toClassLabel(classRecord),
  }))

  const coursesAvailable = courseOptions.length > 0
  const classesAvailable = classOptions.length > 0

  const displayedClassOptions = values.courseId
    ? classOptions.filter(
        (classOption) => {
          const classRecord = classes.find(
            (classItem) => String(toClassId(classItem)) === classOption.value,
          )
          return (
            classRecord &&
            String(resolveClassCourseId(classRecord)) === String(values.courseId)
          )
        },
      )
    : classOptions

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.title.trim()) {
      errors.title = 'Assessment title is required.'
    }

    if (!toValidate.type) {
      errors.type = 'Select an assessment type.'
    }

    if (!toValidate.date) {
      errors.date = 'Assessment date is required.'
    }

    const maximumScore = toValidate.maximumScore.trim()
    if (maximumScore) {
      if (!/^\d+$/.test(maximumScore)) {
        errors.maximumScore = 'Maximum score must be a whole number.'
      } else {
        const maximumScoreValue = Number(maximumScore)
        if (
          !Number.isInteger(maximumScoreValue) ||
          maximumScoreValue < 1 ||
          maximumScoreValue > MAX_SCORE_LIMIT
        ) {
          errors.maximumScore = `Maximum score must be between 1 and ${MAX_SCORE_LIMIT}.`
        }
      }
    }

    if (
      toValidate.courseId &&
      coursesAvailable &&
      !courseOptions.some(
        (option) => String(option.value) === String(toValidate.courseId),
      )
    ) {
      errors.courseId = 'Select a valid course.'
    } else if (coursesAvailable && !toValidate.courseId) {
      errors.courseId = 'Course is required.'
    }

    if (
      toValidate.classId &&
      classesAvailable &&
      !classOptions.some(
        (option) => String(option.value) === String(toValidate.classId),
      )
    ) {
      errors.classId = 'Select a valid class.'
    }

    if (!toValidate.status) {
      errors.status = 'Select a status.'
    }

    return errors
  }

  const setField = (field) => (event) => {
    const nextValue = event.target.value
    setValues((prev) => {
      if (field === 'courseId') {
        return { ...prev, courseId: nextValue, classId: '' }
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
    onSubmit(toAssessmentPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const renderedError = (field) =>
    fieldError(field) ? <p className="form__error">{fieldError(field)}</p> : null

  const courseSelectDisabled =
    isSubmitting || coursesLoading || !coursesAvailable
  const classSelectDisabled =
    isSubmitting ||
    classesLoading ||
    !classesAvailable ||
    !values.courseId

  return (
    <form className="assessment-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="assessment-form__grid">
        <div className="form__field assessment-form__field--full">
          <label className="form__label" htmlFor="assessment-title">
            Assessment Title <span className="form__required">*</span>
          </label>
          <input
            id="assessment-title"
            className={inputClass('title')}
            type="text"
            autoComplete="off"
            value={values.title}
            onChange={setField('title')}
            onBlur={handleBlur('title')}
            placeholder="e.g. Midterm Examination - Algorithms"
            disabled={isSubmitting}
            aria-invalid={fieldError('title') ? 'true' : 'false'}
          />
          {renderedError('title')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="assessment-type">
            Type <span className="form__required">*</span>
          </label>
          <select
            id="assessment-type"
            className="form__input form__select"
            value={values.type}
            onChange={setField('type')}
            disabled={isSubmitting}
            aria-invalid={fieldError('type') ? 'true' : 'false'}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderedError('type')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="assessment-maximumScore">
            Maximum Score <span className="form__optional">Optional</span>
          </label>
          <input
            id="assessment-maximumScore"
            className={inputClass('maximumScore')}
            type="number"
            inputMode="numeric"
            min="1"
            max={MAX_SCORE_LIMIT}
            step="1"
            autoComplete="off"
            value={values.maximumScore}
            onChange={setField('maximumScore')}
            onBlur={handleBlur('maximumScore')}
            placeholder="e.g. 100"
            disabled={isSubmitting}
            aria-invalid={fieldError('maximumScore') ? 'true' : 'false'}
          />
          {renderedError('maximumScore')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="assessment-date">
            Date <span className="form__required">*</span>
          </label>
          <input
            id="assessment-date"
            className={inputClass('date')}
            type="date"
            autoComplete="off"
            value={values.date}
            onChange={setField('date')}
            onBlur={handleBlur('date')}
            disabled={isSubmitting}
            aria-invalid={fieldError('date') ? 'true' : 'false'}
          />
          {renderedError('date')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="assessment-courseId">
            Course <span className="form__required">*</span>
          </label>
          <select
            id="assessment-courseId"
            className="form__input form__select"
            value={values.courseId}
            onChange={setField('courseId')}
            onBlur={handleBlur('courseId')}
            disabled={courseSelectDisabled}
            aria-invalid={fieldError('courseId') ? 'true' : 'false'}
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
            renderedError('courseId')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="assessment-classId">
            Class <span className="form__optional">Optional</span>
          </label>
          <select
            id="assessment-classId"
            className="form__input form__select"
            value={values.classId}
            onChange={setField('classId')}
            disabled={classSelectDisabled}
            aria-invalid={fieldError('classId') ? 'true' : 'false'}
          >
            {values.courseId ? (
              classesLoading ? (
                <option value="">Loading classes&hellip;</option>
              ) : displayedClassOptions.length > 0 ? (
                <>
                  <option value="">Select class</option>
                  {displayedClassOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">
                  No classes available for this course
                </option>
              )
            ) : (
              <option value=""></option>
            )}
          </select>
          {values.courseId && !classesLoading && classesAvailable ? (
            <p className="form__hint">
              Select a class to narrow the assessment audience.
            </p>
          ) : null}
          {renderedError('classId')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="assessment-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="assessment-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
            aria-invalid={fieldError('status') ? 'true' : 'false'}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderedError('status')}
        </div>

        <div className="form__field assessment-form__field--full">
          <label className="form__label" htmlFor="assessment-description">
            Description <span className="form__optional">Optional</span>
          </label>
          <textarea
            id="assessment-description"
            className="form__input"
            rows="3"
            value={values.description}
            onChange={setField('description')}
            placeholder="Optional description of this assessment"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="assessment-form__actions">
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

export default AssessmentForm