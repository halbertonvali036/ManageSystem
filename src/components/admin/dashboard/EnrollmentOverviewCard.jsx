import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import { formatClassName, formatClassCourseName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading enrollment data&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load enrollment data</h3>
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
      <Users size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No classes yet</p>
      <p className="widget-empty__text">
        Enrolled students per class will appear here once classes exist.
      </p>
    </div>
  )
}

const displayCount = (value) => (value == null ? '—' : value.toLocaleString())

function EnrollmentOverviewCard({ classes, isLoading, error, onRetry }) {
  return (
    <Card
      title="Enrollments"
      action={
        <Link to="/classes" className="form__link">
          Manage Classes
        </Link>
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && classes.length === 0 ? <EmptyState /> : null}
      {!isLoading && !error && classes.length > 0 ? (
        <>
          <p className="widget-caption">Enrolled students by class</p>
          <ul className="class-list">
            {classes.map((item) => {
              const classRecord = item.class
              const schedule = parseSchedule(classRecord?.schedule || '')
              return (
                <li className="class-item" key={classRecord.id}>
                  <span className="class-item__time">
                    {schedule.startTime || '—'}
                  </span>
                  <div className="class-item__info">
                    <Link
                      to={`/classes/${classRecord.id}`}
                      className="class-item__subject-link"
                    >
                      <h3 className="class-item__subject">
                        {formatClassName(classRecord)}
                      </h3>
                    </Link>
                    <p className="class-item__meta">
                      {formatClassCourseName(classRecord)}
                    </p>
                  </div>
                  <span className="class-item__count">
                    {displayCount(item.count)}{' '}
                    <span className="class-item__count-label">
                      {item.count === 1 ? 'student' : 'students'}
                    </span>
                  </span>
                  <ClassStatusBadge status={classRecord.status} />
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </Card>
  )
}

export default EnrollmentOverviewCard