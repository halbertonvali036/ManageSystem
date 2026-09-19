import { Award } from 'lucide-react'
import Card from '@/components/common/Card'
import { formatGradeAssessmentType, formatGradeScore } from '@/models/grade'

function GradeOverviewCard({ grades }) {
  return (
    <Card title="Grade Overview">
      {grades.length === 0 ? (
        <div className="widget-empty">
          <Award size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No grades published yet</p>
          <p className="widget-empty__text">
            Grades published for your courses will appear here.
          </p>
        </div>
      ) : (
        <ul className="activity-list">
          {grades.map((record) => (
            <li className="activity-item" key={record.id}>
              <span className="activity-item__marker" aria-hidden="true" />
              <div className="activity-item__body">
                <span className="activity-item__text">
                  {formatGradeAssessmentType(record)}
                </span>
                <span className="activity-item__time">
                  {formatGradeScore(record)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default GradeOverviewCard