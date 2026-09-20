import { Plus, Search, X } from 'lucide-react'
import {
  ASSESSMENT_STATUS,
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
} from '@/models/assessment'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  {
    value: ASSESSMENT_STATUS.DRAFT,
    label: ASSESSMENT_STATUS_LABELS[ASSESSMENT_STATUS.DRAFT],
  },
  {
    value: ASSESSMENT_STATUS.PUBLISHED,
    label: ASSESSMENT_STATUS_LABELS[ASSESSMENT_STATUS.PUBLISHED],
  },
  {
    value: ASSESSMENT_STATUS.CLOSED,
    label: ASSESSMENT_STATUS_LABELS[ASSESSMENT_STATUS.CLOSED],
  },
]

const toCourseValue = (course) => course?.id ?? course?.courseCode ?? course

const toClassValue = (classRecord) =>
  classRecord?.id ?? classRecord?.classCode ?? classRecord

const toCourseLabel = (course) => {
  if (typeof course === 'string') {
    return course
  }
  return course.name || course.courseName || course.courseCode || 'Untitled'
}

const toClassLabel = (classRecord) => {
  if (typeof classRecord === 'string') {
    return classRecord
  }
  return (
    classRecord.name ||
    classRecord.className ||
    classRecord.classCode ||
    'Unnamed class'
  )
}

const resolveClassCourseId = (classRecord) =>
  classRecord.courseId ??
  (typeof classRecord.course === 'object' && classRecord.course
    ? classRecord.course.id
    : null) ??
  toCourseValue(classRecord.course)

function AssessmentsToolbar({
  search,
  onSearchChange,
  courses,
  coursesLoading = false,
  courseFilter,
  onCourseChange,
  classes,
  classesLoading = false,
  classFilter,
  onClassChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' ||
    courseFilter !== 'all' ||
    classFilter !== 'all' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all'

  const coursesAvailable = courses.length > 0
  const classesAvailable = classes.length > 0

  // Keep the class filter options in sync with the selected course context.
  const displayedClasses =
    courseFilter === 'all'
      ? classes
      : classes.filter(
          (classRecord) => resolveClassCourseId(classRecord) === courseFilter,
        )

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search assessment title&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search assessments"
          />
        </div>

        <select
          className="field-select"
          value={courseFilter}
          onChange={(event) => onCourseChange(event.target.value)}
          aria-label="Filter by course"
          disabled={coursesLoading || !coursesAvailable}
          title={
            coursesLoading
              ? 'Loading courses\u2026'
              : coursesAvailable
                ? 'Filter by course'
                : 'No courses available yet'
          }
        >
          <option value="all">
            {coursesLoading
              ? 'Loading courses\u2026'
              : coursesAvailable
                ? 'All courses'
                : 'No courses available'}
          </option>
          {courses.map((course) => (
            <option key={toCourseValue(course)} value={toCourseValue(course)}>
              {toCourseLabel(course)}
            </option>
          ))}
        </select>

        <select
          className="field-select"
          value={classFilter}
          onChange={(event) => onClassChange(event.target.value)}
          aria-label="Filter by class"
          disabled={classesLoading || !classesAvailable}
          title={
            classesLoading
              ? 'Loading classes\u2026'
              : classesAvailable
                ? 'Filter by class'
                : 'No classes available yet'
          }
        >
          <option value="all">
            {classesLoading
              ? 'Loading classes\u2026'
              : classesAvailable
                ? 'All classes'
                : 'No classes available'}
          </option>
          {displayedClasses.map((classRecord) => (
            <option
              key={toClassValue(classRecord)}
              value={toClassValue(classRecord)}
            >
              {toClassLabel(classRecord)}
            </option>
          ))}
        </select>

        <select
          className="field-select"
          value={typeFilter}
          onChange={(event) => onTypeChange(event.target.value)}
          aria-label="Filter by assessment type"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="field-select"
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

      <button
        type="button"
        className="btn btn--primary btn--icon-left students-toolbar__add"
        onClick={onAdd}
      >
        <Plus size={18} aria-hidden="true" />
        Add Assessment
      </button>
    </div>
  )
}

export default AssessmentsToolbar