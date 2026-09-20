import { useState } from 'react'
import useSemesters from '@/hooks/useSemesters'
import { SCHEDULE_DAY_OPTIONS, SCHEDULE_STATUS_LABELS } from '@/models/schedule'
import {
  EMPTY_SCHEDULE_ENTRY_FORM_VALUES,
  extractScheduleEntryPayload,
  toScheduleEntryFormValues,
  validateScheduleEntry,
} from '@/utils/scheduleEntryForm'

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

const toTeacherOptions = (teachers) =>
  teachers.map((teacher) => {
    const value =
      teacher?.id ?? teacher?.teacherId ?? (typeof teacher === 'string' ? teacher : '')
    const label =
      typeof teacher === 'string'
        ? teacher
        : teacher.fullName || teacher.name || teacher.teacherId || value
    return { value: String(value), label }
  })

function ScheduleEntryForm({
  initialValues = EMPTY_SCHEDULE_ENTRY_FORM_VALUES,
  submitLabel = 'Create Schedule Entry',
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
  teachers = [],
  teachersLoading = false,
}) {
  const [values, setValues] = useState(() =>
    toScheduleEntryFormValues(initialValues),
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
  const teacherOptions = toTeacherOptions(teachers)
  const teachersAvailable = teacherOptions.length > 0

  const validate = (toValidate = values) =>
    validateScheduleEntry(toValidate, {
      classOptions,
      courseOptions,
      teacherOptions,
      yearOptions,
      semesterOptions,
    })

  const setField = (field) => (event) => {
    const nextValue = event.target.value
    setValues((prev) => {
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
    onSubmit(extractScheduleEntryPayload(values))
  }

  const fieldError = (field) => clientErrors[field] ?? serverFieldErrors[field]

  const inputClass = (field) =>
    `form__input${fieldError(field) ? ' form__input--error' : ''}`

  const renderedError = (field) =>
    fieldError(field) ? <p className="form__error">{fieldError(field)}</p> : null

  const yearSelectDisabled =
    isSubmitting || academicYearsLoading || !yearsAvailable
  const semesterSelectDisabled =
    isSubmitting || semestersLoading || !values.academicYearId
  const classSelectDisabled = isSubmitting || classesLoading || !classesAvailable
  const courseSelectDisabled = isSubmitting || coursesLoading || !coursesAvailable
  const teacherSelectDisabled =
    isSubmitting || teachersLoading || !teachersAvailable

  return (
    <form className="schedule-entry-form" onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <div className="form__error-area" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="schedule-entry-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="schedule-academicYearId">
            Academic Year <span className="form__required">*</span>
          </label>
          <select
            id="schedule-academicYearId"
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
                <option value="">Select academic year</option>
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
          <label className="form__label" htmlFor="schedule-semesterId">
            Semester <span className="form__required">*</span>
          </label>
          <select
            id="schedule-semesterId"
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
          {values.academicYearId &&
          !semestersLoading &&
          yearsAvailable &&
          !semestersAvailable ? (
            <p className="form__hint">
              No semester records exist for this academic year yet. Add
              semesters from the academic year details page first.
            </p>
          ) : (
            renderedError('semesterId')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="schedule-classId">
            Class <span className="form__required">*</span>
          </label>
          <select
            id="schedule-classId"
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

        <div className="form__field">
          <label className="form__label" htmlFor="schedule-courseId">
            Course <span className="form__required">*</span>
          </label>
          <select
            id="schedule-courseId"
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

        <div className="form__field">
          <label className="form__label" htmlFor="schedule-teacherId">
            Teacher <span className="form__required">*</span>
          </label>
          <select
            id="schedule-teacherId"
            className="form__input form__select"
            value={values.teacherId}
            onChange={setField('teacherId')}
            onBlur={handleBlur('teacherId')}
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
            renderedError('teacherId')
          )}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="schedule-dayOfWeek">
            Day of Week <span className="form__required">*</span>
          </label>
          <select
            id="schedule-dayOfWeek"
            className="form__input form__select"
            value={values.dayOfWeek}
            onChange={setField('dayOfWeek')}
            onBlur={handleBlur('dayOfWeek')}
            disabled={isSubmitting}
          >
            <option value="">Select day</option>
            {SCHEDULE_DAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderedError('dayOfWeek')}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="schedule-startTime">
            Start Time <span className="form__required">*</span>
          </label>
          <input
            id="schedule-startTime"
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
          <label className="form__label" htmlFor="schedule-endTime">
            End Time <span className="form__required">*</span>
          </label>
          <input
            id="schedule-endTime"
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

        <div className="form__field">
          <label className="form__label" htmlFor="schedule-room">
            Room
          </label>
          <input
            id="schedule-room"
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
          <label className="form__label" htmlFor="schedule-status">
            Status <span className="form__required">*</span>
          </label>
          <select
            id="schedule-status"
            className="form__input form__select"
            value={values.status}
            onChange={setField('status')}
            disabled={isSubmitting}
          >
            <option value="">Select status</option>
            {Object.entries(SCHEDULE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {renderedError('status')}
        </div>
      </div>

      <p className="form__hint schedule-entry-form__conflict-hint">
        Scheduling conflicts such as a teacher, class or room being booked at
        the same time are checked by the backend and will be shown above if
        detected.
      </p>

      <div className="schedule-entry-form__actions">
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

export default ScheduleEntryForm