import { Activity } from 'lucide-react'
import Card from '@/components/common/Card'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  formatGradeAssessmentType,
  formatGradeDate,
  formatGradeScore,
  formatGradeStudentName,
} from '@/models/grade'

function GradeActivityCard({ grades }) {
  return (
    <Card title="Recent Grade Activity">
      {grades.length === 0 ? (
        <div className="widget-empty">
          <Activity size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No grade activity yet</p>
          <p className="widget-empty__text">
            Grades you record for your classes will appear here.
          </p>
        </div>
      ) : (
        <ul className="activity-list">
          {grades.map((grade) => (
            <li className="activity-item" key={grade.id}>
              <span className="activity-item__marker" aria-hidden="true" />
              <div className="activity-item__body">
                <span className="activity-item__text">
                  {formatGradeStudentName(grade)} &mdash; {formatGradeAssessmentType(grade)}
                </span>
                <span className="activity-item__time">
                  {formatGradeScore(grade)} &middot; {formatGradeDate(grade.date)}
                </span>
              </div>
              <GradeStatusBadge record={grade} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default GradeActivityCard