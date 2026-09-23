import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatAssessmentClassName,
  formatAssessmentDate,
  formatAssessmentMaximumScore,
  formatAssessmentTitle,
  formatAssessmentType,
} from '@/models/assessment'

function LoadingState() {
  return (
    <div className="widget-status">
      <span className="spinner" aria-hidden="true" />
      Loading assessments&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="widget-state widget-state--error">
      <p className="widget-state__title">Failed to load assessments</p>
      <p className="widget-state__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty widget-empty--compact">
      <CalendarClock size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No upcoming assessments</p>
      <p className="widget-empty__text">
        Assessments scheduled for you will appear here.
      </p>
    </div>
  )
}

function UpcomingAssessmentsCard({ assessments, isLoading, error, onRetry }) {
  return (
    <Card
      title="Upcoming Assessments"
      action={
        <Link to="/student/assessments" className="form__link">
          View all
        </Link>
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && assessments.length === 0 ? <EmptyState /> : null}
      {!isLoading && !error && assessments.length > 0 ? (
        <ul className="assessments-overview">
          {assessments.map((assessment) => {
            const maximum = formatAssessmentMaximumScore(assessment)
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
                  {maximum !== '—' ? (
                    <span className="assessments-overview__score">
                      Max {maximum}
                    </span>
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

export default UpcomingAssessmentsCard