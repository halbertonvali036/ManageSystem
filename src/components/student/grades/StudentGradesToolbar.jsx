import { Search, X } from 'lucide-react'
import { GRADE_ASSESSMENT_TYPE_LABELS } from '@/models/grade'

const ASSESSMENT_OPTIONS = [
  { value: 'all', label: 'All assessment types' },
  ...Object.entries(GRADE_ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

function StudentGradesToolbar({
  search,
  onSearchChange,
  courses = [],
  courseFilter,
  onCourseChange,
  classes = [],
  classFilter,
  onClassChange,
  assessmentFilter,
  onAssessmentChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
}) {
  const hasActiveFilters =
    search !== '' ||
    courseFilter !== 'all' ||
    classFilter !== 'all' ||
    assessmentFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== ''

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search course, class or assessment&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search my grades"
          />
        </div>

        <select
          className="field-select"
          value={courseFilter}
          onChange={(event) => onCourseChange(event.target.value)}
          aria-label="Filter by course"
        >
          <option value="all">All courses</option>
          {courses.map((course) => (
            <option
              key={course.id ?? course.courseCode ?? 'course'}
              value={course.id ?? course.courseCode ?? ''}
            >
              {course.name || course.courseCode || 'Course'}
            </option>
          ))}
        </select>

        <select
          className="field-select"
          value={classFilter}
          onChange={(event) => onClassChange(event.target.value)}
          aria-label="Filter by class"
        >
          <option value="all">All classes</option>
          {classes.map((classRecord) => (
            <option
              key={classRecord.id ?? classRecord.classCode ?? 'class'}
              value={classRecord.id ?? classRecord.classCode ?? ''}
            >
              {classRecord.name || classRecord.classCode || 'Class'}
            </option>
          ))}
        </select>

        <select
          className="field-select"
          value={assessmentFilter}
          onChange={(event) => onAssessmentChange(event.target.value)}
          aria-label="Filter by assessment type"
        >
          {ASSESSMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="field-input"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => onDateFromChange(event.target.value)}
          aria-label="From date"
        />

        <input
          type="date"
          className="field-input"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => onDateToChange(event.target.value)}
          aria-label="To date"
        />

        {hasActiveFilters ? (
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onClearFilters}
          >
            <X size={16} aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default StudentGradesToolbar