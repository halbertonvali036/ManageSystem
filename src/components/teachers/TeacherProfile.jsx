import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import TeacherStatusBadge from '@/components/teachers/TeacherStatusBadge'
import { GENDER_LABELS } from '@/models/gender'
import { formatTeacherName } from '@/models/teacher'

const formatDate = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
}

const formatDateTime = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

const formatGender = (gender) => {
  if (!gender) {
    return null
  }
  return GENDER_LABELS[gender] ?? gender
}

const getInitials = (teacher) => {
  const name = formatTeacherName(teacher)
  const parts = name
    .replace('-', ' ')
    .split(/\s+/)
    .filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function TeacherProfile({ teacher, onBack, onEdit, onDelete }) {
  const hasRecordDates = Boolean(teacher.createdAt || teacher.updatedAt)

  return (
    <div className="teacher-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Teachers
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Teacher
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Teacher
          </button>
        </div>
      </div>

      <Card className="teacher-profile__header">
        <span className="teacher-profile__avatar" aria-hidden="true">
          {getInitials(teacher)}
        </span>
        <div className="teacher-profile__identity">
          <h2 className="teacher-profile__name">{formatTeacherName(teacher)}</h2>
          <p className="teacher-profile__meta">
            Teacher ID:{' '}
            <span className="teacher-profile__meta-value">
              {teacher.teacherId || '—'}
            </span>
          </p>
        </div>
        <div className="teacher-profile__status">
          <TeacherStatusBadge status={teacher.status} />
        </div>
      </Card>

      <div className="teacher-details__grid">
        <Card title="Basic Information">
          <dl className="info-grid">
            <InfoItem label="First Name">{teacher.firstName || '—'}</InfoItem>
            <InfoItem label="Last Name">{teacher.lastName || '—'}</InfoItem>
            <InfoItem label="Date of Birth">
              {formatDate(teacher.dateOfBirth) || '—'}
            </InfoItem>
            <InfoItem label="Gender">
              {formatGender(teacher.gender) || '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Contact Information">
          <dl className="info-grid">
            <InfoItem label="Email">{teacher.email || '—'}</InfoItem>
            <InfoItem label="Phone">{teacher.phone || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Professional Information">
          <dl className="info-grid">
            <InfoItem label="Department">{teacher.department || '—'}</InfoItem>
            <InfoItem label="Subject / Specialization">
              {teacher.subject || '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Employment Information">
          <dl className="info-grid">
            <InfoItem label="Hire Date">
              {formatDate(teacher.hireDate) || '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Status">
          <dl className="info-grid">
            <InfoItem label="Status">
              <TeacherStatusBadge status={teacher.status} />
            </InfoItem>
          </dl>
        </Card>

        {hasRecordDates ? (
          <Card title="Record Information">
            <dl className="info-grid">
              {teacher.createdAt ? (
                <InfoItem label="Created">
                  {formatDateTime(teacher.createdAt)}
                </InfoItem>
              ) : null}
              {teacher.updatedAt ? (
                <InfoItem label="Last Updated">
                  {formatDateTime(teacher.updatedAt)}
                </InfoItem>
              ) : null}
            </dl>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default TeacherProfile