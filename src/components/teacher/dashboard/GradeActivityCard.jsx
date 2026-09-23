import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import Card from '@/components/common/Card'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  formatGradeAssessmentType,
  formatGradeClassName,
  formatGradeDate,
  formatGradePercentage,
  formatGradeScore,
  formatGradeStudentName,
} from '@/models/grade'

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading grades&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load grades</h3>
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
      <Activity size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No grade activity yet</p>
      <p className="widget-empty__text">
        Grades you record for your classes will appear here.
      </p>
    </div>
  )
}

function GradeActivityCard({
  grades,
  count,
  isLoading,
  error,
  onRetry,
  title = 'Recent Grade Activity',
}) {
  return (
    <Card
      title={title}
      action={
        <Link to="/teacher/grades" className="form__link">
          View All
        </Link>
      }
    >
      {count != null ? (
        <p className="widget-caption">
          {count.toLocaleString()} grade{count === 1 ? '' : 's'} recorded
        </p>
      ) : null}
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && grades.length === 0 ? <EmptyState /> : null}
      {!isLoading && !error && grades.length > 0 ? (
        <ul className="activity-list">
          {grades.map((grade) => {
            const percentage = formatGradePercentage(grade)
            const className = formatGradeClassName(grade)
            return (
              <li className="activity-item" key={grade.id}>
                <span className="activity-item__marker" aria-hidden="true" />
                <div className="activity-item__body">
                  <span className="activity-item__text">
                    {formatGradeStudentName(grade)} &mdash;{' '}
                    {formatGradeAssessmentType(grade)}
                  </span>
                  <span className="activity-item__context">
                    {className !== '—' ? <span>{className}</span> : null}
                    <span> · {formatGradeDate(grade.date)}</span>
                  </span>
                </div>
                <span className="activity-item__score">
                  <span className="activity-item__score-value">
                    {formatGradeScore(grade)}
                  </span>
                  {percentage !== '—' ? (
                    <span className="activity-item__score-percent">
                      {percentage}
                    </span>
                  ) : null}
                </span>
                <GradeStatusBadge record={grade} />
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}

export default GradeActivityCard