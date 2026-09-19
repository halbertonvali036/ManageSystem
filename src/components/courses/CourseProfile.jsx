import { ArrowLeft, BookOpen, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import CourseStatusBadge from '@/components/courses/CourseStatusBadge'
import { formatCourseTeacherName } from '@/models/course'

const formatDateTime = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

function CourseProfile({ course, onBack, onEdit, onDelete }) {
  const hasRecordDates = Boolean(course.createdAt || course.updatedAt)
  const credits = course.credits != null ? course.credits : null

  return (
    <div className="course-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Courses
        </button>
        <div className="details-toolbar__actions">
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onEdit}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit Course
          </button>
          <button
            type="button"
            className="btn btn--danger btn--icon-left"
            onClick={onDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Course
          </button>
        </div>
      </div>

      <Card className="course-profile__header">
        <span className="course-profile__avatar" aria-hidden="true">
          <BookOpen size={26} />
        </span>
        <div className="course-profile__identity">
          <h2 className="course-profile__name">{course.name || 'Unnamed course'}</h2>
          <p className="course-profile__meta">
            Course Code:{' '}
            <span className="course-profile__meta-value">
              {course.courseCode || '—'}
            </span>
          </p>
        </div>
        <div className="course-profile__status">
          <CourseStatusBadge status={course.status} />
        </div>
      </Card>

      <div className="course-details__grid">
        <Card title="Basic Information">
          <dl className="info-grid">
            <InfoItem label="Course Code">{course.courseCode || '—'}</InfoItem>
            <InfoItem label="Course Name">{course.name || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Academic Information">
          <dl className="info-grid">
            <InfoItem label="Department">{course.department || '—'}</InfoItem>
            <InfoItem label="Assigned Teacher">
              {formatCourseTeacherName(course)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Credits &amp; Status">
          <dl className="info-grid">
            <InfoItem label="Credits">{credits ?? '—'}</InfoItem>
            <InfoItem label="Status">
              <CourseStatusBadge status={course.status} />
            </InfoItem>
          </dl>
        </Card>

        <Card title="Description">
          {course.description ? (
            <p className="course-profile__description">{course.description}</p>
          ) : (
            <p className="course-profile__description course-profile__description--empty">
              No description provided.
            </p>
          )}
        </Card>

        {hasRecordDates ? (
          <Card title="Record Information">
            <dl className="info-grid">
              {course.createdAt ? (
                <InfoItem label="Created">
                  {formatDateTime(course.createdAt)}
                </InfoItem>
              ) : null}
              {course.updatedAt ? (
                <InfoItem label="Last Updated">
                  {formatDateTime(course.updatedAt)}
                </InfoItem>
              ) : null}
            </dl>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default CourseProfile