import { useState } from 'react'
import useSemesters from '@/hooks/useSemesters'
import {
  ANNOUNCEMENT_AUDIENCE,
  ANNOUNCEMENT_AUDIENCE_OPTIONS,
  ANNOUNCEMENT_STATUS_LABELS,
} from '@/models/announcement'
import {
  EMPTY_ANNOUNCEMENT_FORM_VALUES,
  extractAnnouncementPayload,
  toAnnouncementFormValues,
  validateAnnouncement,
} from '@/utils/announcementForm'

const AUDIENCE_HINTS = {
  [ANNOUNCEMENT_AUDIENCE.ALL]: 'all users',
  [ANNOUNCEMENT_AUDIENCE.STUDENTS]: 'all students',
  [ANNOUNCEMENT_AUDIENCE.TEACHERS]: 'all teachers',
}

const toYearOptions = (academicYears) =>
  academicYears.map((academicYear) => ({
    value: academicYear?.id ?? academicYear?.name ?? academicYear?.academicYear ?? '',
    label: academicYear?.name || academicYear?.academicYear || academicYear?.id || '—',
  }))

const toSemesterOptions = (semesters) =>
  semesters.map((semester) => ({
    value: semester?.id ?? semester?.name ?? semester?.semester ?? '',
    label: semester?.name || semester?.semester || semester?.id || '—',
  }))

const toClassOptions = (classes) =>
  classes.map((classRecord) => {
    const value = classRecord?.id ?? classRecord?.classCode ?? ''
    const label =
      classRecord?.name || classRecord?.classCode || classRecord?.id || '—'
    return { value: String(value), label }
  })

const toCourseOptions = (courses) =>
  courses.map((course) => {
    const value =
      course?.id ?? course?.courseCode ?? (typeof course === 'string' ? course : '')
    const label =
      typeof course === 'string'
        ? course
        : course.name || course.courseName || value
    return { value: String(value), label }
  })

