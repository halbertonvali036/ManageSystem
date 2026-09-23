import { Link } from 'react-router-dom'
import { CalendarClock, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import { formatClassName, formatClassTeacherName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

function LoadingState() {
  return (
    <div className="widget-status">
      <span className="spinner" aria-hidden="true" />
      Loading classes&hellip;
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty widget-empty--compact">
      <CalendarClock size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No classes yet</p>
      <p className="widget-empty__text">
        Classes you are enrolled in will appear here.
      </p>
    </div>
  )
}

function UpcomingClassesCard({ classes, isLoading }) {
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
      {isLoading ? <LoadingState /> : null}
      {!isLoading && classes.length === 0 ? <EmptyState /> : null}
      {!isLoading && classes.length > 0 ? (
        <ul className="class-list">
          {classes.map((classRecord) => {
            const schedule = parseSchedule(classRecord.schedule || '')
            const teacherName = formatClassTeacherName(classRecord)
            return (
              <li className="class-item" key={classRecord.id}>
                <span className="class-item__time">
                  {schedule.startTime || '—'}
                </span>
                <div className="class-item__info">
                  <Link
                    to={`/student/classes/${classRecord.id}`}
                    className="class-item__subject-link"
                  >
                    <h3 className="class-item__subject">
                      {formatClassName(classRecord)}
                    </h3>
                  </Link>
                  <p className="class-item__meta">
                    {schedule.days || '—'}
                    {teacherName !== '—' ? <span> · {teacherName}</span> : null}
                  </p>
                </div>
                <span className="class-item__room">
                  <MapPin size={14} aria-hidden="true" />
                  {classRecord.room || '—'}
                </span>
                <ClassStatusBadge status={classRecord.status} />
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}

export default UpcomingClassesCard