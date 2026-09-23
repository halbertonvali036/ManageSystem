import { Link } from 'react-router-dom'
import { School } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import { formatClassName, formatClassCourseName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

const NUMBER_OR_DASH = /^[0-9]+$/

function resolveStudentCount(classRecord) {
  if (Array.isArray(classRecord.students)) {
    return classRecord.students.length
  }
  const value = classRecord.studentCount
  if (value === null || value === undefined || value === '') {
    return null
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && NUMBER_OR_DASH.test(value.trim())) {
    return Number(value.trim())
  }
  return null
}

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading classes&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load classes</h3>
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
      <School size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No classes assigned yet</p>
      <p className="widget-empty__text">
        Classes you teach will appear here once they are assigned.
      </p>
    </div>
  )
}

function MyClassesCard({ classes, isLoading, error, onRetry }) {
  return (
    <Card
      title="My Classes"
      action={
        <Link to="/teacher/classes" className="form__link">
          View All Classes
        </Link>
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && classes.length === 0 ? <EmptyState /> : null}
      {!isLoading && !error && classes.length > 0 ? (
        <ul className="class-list">
          {classes.map((classRecord) => {
            const schedule = parseSchedule(classRecord.schedule || '')
            const studentCount = resolveStudentCount(classRecord)
            return (
              <li className="class-item" key={classRecord.id}>
                <span className="class-item__time">
                  {schedule.startTime || '—'}
                </span>
                <div className="class-item__info">
                  <Link
                    to={`/teacher/classes/${classRecord.id}`}
                    className="class-item__subject-link"
                  >
                    <h3 className="class-item__subject">
                      {formatClassName(classRecord)}
                    </h3>
                  </Link>
                  <p className="class-item__meta">
                    {formatClassCourseName(classRecord)}
                    {classRecord.room ? (
                      <span> · {classRecord.room}</span>
                    ) : null}
                    {studentCount != null ? (
                      <span>
                        {' '}
                        · {studentCount.toLocaleString()}{' '}
                        {studentCount === 1 ? 'student' : 'students'}
                      </span>
                    ) : null}
                  </p>
                </div>
                <ClassStatusBadge status={classRecord.status} />
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}

export default MyClassesCard