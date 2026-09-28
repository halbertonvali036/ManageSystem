import { Plus, Search, X } from 'lucide-react'
import { SCHEDULE_DAY_OPTIONS, SCHEDULE_STATUS } from '@/models/schedule'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: SCHEDULE_STATUS.ACTIVE, label: 'Active' },
  { value: SCHEDULE_STATUS.INACTIVE, label: 'Inactive' },
]

const toOptionValue = (record, fallbackKeys = []) => {
  if (record == null) {
    return ''
  }
  if (typeof record === 'string') {
    return record
  }
  if (record.id) {
    return record.id
  }
  for (const key of fallbackKeys) {
    if (record[key]) {
      return record[key]
    }
  }
  return ''
}

function SchedulesToolbar({
  search,
  onSearchChange,
  academicYears = [],
  academicYearsLoading = false,
  academicYearId,
  onAcademicYearChange,
  semesters = [],
  semestersLoading = false,
  semesterId,
  onSemesterChange,
  classes = [],
  classesLoading = false,
  classId,
  onClassChange,
  courses = [],
  coursesLoading = false,
  courseId,
  onCourseChange,
  dayOfWeek,
  onDayChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' ||
    academicYearId !== 'all' ||
    semesterId !== 'all' ||
    classId !== 'all' ||
    courseId !== 'all' ||
    dayOfWeek !== 'all' ||
    statusFilter !== 'all'

  const yearsAvailable = academicYears.length > 0
  const semesterOptions = semesters.map((semester) => ({
    value: String(toOptionValue(semester, ['name', 'semester'])),
    label: semester?.name || semester?.semester || '—',
  }))
  const semestersAvailable = semesterOptions.length > 0
  const classesAvailable = classes.length > 0
  const coursesAvailable = courses.length > 0

  const renderEntitySelect = ({
    id,
    value,
    onChange,
    options,
    loading,
    available,
    label,
    allLabel,
    loadingLabel,
    emptyLabel,
  }) => (
    <select
      className="field-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      disabled={loading || !available}
      title={
        loading
          ? loadingLabel
          : available
            ? label
            : emptyLabel
      }
    >
      <option value="all">
        {loading ? loadingLabel : available ? allLabel : emptyLabel}
      </option>
      {options.map((option) => (
        <option key={`${id}-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  return (
    <div className="students-toolbar schedules-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search class, course or room&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search schedule entries"
          />
        </div>

        <select
          className="field-select"
          value={academicYearId}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          aria-label="Filter by academic year"
          disabled={academicYearsLoading || !yearsAvailable}
          title={
            academicYearsLoading
              ? 'Loading academic years\u2026'
              : yearsAvailable
                ? 'Filter by academic year'
                : 'No academic years available yet'
          }
        >
          <option value="all">
            {academicYearsLoading
              ? 'Loading academic years\u2026'
              : yearsAvailable
                ? 'All academic years'
                : 'No academic years available'}
          </option>
          {academicYears.map((academicYear) => {
            const value = toOptionValue(academicYear, ['name', 'academicYear'])
            return (
              <option key={value} value={value}>
                {academicYear?.name || academicYear?.academicYear || value}
              </option>
            )
          })}
        </select>

        <select
          className="field-select"
          value={semesterId}
          onChange={(event) => onSemesterChange(event.target.value)}
          aria-label="Filter by semester"
          disabled={
            !academicYearId || academicYearId === 'all' || semestersLoading
          }
          title={
            academicYearId === 'all'
              ? 'Select an academic year first'
              : semestersLoading
                ? 'Loading semesters\u2026'
                : semestersAvailable
                  ? 'Filter by semester'
                  : 'No semesters for this academic year'
          }
        >
          <option value="all">
            {semestersLoading && academicYearId !== 'all'
              ? 'Loading semesters\u2026'
              : academicYearId === 'all'
                ? 'All semesters'
                : semestersAvailable
                  ? 'All semesters'
                  : 'No semesters available'}
          </option>
          {semesterOptions.map((option) => (
            <option key={`semester-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {renderEntitySelect({
          id: 'class',
          value: classId,
          onChange: onClassChange,
          options: classes.map((classRecord) => ({
            value: String(toOptionValue(classRecord)),
            label: classRecord?.name || classRecord?.classCode || classRecord?.id || '—',
          })),
          loading: classesLoading,
          available: classesAvailable,
          label: 'Filter by class',
          allLabel: 'All classes',
          loadingLabel: 'Loading classes\u2026',
          emptyLabel: 'No classes available',
        })}

        {renderEntitySelect({
          id: 'course',
          value: courseId,
          onChange: onCourseChange,
          options: courses.map((course) => ({
            value: String(toOptionValue(course, ['courseCode'])),
            label: course?.name || course?.courseName || course?.courseCode || course?.id || '—',
          })),
          loading: coursesLoading,
          available: coursesAvailable,
          label: 'Filter by course',
          allLabel: 'All courses',
          loadingLabel: 'Loading courses\u2026',
          emptyLabel: 'No courses available',
        })}

        <select
          className="field-select"
          value={dayOfWeek}
          onChange={(event) => onDayChange(event.target.value)}
          aria-label="Filter by day"
        >
          <option value="all">All days</option>
          {SCHEDULE_DAY_OPTIONS.map((option) => (
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
        Add Entry
      </button>
    </div>
  )
}

export default SchedulesToolbar