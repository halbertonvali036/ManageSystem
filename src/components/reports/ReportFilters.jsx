import { useId } from 'react'
import { FileBarChart2, RotateCcw } from 'lucide-react'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useStudents from '@/hooks/useStudents'
import useTeachers from '@/hooks/useTeachers'
import { formatClassName } from '@/models/class'
import {
  ACADEMIC_YEARS,
  REPORT_CATEGORY_FILTERS,
  REPORT_FILTER_LABELS,
  REPORT_FILTER_TYPES,
  REPORT_STATUS_OPTIONS,
  SEMESTER_OPTIONS,
} from '@/models/report'
import { formatStudentName } from '@/models/student'
import { formatTeacherName } from '@/models/teacher'

const formatCourseOption = (course) =>
  course.name ||
  course.courseName ||
  course.courseCode ||
  (course.id ? `Course ${course.id}` : 'Course')

const buildOptions = (items, format) =>
  items.map((item) => ({ value: item.id, label: format(item) }))

function EntitySelect({ label, value, onChange, options, loading }) {
  const unavailable = !loading && options.length === 0
  const inputId = useId()

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {label}
      </label>
      <select
        id={inputId}
        className="form__input form__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={unavailable}
      >
        <option value="">Any {label.toLowerCase()}</option>
        {options.length > 0 ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="" disabled>
            {loading ? 'Loading options\u2026' : 'No options available yet'}
          </option>
        )}
      </select>
    </div>
  )
}

function SimpleSelect({ label, value, onChange, options }) {
  const inputId = useId()

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {label}
      </label>
      <select
        id={inputId}
        className="form__input form__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Any {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function DateField({ label, value, onChange, min, max }) {
  const inputId = useId()

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        className="form__input"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function ReportFilters({ categoryKey, filters, onChange, onReset, onGenerate, isGenerating }) {
  const { students, isLoading: studentsLoading } = useStudents()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()
  const { teachers, isLoading: teachersLoading } = useTeachers()

  const appliedFilters = REPORT_CATEGORY_FILTERS[categoryKey] ?? []
  const includes = (filter) => appliedFilters.includes(filter)

  const dateRangeInvalid = Boolean(
    filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo,
  )

  const statusOptions = Object.entries(REPORT_STATUS_OPTIONS[categoryKey] ?? {}).map(
    ([value, label]) => ({ value, label }),
  )

  return (
    <div className="report-filters">
      <div className="report-filters__grid">
        {includes(REPORT_FILTER_TYPES.DATE_FROM) ? (
          <DateField
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.DATE_FROM]}
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.DATE_FROM, value)}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.DATE_TO) ? (
          <DateField
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.DATE_TO]}
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.DATE_TO, value)}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.STUDENT_ID) ? (
          <EntitySelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.STUDENT_ID]}
            value={filters.studentId}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.STUDENT_ID, value)}
            options={buildOptions(students, formatStudentName)}
            loading={studentsLoading}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.CLASS_ID) ? (
          <EntitySelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.CLASS_ID]}
            value={filters.classId}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.CLASS_ID, value)}
            options={buildOptions(classes, formatClassName)}
            loading={classesLoading}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.COURSE_ID) ? (
          <EntitySelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.COURSE_ID]}
            value={filters.courseId}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.COURSE_ID, value)}
            options={buildOptions(courses, formatCourseOption)}
            loading={coursesLoading}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.TEACHER_ID) ? (
          <EntitySelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.TEACHER_ID]}
            value={filters.teacherId}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.TEACHER_ID, value)}
            options={buildOptions(teachers, formatTeacherName)}
            loading={teachersLoading}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.STATUS) && statusOptions.length > 0 ? (
          <SimpleSelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.STATUS]}
            value={filters.status}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.STATUS, value)}
            options={statusOptions}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.ACADEMIC_YEAR) ? (
          <SimpleSelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.ACADEMIC_YEAR]}
            value={filters.academicYear}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.ACADEMIC_YEAR, value)}
            options={ACADEMIC_YEARS.map((year) => ({ value: year, label: year }))}
          />
        ) : null}

        {includes(REPORT_FILTER_TYPES.SEMESTER) ? (
          <SimpleSelect
            label={REPORT_FILTER_LABELS[REPORT_FILTER_TYPES.SEMESTER]}
            value={filters.semester}
            onChange={(value) => onChange(REPORT_FILTER_TYPES.SEMESTER, value)}
            options={SEMESTER_OPTIONS}
          />
        ) : null}
      </div>

      {dateRangeInvalid ? (
        <p className="form__error report-filters__error" role="alert">
          From date must be on or before the To date.
        </p>
      ) : null}

      <div className="report-filters__actions">
        <button
          type="button"
          className="btn btn--primary btn--icon-left"
          onClick={onGenerate}
          disabled={isGenerating || dateRangeInvalid}
        >
          {isGenerating ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Generating&hellip;
            </>
          ) : (
            <>
              <FileBarChart2 size={16} aria-hidden="true" />
              Generate Report
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onReset}
          disabled={isGenerating}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default ReportFilters