function AnnouncementForm({
  initialValues = EMPTY_ANNOUNCEMENT_FORM_VALUES,
  submitLabel = 'Create Announcement',
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  serverFieldErrors,
  academicYears = [],
  academicYearsLoading = false,
  classes = [],
  classesLoading = false,
  courses = [],
  coursesLoading = false,
}) {
  const [values, setValues] = useState(() =>
    toAnnouncementFormValues(initialValues),
  )
  const [clientErrors, setClientErrors] = useState({})

  const yearOptions = toYearOptions(academicYears)
  const yearsAvailable = yearOptions.length > 0

  const selectedAcademicYear = academicYears.find(
    (academicYear) =>
      String(academicYear.id) === String(values.academicYearId),
  )
  const { semesters, isLoading: semestersLoading } = useSemesters(
    selectedAcademicYear?.id,
  )
  const semesterOptions = toSemesterOptions(semesters)
  const semestersAvailable = semesterOptions.length > 0

  const classOptions = toClassOptions(classes)
  const classesAvailable = classOptions.length > 0
  const courseOptions = toCourseOptions(courses)
  const coursesAvailable = courseOptions.length > 0

  const audience = String(values.audience)
  const isClassAudience = audience === ANNOUNCEMENT_AUDIENCE.CLASS
  const isCourseAudience = audience === ANNOUNCEMENT_AUDIENCE.COURSE

  const validate = (toValidate = values) =>
    validateAnnouncement(toValidate, {
      classOptions,
      courseOptions,
      yearOptions,
      semesterOptions,
    })

  const setField = (field) => (event) => {
    const nextValue = event.target.value
    setValues((prev) => {
      if (field === 'audience') {
        return {
          ...prev,
          audience: nextValue,
          classId: '',
          courseId: '',
        }
      }
      if (field === 'academicYearId') {
        return { ...prev, academicYearId: nextValue, semesterId: '' }
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
    onSubmit(extractAnnouncementPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const renderedError = (field) =>
    fieldError(field) ? <p className="form__error">{fieldError(field)}</p> : null

  const yearSelectDisabled = isSubmitting || academicYearsLoading
  const semesterSelectDisabled =
    isSubmitting || semestersLoading || !String(values.academicYearId)
  const classSelectDisabled =
    isSubmitting ||
    classesLoading ||
    !classesAvailable ||
    !isClassAudience
  const courseSelectDisabled =
    isSubmitting ||
    coursesLoading ||
    !coursesAvailable ||
    !isCourseAudience

  const audienceHint = AUDIENCE_HINTS[audience]

  return (
    <form className="announcement-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="announcement-form__grid">
        <div className="form__field announcement-form__field--full">
          <label className="form__label" htmlFor="announcement-title">
            Title <span className="form__required">*</span>
          </label>
          <input
            id="announcement-title"
            className={inputClass('title')}
            type="text"
            autoComplete="off"
            value={values.title}
            onChange={setField('title')}
            onBlur={handleBlur('title')}
            placeholder="e.g. End of Term Examination Timetable"
            disabled={isSubmitting}
          />
          {renderedError('title')}
        </div>

        <div className="form__field announcement-form__field--full">
          <label className="form__label" htmlFor="announcement-message">
            Message <span className="form__required">*</span>
          </label>
          <textarea
            id="announcement-message"
            className={inputClass('message')}
            rows={5}
            autoComplete="off"
            value={values.message}
            onChange={setField('message')}
            onBlur={handleBlur('message')}
            placeholder="Write the announcement body here&hellip;"
            disabled={isSubmitting}
          />
          {renderedError('message')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="announcement-audience">
            Audience <span className="form__required">*</span>
          </label>
          <select
            id="announcement-audience"
            className="form__input form__select"
            value={values.audience}
            onChange={setField('audience')}
            onBlur={handleBlur('audience')}
            disabled={isSubmitting}
          >
            <option value="">Select audience</option>
            {ANNOUNCEMENT_AUDIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderedError('audience')}
        </div>

        {isClassAudience ? (
          <div className="form__field">
            <label className="form__label" htmlFor="announcement-classId">
              Target Class <span className="form__required">*</span>
            </label>
            <select
              id="announcement-classId"
              className="form__input form__select"
              value={values.classId}
              onChange={setField('classId')}
              onBlur={handleBlur('classId')}
              disabled={classSelectDisabled}
            >
              {classesLoading ? (
                <option value="">Loading classes&hellip;</option>
              ) : classesAvailable ? (
                <>
                  <option value="">Select class</option>
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No classes available yet</option>
              )}
            </select>
            {!classesLoading && !classesAvailable ? (
              <p className="form__hint">
                Class options will appear here once class records exist.
              </p>
            ) : (
              renderedError('classId')
            )}
          </div>
        ) : null}

        {isCourseAudience ? (
          <div className="form__field">
            <label className="form__label" htmlFor="announcement-courseId">
              Target Course <span className="form__required">*</span>
            </label>
            <select
              id="announcement-courseId"
              className="form__input form__select"
              value={values.courseId}
              onChange={setField('courseId')}
              onBlur={handleBlur('courseId')}
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
              renderedError('courseId')
            )}
          </div>
        ) : null}

        {audience && !isClassAudience && !isCourseAudience ? (
          <div className="form__field">
            <p className="form__hint announcement-form__hint">
              This announcement reaches {audienceHint}.
            </p>
          </div>
        ) : null}

        <div className="form__field">
          <label className="form__label" htmlFor="announcement-academicYearId">
            Academic Year
          </label>
          <select
            id="announcement-academicYearId"
            className="form__input form__select"
            value={values.academicYearId}
            onChange={setField('academicYearId')}
            onBlur={handleBlur('academicYearId')}
            disabled={yearSelectDisabled}
          >
            {academicYearsLoading ? (
              <option value="">Loading academic years&hellip;</option>
            ) : yearsAvailable ? (
              <>
                <option value="">Not specified</option>
                {yearOptions.map((option) => (
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
            renderedError('academicYearId')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="announcement-semesterId">
            Semester
          </label>
          <select
            id="announcement-semesterId"
            className="form__input form__select"
            value={values.semesterId}
            onChange={setField('semesterId')}
            onBlur={handleBlur('semesterId')}
            disabled={semesterSelectDisabled}
          >
            {values.academicYearId ? (
              semestersLoading ? (
                <option value="">Loading semesters&hellip;</option>
              ) : semestersAvailable ? (
                <>
                  <option value="">Not specified</option>
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
              <option value="">Select academic year first</option>
            )}
          </select>
          {values.academicYearId &&
          !semestersLoading &&
          yearsAvailable &&
          !semestersAvailable ? (
            <p className="form__hint">
              No semester records exist for this academic year yet.
            </p>
          ) : (
            renderedError('semesterId')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="announcement-publishDate">
            Publish Date <span className="form__required">*</span>
          </label>
          <input
            id="announcement-publishDate"
            className={inputClass('publishDate')}
            type="date"
            autoComplete="off"
            value={values.publishDate}
            onChange={setField('publishDate')}
            onBlur={handleBlur('publishDate')}
            disabled={isSubmitting}
          />
          {renderedError('publishDate')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="announcement-expiryDate">
            Expiry Date
          </label>
          <input
            id="announcement-expiryDate"
            className={inputClass('expiryDate')}
            type="date"
            autoComplete="off"
            value={values.expiryDate}
            onChange={setField('expiryDate')}
            onBlur={handleBlur('expiryDate')}
            disabled={isSubmitting}
          />
          {renderedError('expiryDate')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="announcement-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="announcement-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            onBlur={handleBlur('status')}
            disabled={isSubmitting}
          >
            <option value="">Select status</option>
            {Object.entries(ANNOUNCEMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {renderedError('status')}
        </div>
      </div>

      <div className="announcement-form__actions">
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

export default AnnouncementForm