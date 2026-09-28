import { ArrowLeft, Pencil, School, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import {
  formatClassCourseName,
  formatClassName,
} from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

const formatDateTime = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

function ClassProfile({ classRecord, onBack, onEdit, onDelete }) {
  const hasRecordDates = Boolean(classRecord.createdAt || classRecord.updatedAt)
  const capacity = classRecord.capacity != null ? classRecord.capacity : null
  const schedule = parseSchedule(classRecord.schedule || '')
  const startTime = schedule.startTime || classRecord.startTime || null
  const endTime = schedule.endTime || classRecord.endTime || null

  return (
    <div className="class-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Classes
        </button>
        <div className="details-toolbar__actions">
          <button type="button" className="btn btn--icon-left" onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
            Edit Class
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Class
          </button>
        </div>
      </div>

      <Card className="class-profile__header">
        <span className="class-profile__avatar" aria-hidden="true">
          <School size={26} />
        </span>
        <div className="class-profile__identity">
          <h2 className="class-profile__name">
            {formatClassName(classRecord)}
          </h2>
          <p className="class-profile__meta">
            Class Code:{' '}
            <span className="class-profile__meta-value">
              {classRecord.classCode || '—'}
            </span>
          </p>
        </div>
        <div className="class-profile__status">
          <ClassStatusBadge status={classRecord.status} />
        </div>
      </Card>

      <div className="class-details__grid">
        <Card title="Basic Information">
          <dl className="info-grid">
            <InfoItem label="Class Code">
              {classRecord.classCode || '—'}
            </InfoItem>
            <InfoItem label="Class Name">{formatClassName(classRecord)}</InfoItem>
          </dl>
        </Card>

        <Card title="Assignment">
          <dl className="info-grid">
            <InfoItem label="Course">
              {formatClassCourseName(classRecord)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Academic Period">
          <dl className="info-grid">
            <InfoItem label="Academic Year">
              {classRecord.academicYear || '—'}
            </InfoItem>
            <InfoItem label="Semester">
              {classRecord.semester || '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Schedule &amp; Location">
          <dl className="info-grid">
            <InfoItem label="Days / Schedule">{schedule.days || '—'}</InfoItem>
            <InfoItem label="Start Time">{startTime || '—'}</InfoItem>
            <InfoItem label="End Time">{endTime || '—'}</InfoItem>
            <InfoItem label="Room">{classRecord.room || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Capacity &amp; Status">
          <dl className="info-grid">
            <InfoItem label="Capacity">{capacity ?? '—'}</InfoItem>
            <InfoItem label="Status">
              <ClassStatusBadge status={classRecord.status} />
            </InfoItem>
          </dl>
        </Card>

        {hasRecordDates ? (
          <Card title="Record Information">
            <dl className="info-grid">
              {classRecord.createdAt ? (
                <InfoItem label="Created">
                  {formatDateTime(classRecord.createdAt)}
                </InfoItem>
              ) : null}
              {classRecord.updatedAt ? (
                <InfoItem label="Last Updated">
                  {formatDateTime(classRecord.updatedAt)}
                </InfoItem>
              ) : null}
            </dl>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default ClassProfile