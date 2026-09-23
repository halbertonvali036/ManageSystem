import { CalendarCheck, Search, X } from 'lucide-react'
import { ATTENDANCE_STATUS } from '@/models/attendance'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Present' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Absent' },
  { value: ATTENDANCE_STATUS.LATE, label: 'Late' },
  { value: ATTENDANCE_STATUS.EXCUSED, label: 'Excused' },
]

function AttendanceToolbar({
  search,
  onSearchChange,
  dateFilter,
  onDateChange,
  classes = [],
  classFilter,
  onClassChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onMarkAttendance,
}) {
  const hasActiveFilters =
    search !== '' || dateFilter !== '' || classFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="students-toolbar students-toolbar--data">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search student, ID, class or course&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search attendance records"
          />
        </div>

        <input
          type="date"
          className="field-input"
          value={dateFilter}
          max={new Date().toISOString().split('T')[0]}
          onChange={(event) => onDateChange(event.target.value)}
          aria-label="Filter by date"
        />

        <select
          className="field-select"
          value={classFilter}
          onChange={(event) => onClassChange(event.target.value)}
          aria-label="Filter by class"
        >
          {classes.length > 0 ? (
            <>
              <option value="all">All classes</option>
              {classes.map((classRecord) => (
                <option
                  key={classRecord.id ?? classRecord.classCode ?? classRecord}
                  value={classRecord.id ?? classRecord.classCode ?? classRecord}
                >
                  {classRecord.name || classRecord.classCode || classRecord}
                </option>
              ))}
            </>
          ) : (
            <option value="all">All classes</option>
          )}
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
        onClick={onMarkAttendance}
      >
        <CalendarCheck size={18} aria-hidden="true" />
        Mark Attendance
      </button>
    </div>
  )
}

export default AttendanceToolbar
