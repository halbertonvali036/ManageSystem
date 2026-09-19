import { Link } from 'react-router-dom'
import { School } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import { formatClassName, formatClassCourseName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

function MyClassesCard({ classes }) {
  return (
    <Card
      title="My Classes"
      action={
        classes.length > 0 ? (
          <Link to="/teacher/classes" className="form__link">
            View all
          </Link>
        ) : null
      }
    >
      {classes.length === 0 ? (
        <div className="widget-empty">
          <School size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No classes assigned yet</p>
          <p className="widget-empty__text">
            Classes you teach will appear here once they are assigned.
          </p>
        </div>
      ) : (
        <ul className="class-list">
          {classes.map((classRecord) => {
            const schedule = parseSchedule(classRecord.schedule || '')
            return (
              <li className="class-item" key={classRecord.id}>
                <span className="class-item__time">{schedule.startTime || '—'}</span>
                <div className="class-item__info">
                  <h3 className="class-item__subject">{formatClassName(classRecord)}</h3>
                  <p className="class-item__meta">{formatClassCourseName(classRecord)}</p>
                </div>
                <ClassStatusBadge status={classRecord.status} />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default MyClassesCard