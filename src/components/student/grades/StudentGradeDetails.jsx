import { ArrowLeft } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import GradeStatusBadge from '@/components/grades/GradeStatusBadge'
import {
  deriveGradeLetter,
  formatGradeAssessmentType,
  formatGradeClassName,
  formatGradeCourseName,
  formatGradeDate,
  formatGradeMaximumScore,
  formatGradePercentage,
  formatGradeScoreValue,
} from '@/models/grade'

function StudentGradeDetails({ grade, onBack }) {
  const assessmentName = grade.assessmentName || 'Unnamed assessment'
  const hasLetterGrade = Boolean(deriveGradeLetter(grade))

  return (
    <div className="grade-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Grades
        </button>
      </div>

      <Card className="grade-profile__header">
        <div className="grade-profile__avatar" aria-hidden="true">
          {formatGradeAssessmentType(grade).charAt(0)}
        </div>
        <div className="grade-profile__identity">
          <h2 className="grade-profile__name">{assessmentName}</h2>
          <p className="grade-profile__meta">
            {formatGradeAssessmentType(grade)} &middot;{' '}
            <span className="grade-profile__meta-value">
              {formatGradeCourseName(grade)}
            </span>
          </p>
        </div>
        <div className="grade-profile__status">
          {hasLetterGrade ? <GradeStatusBadge record={grade} /> : '—'}
        </div>
      </Card>

      <div className="grade-details__grid">
        <Card title="Assessment">
          <dl className="info-grid">
            <InfoItem label="Assessment Type">
              {formatGradeAssessmentType(grade)}
            </InfoItem>
            <InfoItem label="Assessment Name">
              {grade.assessmentName || '—'}
            </InfoItem>
            <InfoItem label="Course">
              {formatGradeCourseName(grade)}
            </InfoItem>
            <InfoItem label="Class">{formatGradeClassName(grade)}</InfoItem>
            <InfoItem label="Date">{formatGradeDate(grade.date)}</InfoItem>
          </dl>
        </Card>

        <Card title="Result">
          <dl className="info-grid">
            <InfoItem label="Score">{formatGradeScoreValue(grade)}</InfoItem>
            <InfoItem label="Maximum Score">
              {formatGradeMaximumScore(grade)}
            </InfoItem>
            <InfoItem label="Percentage">
              {formatGradePercentage(grade)}
            </InfoItem>
            <InfoItem label="Letter Grade">
              {hasLetterGrade ? <GradeStatusBadge record={grade} /> : '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Notes">
          <p
            className={`grade-profile__notes${
              grade.notes ? '' : ' grade-profile__notes--empty'
            }`}
          >
            {grade.notes || 'No notes provided.'}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default StudentGradeDetails