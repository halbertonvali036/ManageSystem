import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import {
  GENDER_LABELS,
  formatStudentName,
} from '@/models/student'

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

const getInitials = (student) => {
  const name = formatStudentName(student)
  const parts = name
    .replace('-', ' ')
    .split(/\s+/)
    .filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function StudentProfile({ student, onBack, onEdit, onDelete }) {
  const hasRecordDates = Boolean(student.createdAt || student.updatedAt)

  return (
    <div className="student-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Students
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Student
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Student
          </button>
        </div>
      </div>

      <Card className="student-profile__header">
        <span className="student-profile__avatar" aria-hidden="true">
          {getInitials(student)}
        </span>
        <div className="student-profile__identity">
          <h2 className="student-profile__name">{formatStudentName(student)}</h2>
          <p className="student-profile__meta">
            Student ID:{' '}
            <span className="student-profile__meta-value">
              {student.studentId || '—'}
            </span>
          </p>
        </div>
        <div className="student-profile__status">
          <StudentStatusBadge status={student.status} />
        </div>
      </Card>

      <div className="student-details__grid">
        <Card title="Basic Information">
          <dl className="info-grid">
            <InfoItem label="First Name">
              {student.firstName || '—'}
            </InfoItem>
            <InfoItem label="Last Name">{student.lastName || '—'}</InfoItem>
            <InfoItem label="Date of Birth">
              {formatDate(student.dateOfBirth) || '—'}
            </InfoItem>
            <InfoItem label="Gender">{formatGender(student.gender) || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Contact Information">
          <dl className="info-grid">
            <InfoItem label="Email">{student.email || '—'}</InfoItem>
            <InfoItem label="Phone">{student.phone || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Academic Information">
          <dl className="info-grid">
            <InfoItem label="Class">{student.className || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Status">
          <dl className="info-grid">
            <InfoItem label="Status">
              <StudentStatusBadge status={student.status} />
            </InfoItem>
          </dl>
        </Card>

        {hasRecordDates ? (
          <Card title="Record Information">
            <dl className="info-grid">
              {student.createdAt ? (
                <InfoItem label="Created">
                  {formatDateTime(student.createdAt)}
                </InfoItem>
              ) : null}
              {student.updatedAt ? (
                <InfoItem label="Last Updated">
                  {formatDateTime(student.updatedAt)}
                </InfoItem>
              ) : null}
            </dl>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default StudentProfile