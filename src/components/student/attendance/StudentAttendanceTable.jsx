import { Eye, ClipboardCheck } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import {
  formatAttendanceClassRef,
  formatAttendanceCourseName,
  formatAttendanceDate,
} from '@/models/attendance'

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'class', label: 'Class' },
  { key: 'course', label: 'Course' },
  { key: 'status', label: 'Status' },
  { key: 'checkInTime', label: 'Check-in Time' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: '' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading attendance records&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load attendance records</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState({ hasActiveFilters, onClearFilters, backendConnected }) {
  const title = !backendConnected
    ? 'Attendance not available yet'
    : hasActiveFilters
      ? 'No matching attendance records'
      : 'No attendance records yet'

  const text = !backendConnected
    ? 'Attendance data will be available when the backend API is connected.'
    : hasActiveFilters
      ? 'Try adjusting your search or filters.'
      : 'Attendance for your classes will appear here once it is recorded.'

  return (
    <Card>
      <div className="table-state">
        <ClipboardCheck
          className="table-state__icon"
          size={40}
          aria-hidden="true"
        />
        <h3 className="table-state__title">{title}</h3>
        <p className="table-state__text">{text}</p>
        {hasActiveFilters ? (
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </Card>
  )
}

function StudentAttendanceTable({
  records,
  isLoading,
  error,
  onRetry,
  onView,
  hasActiveFilters,
  onClearFilters,
  backendConnected,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (records.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        backendConnected={backendConnected}
      />
    )
  }

  return (
    <div className="table-responsive">
      <table className="attendance-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="attendance-table__row"
              onClick={() => onView(record)}
            >
              <td className="attendance-table__date">
                {formatAttendanceDate(record.date)}
              </td>
              <td className="attendance-table__name">
                {formatAttendanceClassRef(record)}
              </td>
              <td>{formatAttendanceCourseName(record)}</td>
              <td>
                <AttendanceStatusBadge status={record.status} />
              </td>
              <td>{record.checkInTime || '—'}</td>
              <td className="attendance-table__notes teacher-table-cell">
                {record.notes || '—'}
              </td>
              <td>
                <div className="attendance-table__actions">
                  <button
                    type="button"
                    className="attendance-table__action"
                    aria-label="View attendance details"
                    title="View attendance details"
                    onClick={(event) => {
                      event.stopPropagation()
                      onView(record)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentAttendanceTable