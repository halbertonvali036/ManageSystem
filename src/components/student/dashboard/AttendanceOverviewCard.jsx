import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABELS,
  formatAttendanceClassRef,
  formatAttendanceDate,
} from '@/models/attendance'

const BREAKDOWN_ORDER = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.EXCUSED,
]

function LoadingState() {
  return (
    <div className="widget-status">
      <span className="spinner" aria-hidden="true" />
      Loading attendance&hellip;
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty widget-empty--compact">
      <BarChart3 size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No attendance recorded yet</p>
      <p className="widget-empty__text">
        Attendance for your classes will appear here.
      </p>
    </div>
  )
}

function AttendanceOverviewCard({ records, isLoading }) {
  return (
    <Card
      title="Attendance Overview"
      className="student-attendance-card"
      action={
        records.length > 0 ? (
          <Link to="/student/attendance" className="form__link">
            Attendance Details
          </Link>
        ) : null
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && records.length === 0 ? <EmptyState /> : null}
      {!isLoading && records.length > 0 ? (
        <>
          <div className="attendance-summary">
            <div className="attendance-summary__total">
              <p className="attendance-summary__value">
                {records.length.toLocaleString()}
              </p>
              <p className="attendance-summary__label">Records</p>
            </div>
            <div className="attendance-summary__breakdown">
              {BREAKDOWN_ORDER.map((status) => {
                const count = records.filter(
                  (record) => (record.status || '').toLowerCase() === status,
                ).length
                return (
                  <span
                    key={status}
                    className={`attendance-summary__stat attendance-summary__stat--${status}`}
                  >
                    <span className="attendance-summary__dot" aria-hidden="true" />
                    <span className="attendance-summary__count">
                      {count.toLocaleString()}
                    </span>
                    <span className="attendance-summary__name">
                      {ATTENDANCE_STATUS_LABELS[status]}
                    </span>
                  </span>
                )
              })}
            </div>
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
        </>
      ) : null}
    </Card>
  )
}

export default AttendanceOverviewCard