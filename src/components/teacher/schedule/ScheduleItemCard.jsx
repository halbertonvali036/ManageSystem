import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleTimeRange,
  formatScheduleRoom,
  resolveScheduleClassId,
} from '@/models/schedule'

function ScheduleItemCard({ item, showDate = false }) {
  const classId = resolveScheduleClassId(item)

  return (
    <article className="schedule-item" aria-label={formatScheduleClassName(item)}>
      <div className="schedule-item__time">
        <Clock size={14} aria-hidden="true" />
        <span>{formatScheduleTimeRange(item)}</span>
        {item.status ? <ClassStatusBadge status={item.status} /> : null}
      </div>
      <h3 className="schedule-item__class">{formatScheduleClassName(item)}</h3>
      <p className="schedule-item__course">{formatScheduleCourseName(item)}</p>
      <p className="schedule-item__room">
        <MapPin size={14} aria-hidden="true" />
        <span>Room {formatScheduleRoom(item)}</span>
      </p>
      {showDate ? (
        <p className="schedule-item__date">
          {item.date || item.day || item.dayOfWeek || ''}
        </p>
      ) : null}
      <div className="schedule-item__actions">
        {classId ? (
          <Link
            to={`/teacher/classes/${classId}`}
            className="btn btn--compact btn--icon-left"
          >
            View Class
          </Link>
        ) : null}
        <Link
          to="/teacher/students"
          className="btn btn--compact btn--icon-left"
        >
          View Students
        </Link>
        <Link
          to="/teacher/attendance/mark"
          className="btn btn--compact btn--icon-left"
        >
          Mark Attendance
        </Link>
      </div>
    </article>
  )
}

export default ScheduleItemCard