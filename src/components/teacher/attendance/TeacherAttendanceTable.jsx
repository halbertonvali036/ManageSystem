import { ClipboardCheck } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import {
  formatAttendanceClassRef,
  formatAttendanceDate,
  formatAttendanceStudentName,
} from '@/models/attendance'

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'class', label: 'Class' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'checkInTime', label: 'Check-in Time' },
  { key: 'notes', label: 'Notes' },
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

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <ClipboardCheck className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No attendance records yet</h3>
        <p className="table-state__text">
          Attendance you take for your classes will appear here once data is
          available.
        </p>
      </div>
    </Card>
  )
}

function TeacherAttendanceTable({ records, isLoading, error, onRetry }) {
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
              <td className="attendance-table__id teacher-table-id">
                {record.studentId ||
                  record.student?.studentId ||
                  record.student?.id ||
                  '—'}
              </td>
              <td>{formatAttendanceClassRef(record)}</td>
              <td className="attendance-table__date">
                {formatAttendanceDate(record.date)}
              </td>
              <td>
                <AttendanceStatusBadge status={record.status} />
              </td>
              <td>{record.checkInTime || '—'}</td>
              <td className="attendance-table__notes teacher-table-cell">
                {record.notes || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TeacherAttendanceTable