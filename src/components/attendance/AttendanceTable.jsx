import { Eye, Pencil, Trash2, ClipboardCheck } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import {
  formatAttendanceClassRef,
  formatAttendanceCourseName,
  formatAttendanceDate,
  formatAttendanceStudentName,
} from '@/models/attendance'

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'class', label: 'Class' },
  { key: 'course', label: 'Course' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
]

const ACTION_HINT = 'Attendance actions become available in a later milestone'

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

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <ClipboardCheck className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No attendance records yet</h3>
        <p className="table-state__text">
          Attendance records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function AttendanceTable({ records, isLoading, error, onRetry }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (records.length === 0) {
    return <EmptyState />
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
            <tr key={record.id} className="attendance-table__row">
              <td className="attendance-table__name">
                {formatAttendanceStudentName(record)}
              </td>
              <td className="attendance-table__id">
                {record.studentId ||
                  record.student?.studentId ||
                  record.student?.id ||
                  '—'}
              </td>
              <td>{formatAttendanceClassRef(record)}</td>
              <td>{formatAttendanceCourseName(record)}</td>
              <td className="attendance-table__date">
                {formatAttendanceDate(record.date)}
              </td>
              <td>
                <AttendanceStatusBadge status={record.status} />
              </td>
              <td className="attendance-table__notes">{record.notes || '—'}</td>
              <td>
                <div className="attendance-table__actions">
                  <button
                    type="button"
                    className="attendance-table__action"
                    aria-label={ACTION_HINT}
                    title={ACTION_HINT}
                    disabled
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="attendance-table__action"
                    aria-label={ACTION_HINT}
                    title={ACTION_HINT}
                    disabled
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="attendance-table__action attendance-table__action--danger"
                    aria-label={ACTION_HINT}
                    title={ACTION_HINT}
                    disabled
                  >
                    <Trash2 size={16} aria-hidden="true" />
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

export default AttendanceTable