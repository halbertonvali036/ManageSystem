import { Link } from 'react-router-dom'
import { CalendarClock, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleRoom,
  formatScheduleTeacherName,
  formatScheduleTimeRange,
  resolveScheduleClassId,
} from '@/models/schedule'

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading today&rsquo;s schedule&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load today&rsquo;s schedule</h3>
      <p className="table-state__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty">
      <CalendarClock size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No classes scheduled today</p>
      <p className="widget-empty__text">
        Today&rsquo;s schedule will appear here once classes are scheduled.
      </p>
    </div>
  )
}

function TodaysScheduleCard({ items, isLoading, error, onRetry }) {
  return (
    <Card
      title="Today's Schedule"
      action={
        <Link to="/schedules" className="form__link">
          View Full Schedule
        </Link>
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && items.length === 0 ? <EmptyState /> : null}
      {!isLoading && !error && items.length > 0 ? (
        <ul className="class-list">
          {items.map((item) => {
            const classId = resolveScheduleClassId(item)
            return (
              <li className="class-item" key={item.id ?? item.scheduleId}>
                <span className="class-item__time">
                  {formatScheduleTimeRange(item)}
                </span>
                <div className="class-item__info">
                  {classId ? (
                    <Link
                      to={`/classes/${classId}`}
                      className="class-item__subject-link"
                    >
                      <h3 className="class-item__subject">
                        {formatScheduleClassName(item)}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="class-item__subject">
                      {formatScheduleClassName(item)}
                    </h3>
                  )}
                  <p className="class-item__meta">
                    {formatScheduleCourseName(item)}
                    {item.day || item.dayOfWeek ? (
                      <span> · {item.day ?? item.dayOfWeek}</span>
                    ) : null}
                    {formatScheduleTeacherName(item) !== '—' ? (
                      <span> · {formatScheduleTeacherName(item)}</span>
                    ) : null}
                  </p>
                </div>
                <span className="class-item__room">
                  <MapPin size={14} aria-hidden="true" />
                  {formatScheduleRoom(item)}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}

export default TodaysScheduleCard