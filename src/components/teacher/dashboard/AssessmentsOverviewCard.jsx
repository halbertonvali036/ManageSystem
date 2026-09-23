import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import Card from '@/components/common/Card'
import AssessmentStatusBadge from '@/components/assessments/AssessmentStatusBadge'
import {
  formatAssessmentClassName,
  formatAssessmentDate,
  formatAssessmentTitle,
  formatAssessmentType,
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
        Assessments assigned to your classes will appear here.
      </p>
    </div>
  )
}

function AssessmentsOverviewCard({ assessments, isLoading, error, onRetry }) {
  return (
    <Card
      title="Assessments"
      action={
        <Link to="/teacher/assessments" className="form__link">
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
        <ul className="assessments-overview">
          {assessments.map((assessment) => {
            const gradeLink =
              assessment.id != null
                ? `/teacher/grades/bulk?assessmentId=${assessment.id}`
                : null
            return (
              <li className="assessments-overview__item" key={assessment.id}>
                <div className="assessments-overview__body">
                  <span className="assessments-overview__type">
                    {formatAssessmentType(assessment)}
                  </span>
                  <h3 className="assessments-overview__title">
                    {formatAssessmentTitle(assessment)}
                  </h3>
                  <p className="assessments-overview__meta">
                    {formatAssessmentClassName(assessment)}
                  </p>
                </div>
                <div className="assessments-overview__side">
                  <span className="assessments-overview__date">
                    {formatAssessmentDate(assessment)}
                  </span>
                  <AssessmentStatusBadge status={assessment.status} />
                  {gradeLink ? (
                    <Link
                      to={gradeLink}
                      className="assessments-overview__grade"
                    >
                      Enter Grades
                    </Link>
                  ) : null}
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