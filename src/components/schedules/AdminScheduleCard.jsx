import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import ScheduleEntryStatusBadge from '@/components/schedules/ScheduleEntryStatusBadge'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleRoom,
  formatScheduleTimeRange,
} from '@/models/schedule'

function AdminScheduleCard({ entry }) {
  const entryId = entry?.id ?? null

  return (
    <article
      className="schedule-item"
      aria-label={formatScheduleClassName(entry)}
    >
      <div className="schedule-item__time">
        <Clock size={14} aria-hidden="true" />
        <span>{formatScheduleTimeRange(entry)}</span>
        {entry.status ? (
          <ScheduleEntryStatusBadge status={entry.status} />
        ) : null}
      </div>

      <h3 className="schedule-item__class">{formatScheduleClassName(entry)}</h3>
      <p className="schedule-item__course">{formatScheduleCourseName(entry)}</p>

      <p className="schedule-item__room">
        <MapPin size={14} aria-hidden="true" />
        <span>Room {formatScheduleRoom(entry)}</span>
      </p>

      {entryId ? (
        <div className="schedule-item__actions">
          <Link
            to={`/schedules/${entryId}`}
            className="btn btn--compact btn--icon-left"
          >
            View Entry
          </Link>
        </div>
      ) : null}
    </article>
  )
}

export default AdminScheduleCard