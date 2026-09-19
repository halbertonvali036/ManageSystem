import { useState } from 'react'
import { GRADE_ASSESSMENT_TYPE_LABELS } from '@/models/grade'
import { formatStudentName } from '@/models/student'
import { formatClassName } from '@/models/class'
import { toGradeFormValues, normalizeGradeNumber } from '@/utils/gradeForm'
import { toDateInputValue } from '@/utils/dateInput'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useStudents from '@/hooks/useStudents'

const ASSESSMENT_OPTIONS = [
  { value: '', label: 'Select a type' },
  ...Object.entries(GRADE_ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const EMPTY_VALUES = toGradeFormValues()

const formatCourseName = (course) =>
  course.name || course.courseName || course.courseCode || 'Course'

function GradeForm({
  initialValues = EMPTY_VALUES,
  submitLabel = 'Save Grade',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
}) {
  const { students, isLoading: studentsLoading } = useStudents()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()
  const [values, setValues] = useState(() => toGradeFormValues(initialValues))
  const [clientErrors, setClientErrors] = useState({})

  const studentsAvailable = students.length > 0
  const classesAvailable = classes.length > 0
  const coursesAvailable = courses.length > 0

  const validate = (toValidate = values) => {
    const errors = {}

    if (!toValidate.studentId && studentsAvailable) {
      errors.studentId = 'Select a student.'
    }
    if (!toValidate.classId && classesAvailable) {
      errors.classId = 'Select a class.'
    }
    if (!toValidate.courseId && coursesAvailable) {
      errors.courseId = 'Select a course.'
    }
    if (!toValidate.assessmentType) {
      errors.assessmentType = 'Select an assessment type.'
    }
    if (!toValidate.assessmentName.trim()) {
      errors.assessmentName = 'Assessment name is required.'
    }

    const score = normalizeGradeNumber(toValidate.score)
    if (score === null || score < 0) {
      errors.score = 'Enter a valid numeric score.'
    }

    const maximum = normalizeGradeNumber(toValidate.maximumScore)
    if (maximum === null || maximum <= 0) {
      errors.maximumScore = 'Enter a maximum score greater than 0.'
    } else if (score !== null && score > maximum) {
      errors.score = 'Score cannot exceed the maximum score.'
    }

    if (!toValidate.date) {
      errors.date = 'Select a date.'
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

  const relationHint = (loading, available, kind) =>
    !loading && !available ? (
      <p className="form__hint">No {kind} available yet.</p>
    ) : null

  return (
    <form className="grade-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="grade-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="grade-studentId">
            Student <span className="form__required">*</span>
          </label>
          <select
            id="grade-studentId"
            className="form__input form__select"
            value={values.studentId}
            onChange={setField('studentId')}
            disabled={isSubmitting || studentsLoading || students.length === 0}
          >
            <option value="">
              {studentsLoading
                ? 'Loading students\u2026'
                : students.length === 0
                  ? 'No students available'
                  : 'Select a student'}
            </option>
            {students.map((student) => (
              <option
                key={student.id ?? student.studentId}
                value={student.id ?? student.studentId}
              >
                {formatStudentName(student)}
              </option>
            ))}
          </select>
          {fieldError('studentId') ? (
            <p className="form__error">{fieldError('studentId')}</p>
          ) : null}
          {relationHint(studentsLoading, students.length > 0, 'students')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-classId">
            Class <span className="form__required">*</span>
          </label>
          <select
            id="grade-classId"
            className="form__input form__select"
            value={values.classId}
            onChange={setField('classId')}
            disabled={isSubmitting || classesLoading || classes.length === 0}
          >
            <option value="">
              {classesLoading
                ? 'Loading classes\u2026'
                : classes.length === 0
                  ? 'No classes available'
                  : 'Select a class'}
            </option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {formatClassName(item)}
              </option>
            ))}
          </select>
          {fieldError('classId') ? (
            <p className="form__error">{fieldError('classId')}</p>
          ) : null}
          {relationHint(classesLoading, classes.length > 0, 'classes')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-courseId">
            Course <span className="form__required">*</span>
          </label>
          <select
            id="grade-courseId"
            className="form__input form__select"
            value={values.courseId}
            onChange={setField('courseId')}
            disabled={isSubmitting || coursesLoading || courses.length === 0}
          >
            <option value="">
              {coursesLoading
                ? 'Loading courses\u2026'
                : courses.length === 0
                  ? 'No courses available'
                  : 'Select a course'}
            </option>
            {courses.map((course) => (
              <option
                key={course.id ?? course.courseCode}
                value={course.id ?? course.courseCode}
              >
                {formatCourseName(course)}
              </option>
            ))}
          </select>
          {fieldError('courseId') ? (
            <p className="form__error">{fieldError('courseId')}</p>
          ) : null}
          {relationHint(coursesLoading, courses.length > 0, 'courses')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-assessmentType">
            Assessment Type <span className="form__required">*</span>
          </label>
          <select
            id="grade-assessmentType"
            className="form__input form__select"
            value={values.assessmentType}
            onChange={setField('assessmentType')}
            disabled={isSubmitting}
          >
            {ASSESSMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('assessmentType') ? (
            <p className="form__error">{fieldError('assessmentType')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-assessmentName">
            Assessment Name <span className="form__required">*</span>
          </label>
          <input
            id="grade-assessmentName"
            className={inputClass('assessmentName')}
            type="text"
            autoComplete="off"
            value={values.assessmentName}
            onChange={setField('assessmentName')}
            onBlur={handleBlur('assessmentName')}
            placeholder="e.g. Chapter 4 Quiz"
            disabled={isSubmitting}
          />
          {fieldError('assessmentName') ? (
            <p className="form__error">{fieldError('assessmentName')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-score">
            Score <span className="form__required">*</span>
          </label>
          <input
            id="grade-score"
            className={inputClass('score')}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={values.score}
            onChange={setField('score')}
            onBlur={handleBlur('score')}
            placeholder="e.g. 18"
            disabled={isSubmitting}
          />
          {fieldError('score') ? (
            <p className="form__error">{fieldError('score')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-maximumScore">
            Maximum Score <span className="form__required">*</span>
          </label>
          <input
            id="grade-maximumScore"
            className={inputClass('maximumScore')}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={values.maximumScore}
            onChange={setField('maximumScore')}
            onBlur={handleBlur('maximumScore')}
            placeholder="e.g. 20"
            disabled={isSubmitting}
          />
          {fieldError('maximumScore') ? (
            <p className="form__error">{fieldError('maximumScore')}</p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="grade-date">
            Date <span className="form__required">*</span>
          </label>
          <input
            id="grade-date"
            className={inputClass('date')}
            type="date"
            max={toDateInputValue(new Date())}
            value={values.date}
            onChange={setField('date')}
            onBlur={handleBlur('date')}
            disabled={isSubmitting}
          />
          {fieldError('date') ? (
            <p className="form__error">{fieldError('date')}</p>
          ) : null}
        </div>

        <div className="form__field grade-form__field--full">
          <label className="form__label" htmlFor="grade-notes">
            Notes
          </label>
          <textarea
            id="grade-notes"
            className="form__input"
            rows="3"
            value={values.notes}
            onChange={setField('notes')}
            placeholder="Optional notes for this grade record"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grade-form__actions">
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

export default GradeForm