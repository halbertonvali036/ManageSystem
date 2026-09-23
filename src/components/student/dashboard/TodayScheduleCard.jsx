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
    <div className="widget-status">
      <span className="spinner" aria-hidden="true" />
      Loading today&rsquo;s schedule&hellip;
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty widget-empty--compact">
      <CalendarClock size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No classes scheduled today</p>
      <p className="widget-empty__text">
        Today&rsquo;s schedule will appear here once classes are set up.
      </p>
      <Link to="/student/schedule" className="widget-empty__action">
        Open schedule
      </Link>
    </div>
  )
}

function TodayScheduleCard({ items, isLoading }) {
  return (
    <Card title="Today's Schedule" className="student-schedule-card">
      {isLoading ? <LoadingState /> : null}
      {!isLoading && items.length === 0 ? <EmptyState /> : null}
      {!isLoading && items.length > 0 ? (
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
                        to={`/student/classes/${classId}`}
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
                  {formatScheduleTeacherName(item) !== '—' ? (
                    <p className="schedule-item__teacher">
                      {formatScheduleTeacherName(item)}
                    </p>
                  ) : null}
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

export default TodayScheduleCard