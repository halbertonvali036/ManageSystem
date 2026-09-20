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
    </div>
  )
}

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
          <p className="widget-caption">
            {data.total.toLocaleString()}{' '}
            {data.total === 1 ? 'record' : 'records'} today
          </p>
          <div className="attendance-summary">
            <div className="attendance-summary__bars">
              {[
                {
                  key: 'present',
                  label: 'Present',
                  value: data.presentRate,
                  count: data.presentCount,
                  className: 'attendance-bar--present',
                },
                {
                  key: 'late',
                  label: 'Late',
                  value: data.lateRate,
                  count: data.lateCount,
                  className: 'attendance-bar--late',
                },
                {
                  key: 'absent',
                  label: 'Absent',
                  value: data.absentRate,
                  count: data.absentCount,
                  className: 'attendance-bar--absent',
                },
              ].map((bar) => (
                <div className="attendance-bar" key={bar.key}>
                  <span className="attendance-bar__label">
                    {bar.label} ({bar.count})
                  </span>
                  <div className="attendance-bar__track">
                    <div
                      className={`attendance-bar__fill ${bar.className}`}
                      style={{ width: `${Math.min(bar.value, 100)}%` }}
                    />
                  </div>
                  <span className="attendance-bar__value">{bar.value}%</span>
                </div>
              ))}
            </div>
            {data.excusedCount > 0 ? (
              <p className="widget-caption">
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