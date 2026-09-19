import { Users } from 'lucide-react'
import { GRADE_ASSESSMENT_TYPE_LABELS } from '@/models/grade'
import { formatClassName } from '@/models/class'
import { toDateInputValue } from '@/utils/dateInput'

const ASSESSMENT_OPTIONS = [
  { value: '', label: 'Select a type' },
  ...Object.entries(GRADE_ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const formatCourseName = (course) =>
  course.name || course.courseName || course.courseCode || 'Course'

function GradingContextSelector({
  classes = [],
  classesLoading = false,
  courses = [],
  coursesLoading = false,
  classId,
  onClassChange,
  courseId,
  onCourseChange,
  assessmentType,
  onAssessmentTypeChange,
  assessmentName,
  onAssessmentNameChange,
  maxScore,
  onMaxScoreChange,
  date,
  onDateChange,
  onLoad,
  isLoadingStudents = false,
}) {
  const classesAvailable = classes.length > 0
  const coursesAvailable = courses.length > 0
  const canLoad = classesAvailable && classId !== '' && date !== ''

  return (
    <div className="grading-context">
      <div className="grading-context__fields">
        <div className="form__field grading-context__class">
          <label className="form__label" htmlFor="bulk-class">
            Class <span className="form__required">*</span>
          </label>
          <select
            id="bulk-class"
            className="form__input form__select"
            value={classId}
            onChange={(event) => onClassChange(event.target.value)}
            disabled={isLoadingStudents || classesLoading || !classesAvailable}
            aria-describedby="bulk-class-hint"
          >
            {classesLoading ? (
              <option value="">Loading classes&hellip;</option>
            ) : classesAvailable ? (
              <>
                <option value="">Select class</option>
                {classes.map((classRecord) => (
                  <option
                    key={classRecord.id ?? classRecord.classCode}
                    value={classRecord.id ?? classRecord.classCode}
                  >
                    {formatClassName(classRecord)}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No classes available yet</option>
            )}
          </select>
          {!classesLoading && !classesAvailable ? (
            <p className="form__hint" id="bulk-class-hint">
              Class options will appear here once class records exist.
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="bulk-course">
            Course <span className="form__required">*</span>
          </label>
          <select
            id="bulk-course"
            className="form__input form__select"
            value={courseId}
            onChange={(event) => onCourseChange(event.target.value)}
            disabled={isLoadingStudents || coursesLoading || !coursesAvailable}
            aria-describedby="bulk-course-hint"
          >
            {coursesLoading ? (
              <option value="">Loading courses&hellip;</option>
            ) : coursesAvailable ? (
              <>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option
                    key={course.id ?? course.courseCode}
                    value={course.id ?? course.courseCode}
                  >
                    {formatCourseName(course)}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No courses available yet</option>
            )}
          </select>
          {!coursesLoading && !coursesAvailable ? (
            <p className="form__hint" id="bulk-course-hint">
              Course options will appear here once course records exist.
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="bulk-assessmentType">
            Assessment Type <span className="form__required">*</span>
          </label>
          <select
            id="bulk-assessmentType"
            className="form__input form__select"
            value={assessmentType}
            onChange={(event) => onAssessmentTypeChange(event.target.value)}
            disabled={isLoadingStudents}
          >
            {ASSESSMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="bulk-assessmentName">
            Assessment Name <span className="form__required">*</span>
          </label>
          <input
            id="bulk-assessmentName"
            className="form__input"
            type="text"
            autoComplete="off"
            value={assessmentName}
            onChange={(event) => onAssessmentNameChange(event.target.value)}
            disabled={isLoadingStudents}
            placeholder="e.g. Midterm Exam"
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="bulk-maxScore">
            Maximum Score <span className="form__required">*</span>
          </label>
          <input
            id="bulk-maxScore"
            className="form__input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={maxScore}
            onChange={(event) => onMaxScoreChange(event.target.value)}
            disabled={isLoadingStudents}
            placeholder="e.g. 50"
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="bulk-date">
            Date <span className="form__required">*</span>
          </label>
          <input
            id="bulk-date"
            className="form__input"
            type="date"
            value={date}
            max={toDateInputValue(new Date())}
            onChange={(event) => onDateChange(event.target.value)}
            disabled={isLoadingStudents}
          />
        </div>

        <div className="form__field grading-context__action">
          <button
            type="button"
            className="btn btn--primary btn--icon-left grading-context__load"
            onClick={onLoad}
            disabled={isLoadingStudents || !canLoad}
          >
            {isLoadingStudents ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Loading students&hellip;
              </>
            ) : (
              <>
                <Users size={18} aria-hidden="true" />
                Load Students
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GradingContextSelector