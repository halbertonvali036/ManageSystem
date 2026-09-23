import { Link } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import Card from '@/components/common/Card'

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading attendance&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load attendance</h3>
      <p className="table-state__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty widget-empty--compact">
      <ClipboardCheck
        size={24}
        className="widget-empty__icon"
        aria-hidden="true"
      />
      <p className="widget-empty__title">No attendance records today</p>
      <p className="widget-empty__text">
        Today&rsquo;s attendance will appear here once records are taken.
      </p>
      <Link to="/attendance/mark" className="widget-empty__action">
        Take attendance
      </Link>
    </div>
  )
}

const attendanceRows = [
  {
    key: 'present',
    label: 'Present',
    value: 'presentRate',
    count: 'presentCount',
    className: 'attendance-row--present',
  },
  {
    key: 'late',
    label: 'Late',
    value: 'lateRate',
    count: 'lateCount',
    className: 'attendance-row--late',
  },
  {
    key: 'absent',
    label: 'Absent',
    value: 'absentRate',
    count: 'absentCount',
    className: 'attendance-row--absent',
  },
]

function AttendanceOverviewCard({ data, isLoading, error, onRetry }) {
  return (
    <Card
      title="Today's Attendance"
      action={
        <Link to="/attendance" className="form__link">
          View All
        </Link>
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && !data ? <EmptyState /> : null}
      {!isLoading && !error && data ? (
        <>
          <div className="attendance-summary">
            <div className="attendance-summary__total">
              <span className="attendance-summary__total-value">
                {data.total.toLocaleString()}
              </span>
              <span className="attendance-summary__total-label">
                {data.total === 1 ? 'record' : 'records'} today
              </span>
            </div>

            <div className="attendance-stack" aria-hidden="true">
              {attendanceRows.map((row) => {
                const rate = data[row.value]
                return rate > 0 ? (
                  <span
                    key={row.key}
                    className={`attendance-stack__fill attendance-stack__fill--${row.key}`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  />
                ) : null
              })}
            </div>

            <ul className="attendance-breakdown">
              {attendanceRows.map((row) => (
                <li className={`attendance-row ${row.className}`} key={row.key}>
                  <span className="attendance-row__dot" aria-hidden="true" />
                  <span className="attendance-row__label">{row.label}</span>
                  <span className="attendance-row__count">{data[row.count]}</span>
                  <span className="attendance-row__track">
                    <span
                      className="attendance-row__bar"
                      style={{ width: `${Math.min(data[row.value], 100)}%` }}
                    />
                  </span>
                  <span className="attendance-row__value">{data[row.value]}%</span>
                </li>
              ))}
            </ul>

            {data.excusedCount > 0 ? (
              <p className="attendance-summary__note">
                {data.excusedCount.toLocaleString()}{' '}
                {data.excusedCount === 1 ? 'excused absence' : 'excused absences'}
              </p>
            ) : null}
          </div>
          <div className="attendance-actions">
            <Link to="/attendance/mark" className="btn btn--primary">
              Mark Attendance
            </Link>
            <Link to="/attendance" className="btn">
              View Attendance
            </Link>
          </div>
        </>
      ) : null}
    </Card>
  )
}

export default AttendanceOverviewCard