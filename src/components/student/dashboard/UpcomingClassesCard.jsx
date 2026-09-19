import { Link } from 'react-router-dom'
import { CalendarClock, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'
import { formatClassName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

function UpcomingClassesCard({ classes }) {
  return (
    <Card
      title="Upcoming Classes"
      action={
        classes.length > 0 ? (
          <Link to="/student/classes" className="form__link">
            View all
          </Link>
        ) : null
      }
    >
      {classes.length === 0 ? (
        <div className="widget-empty">
          <CalendarClock
            size={24}
            className="widget-empty__icon"
            aria-hidden="true"
          />
          <p className="widget-empty__title">No upcoming classes</p>
          <p className="widget-empty__text">
            Classes you are enrolled in will appear here.
          </p>
        </div>
      ) : (
        <ul className="class-list">
          {classes.map((classRecord) => {
            const schedule = parseSchedule(classRecord.schedule || '')
            return (
              <li className="class-item" key={classRecord.id}>
                <span className="class-item__time">
                  {schedule.startTime || '—'}
                </span>
                <div className="class-item__info">
                  <h3 className="class-item__subject">
                    {formatClassName(classRecord)}
                  </h3>
                  <p className="class-item__meta">{schedule.days || '—'}</p>
                </div>
                <span className="class-item__room">
                  <MapPin size={14} aria-hidden="true" />
                  {classRecord.room || '—'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default UpcomingClassesCard