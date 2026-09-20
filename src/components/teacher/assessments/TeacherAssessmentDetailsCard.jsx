import { ArrowLeft, ClipboardList, ClipboardPen } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import AssessmentStatusBadge from '@/components/assessments/AssessmentStatusBadge'
import {
  formatAssessmentClassName,
  formatAssessmentCourseName,
  formatAssessmentDate,
  formatAssessmentMaximumScore,
  formatAssessmentTitle,
  formatAssessmentType,
} from '@/models/assessment'

function TeacherAssessmentDetailsCard({
  assessment,
  onBack,
  onEnterGrades,
}) {
  return (
    <div className="teacher-assessment-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Assessments
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--primary btn--icon-left"
            onClick={onEnterGrades}
          >
            <ClipboardPen size={16} aria-hidden="true" />
            Enter Grades
          </button>
        </div>
      </div>

      <Card className="assessment-profile__header">
        <div className="assessment-profile__avatar" aria-hidden="true">
          <ClipboardList size={26} />
        </div>
        <div className="assessment-profile__identity">
          <h2 className="assessment-profile__name">
            {formatAssessmentTitle(assessment)}
          </h2>
          <p className="assessment-profile__meta">
            <span className="assessment-profile__meta-value">
              {formatAssessmentType(assessment)}
            </span>
          </p>
        </div>
        <div className="assessment-profile__status">
          <AssessmentStatusBadge status={assessment.status} />
        </div>
      </Card>

      <div className="assessment-details__grid">
        <Card title="Details">
          <dl className="info-grid">
            <InfoItem label="Assessment Title">
              {formatAssessmentTitle(assessment)}
            </InfoItem>
            <InfoItem label="Type">{formatAssessmentType(assessment)}</InfoItem>
            <InfoItem label="Course">
              {formatAssessmentCourseName(assessment)}
            </InfoItem>
            <InfoItem label="Class">
              {formatAssessmentClassName(assessment)}
            </InfoItem>
            <InfoItem label="Maximum Score">
              {formatAssessmentMaximumScore(assessment)}
            </InfoItem>
            <InfoItem label="Date">{formatAssessmentDate(assessment)}</InfoItem>
            <InfoItem label="Status">
              <AssessmentStatusBadge status={assessment.status} />
            </InfoItem>
          </dl>
        </Card>

        <Card title="Enter Grades">
          <p className="assessment-profile__description">
            Record scores for the students enrolled in this assessment&rsquo;s
            class. The bulk grade entry page will be opened with this assessment
            preselected.
          </p>
          <div className="details-toolbar__actions">
            <button
              type="button"
              className="btn btn--primary btn--icon-left"
              onClick={onEnterGrades}
            >
              <ClipboardPen size={16} aria-hidden="true" />
              Open Bulk Grades
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TeacherAssessmentDetailsCard