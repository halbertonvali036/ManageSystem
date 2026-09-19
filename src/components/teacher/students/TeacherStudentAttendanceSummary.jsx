import { BarChart3 } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import {
  ATTENDANCE_STATUS,
  formatAttendanceDate,
  formatAttendanceClassRef,
} from '@/models/attendance'
import { BackendNotConnectedError } from '@/services/httpClient'

const STATUS_KEYS = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.EXCUSED,
]

function LoadingState() {
  return (
    <Card title="Attendance Summary">
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading attendance&hellip;
      </div>
    </Card>
  )
}

function UnavailableState() {
  return (
    <Card title="Attendance Summary">
      <div className="table-state">
        <BarChart3 className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Attendance summary is unavailable</h3>
        <p className="table-state__text">
          Attendance will appear here when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card title="Attendance Summary">
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load attendance</h3>
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
    <Card title="Attendance Summary">
      <div className="table-state">
        <BarChart3 className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No attendance recorded</h3>
        <p className="table-state__text">
          Attendance taken for this student will appear here.
        </p>
      </div>
    </Card>
  )
}

function TeacherStudentAttendanceSummary({ records, isLoading, error, onRetry }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={onRetry} />
    )
  }

  if (records.length === 0) {
    return <EmptyState />
  }

  const summary = records.reduce((counts, record) => {
    const key = record.status || 'other'
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})

  return (
    <Card title="Attendance Summary" action={`${records.length} records`}>
      <div className="summary-chips">
        {STATUS_KEYS.map((status) =>
          (summary[status] ?? 0) > 0 ? (
            <span className="summary-chip" key={status}>
              <AttendanceStatusBadge status={status} />
              <span className="summary-chip__count">{summary[status]}</span>
            </span>
          ) : null,
        )}
      </div>
      <ul className="activity-list">
        {records.slice(0, 5).map((record) => (
          <li className="activity-item" key={record.id}>
            <span className="activity-item__marker" aria-hidden="true" />
            <div className="activity-item__body">
              <span className="activity-item__text">
                {formatAttendanceClassRef(record)}
              </span>
              <span className="activity-item__time">
                {formatAttendanceDate(record.date)}
              </span>
            </div>
            <AttendanceStatusBadge status={record.status} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default TeacherStudentAttendanceSummary