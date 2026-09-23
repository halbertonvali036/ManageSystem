import { Link } from 'react-router-dom'
import { Award } from 'lucide-react'
import Card from '@/components/common/Card'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  formatGradeAssessmentType,
  formatGradeClassName,
  formatGradeDate,
  formatGradePercentage,
  formatGradeScore,
} from '@/models/grade'

function LoadingState() {
  return (
    <div className="widget-status">
      <span className="spinner" aria-hidden="true" />
      Loading grades&hellip;
    </div>
  )
}

function EmptyState() {
  return (
    <div className="widget-empty widget-empty--compact">
      <Award size={24} className="widget-empty__icon" aria-hidden="true" />
      <p className="widget-empty__title">No grades published yet</p>
      <p className="widget-empty__text">
        Grades published for your courses will appear here.
      </p>
    </div>
  )
}

function GradeOverviewCard({ grades, isLoading }) {
  return (
    <Card
      title="Grade Overview"
      action={
        grades.length > 0 ? (
          <Link to="/student/grades" className="form__link">
            View Grades
          </Link>
        ) : null
      }
    >
      {isLoading ? <LoadingState /> : null}
      {!isLoading && grades.length === 0 ? <EmptyState /> : null}
      {!isLoading && grades.length > 0 ? (
        <ul className="activity-list">
          {grades.map((record) => {
            const percentage = formatGradePercentage(record)
            return (
              <li className="activity-item" key={record.id}>
                <span className="activity-item__marker" aria-hidden="true" />
                <div className="activity-item__body">
                  <span className="activity-item__text">
                    {formatGradeAssessmentType(record)}
                  </span>
                  <span className="activity-item__context">
                    <span>{formatGradeClassName(record)}</span>
                    <span> · {formatGradeDate(record.date)}</span>
                  </span>
                </div>
                <span className="activity-item__score">
                  <span className="activity-item__score-value">
                    {formatGradeScore(record)}
                  </span>
                  {percentage !== '—' ? (
                    <span className="activity-item__score-percent">
                      {percentage}
                    </span>
                  ) : null}
                </span>
                <GradeStatusBadge record={record} />
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}

export default GradeOverviewCard