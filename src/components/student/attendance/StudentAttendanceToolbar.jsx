import { Search, X } from 'lucide-react'
import { ATTENDANCE_STATUS } from '@/models/attendance'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Present' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Absent' },
  { value: ATTENDANCE_STATUS.LATE, label: 'Late' },
  { value: ATTENDANCE_STATUS.EXCUSED, label: 'Excused' },
]

function StudentAttendanceToolbar({
  search,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  classes = [],
  classFilter,
  onClassChange,
  courses = [],
  courseFilter,
  onCourseChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
}) {
  const hasActiveFilters =
    search !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    classFilter !== 'all' ||
    courseFilter !== 'all' ||
    statusFilter !== 'all'

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search class or course&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search attendance records"
          />
        </div>

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
    </div>
  )
}

export default StudentAttendanceToolbar