import { ArrowLeft, BookMarked, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import SubjectStatusBadge from '@/components/subjects/SubjectStatusBadge'
import {
  formatSubjectCode,
  formatSubjectDepartmentName,
  formatSubjectName,
} from '@/models/subject'

function SubjectProfile({ subject, onBack, onEdit, onDelete }) {
  return (
    <div className="subject-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Subjects
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Subject
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Subject
          </button>
        </div>
      </div>

      <Card className="subject-profile__header">
        <div className="subject-profile__avatar" aria-hidden="true">
          <BookMarked size={26} />
        </div>
        <div className="subject-profile__identity">
          <h2 className="subject-profile__name">{formatSubjectName(subject)}</h2>
          <p className="subject-profile__meta">
            <span className="subject-profile__meta-value">
              {formatSubjectCode(subject)}
            </span>
          </p>
        </div>
        <div className="subject-profile__status">
          <SubjectStatusBadge status={subject.status} />
        </div>
      </Card>

      <div className="subject-details__grid">
        <Card title="Details">
          <dl className="info-grid">
            <InfoItem label="Subject Code">
              {formatSubjectCode(subject)}
            </InfoItem>
            <InfoItem label="Subject Name">{formatSubjectName(subject)}</InfoItem>
            <InfoItem label="Department">
              {formatSubjectDepartmentName(subject)}
            </InfoItem>
            <InfoItem label="Status">
              <SubjectStatusBadge status={subject.status} />
            </InfoItem>
          </dl>
        </Card>

        <Card title="Description">
          <p
            className={`subject-profile__description${
              subject.description ? '' : ' subject-profile__description--empty'
            }`}
          >
            {subject.description || 'No description provided.'}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default SubjectProfile