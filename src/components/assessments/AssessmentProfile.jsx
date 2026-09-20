import { ArrowLeft, ClipboardList, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import AssessmentStatusBadge from '@/components/assessments/AssessmentStatusBadge'
import {
  formatAssessmentClassName,
  formatAssessmentCourseCode,
  formatAssessmentCourseName,
  formatAssessmentDate,
  formatAssessmentMaximumScore,
  formatAssessmentTitle,
  formatAssessmentType,
} from '@/models/assessment'

function AssessmentProfile({ assessment, onBack, onEdit, onDelete }) {
  return (
    <div className="assessment-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Assessments
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Assessment
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Assessment
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
            <InfoItem label="Course Code">
              {formatAssessmentCourseCode(assessment)}
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

        <Card title="Description">
          <p
            className={`assessment-profile__description${
              assessment.description
                ? ''
                : ' assessment-profile__description--empty'
            }`}
          >
            {assessment.description || 'No description provided.'}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default AssessmentProfile