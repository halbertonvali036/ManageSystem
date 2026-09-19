import { Activity } from 'lucide-react'
import Card from '@/components/common/Card'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  computeGradePercentage,
  formatGradeAssessmentType,
  formatGradeClassName,
  formatGradeDate,
  formatGradeScore,
} from '@/models/grade'
import { BackendNotConnectedError } from '@/services/httpClient'

function LoadingState() {
  return (
    <Card title="Grade Summary">
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading grades&hellip;
      </div>
    </Card>
  )
}

function UnavailableState() {
  return (
    <Card title="Grade Summary">
      <div className="table-state">
        <Activity className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Grade summary is unavailable</h3>
        <p className="table-state__text">
          Grades will appear here when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card title="Grade Summary">
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load grades</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card title="Grade Summary">
      <div className="table-state">
        <Activity className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No grades recorded</h3>
        <p className="table-state__text">
          Grades recorded for this student will appear here.
        </p>
      </div>
    </Card>
  )
}

function TeacherStudentGradesSummary({ grades, isLoading, error, onRetry }) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={onRetry} />
    )
  }

  if (grades.length === 0) {
    return <EmptyState />
  }

  const percentages = grades.map(computeGradePercentage).filter((value) => value !== null)
  const average =
    percentages.length > 0
      ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
      : null

  return (
    <Card title="Grade Summary" action={`${grades.length} grades`}>
      {average !== null ? (
        <p className="summary-average" aria-label={`Average ${average} percent`}>
          Average: <strong>{average}%</strong>
        </p>
      ) : null}
      <ul className="activity-list">
        {grades.slice(0, 5).map((grade) => (
          <li className="activity-item" key={grade.id}>
            <span className="activity-item__marker" aria-hidden="true" />
            <div className="activity-item__body">
              <span className="activity-item__text">
                {formatGradeAssessmentType(grade)} &mdash;{' '}
                {formatGradeClassName(grade) || '—'}
              </span>
              <span className="activity-item__time">
                {formatGradeScore(grade)} &middot; {formatGradeDate(grade.date)}
              </span>
            </div>
            <GradeStatusBadge record={grade} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default TeacherStudentGradesSummary