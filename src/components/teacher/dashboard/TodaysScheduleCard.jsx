import { Link } from 'react-router-dom'
import { CalendarClock, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleRoom,
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
      <p className="widget-empty__title">No lessons scheduled today</p>
      <p className="widget-empty__text">
        Today&rsquo;s schedule will appear here once lessons are scheduled for your
        account.
      </p>
      <Link to="/teacher/schedule" className="widget-empty__action">
        Open schedule
      </Link>
    </div>
  )
}

function TodaysScheduleCard({ items, isLoading, error, onRetry }) {
  return (
    <Card
      title="Today's Schedule"
      action={
        <Link to="/teacher/schedule" className="form__link">
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
        <ul className="schedule-list">
          {items.map((item) => {
            const classId = resolveScheduleClassId(item)
            return (
              <li className="schedule-item" key={item.id ?? item.scheduleId}>
                <span className="schedule-item__time">
                  {formatScheduleTimeRange(item)}
                </span>
                <div className="schedule-item__body">
                  <div className="schedule-item__title-row">
                    {classId ? (
                      <Link
                        to={`/teacher/classes/${classId}`}
                        className="schedule-item__class-link"
                      >
                        {formatScheduleClassName(item)}
                      </Link>
                    ) : (
                      <span className="schedule-item__class">
                        {formatScheduleClassName(item)}
                      </span>
                    )}
                    {item.day || item.dayOfWeek ? (
                      <span className="schedule-item__day">
                        {item.day ?? item.dayOfWeek}
                      </span>
                    ) : null}
                  </div>
                  <p className="schedule-item__course">
                    {formatScheduleCourseName(item)}
                  </p>
                </div>
                <span className="schedule-item__room">
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