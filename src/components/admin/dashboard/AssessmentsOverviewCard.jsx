import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import Card from '@/components/common/Card'
import AssessmentStatusBadge from '@/components/assessments/AssessmentStatusBadge'
import {
  formatAssessmentClassName,
  formatAssessmentCourseName,
  formatAssessmentDate,
  formatAssessmentTitle,
  formatAssessmentType,
  getAssessmentClassId,
} from '@/models/assessment'

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading assessments&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load assessments</h3>
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
      <ClipboardList size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No assessments yet</p>
      <p className="widget-empty__text">
        Assessments across your classes will appear here.
      </p>
    </div>
  )
}

function AssessmentsOverviewCard({ assessments, isLoading, error, onRetry }) {
  return (
    <Card
      title="Assessments"
      action={
        <Link to="/assessments" className="form__link">
          View All
        </Link>
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && assessments.length === 0 ? (
        <EmptyState />
      ) : null}
      {!isLoading && !error && assessments.length > 0 ? (
        <ul className="assessment-list">
          {assessments.map((assessment) => {
            const classId = getAssessmentClassId(assessment)
            const courseName = formatAssessmentCourseName(assessment)
            return (
              <li className="assessment-item" key={assessment.id}>
                <div className="assessment-item__body">
                  <span className="assessment-item__type">
                    {formatAssessmentType(assessment)}
                  </span>
                  <h3 className="assessment-item__title">
                    {formatAssessmentTitle(assessment)}
                  </h3>
                  <div className="assessment-item__meta">
                    {classId ? (
                      <Link
                        to={`/classes/${classId}`}
                        className="assessment-item__class-link"
                      >
                        {formatAssessmentClassName(assessment)}
                      </Link>
                    ) : (
                      <span>{formatAssessmentClassName(assessment)}</span>
                    )}
                    {courseName !== '—' ? <span>{courseName}</span> : null}
                  </div>
                </div>
                <div className="assessment-item__side">
                  <span className="assessment-item__date">
                    {formatAssessmentDate(assessment)}
                  </span>
                  <AssessmentStatusBadge status={assessment.status} />
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}

export default AssessmentsOverviewCard