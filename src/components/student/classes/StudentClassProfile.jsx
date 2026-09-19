import { ArrowLeft, Award, BarChart3, BookOpen, CalendarDays, School } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import {
  formatClassCourseName,
  formatClassName,
  formatClassTeacherName,
} from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

const resolveCourseId = (classRecord) => {
  const raw = classRecord.course
  if (typeof raw === 'object' && raw) {
    return raw.id ?? raw.courseId ?? null
  }
  return classRecord.courseId ?? null
}

const formatTimeRange = (startTime, endTime) => {
  if (startTime && endTime) {
    return `${startTime} – ${endTime}`
  }
  return startTime || endTime || null
}

function RelatedSection({ icon: Icon, title, description, to, actionLabel }) {
  return (
    <Card title={title}>
      <div className="widget-empty">
        <Icon size={24} className="widget-empty__icon" aria-hidden="true" />
        <p className="widget-empty__title">Nothing to show yet</p>
        <p className="widget-empty__text">{description}</p>
        <Link to={to} className="form__link">
          {actionLabel}
        </Link>
      </div>
    </Card>
  )
}

function StudentClassProfile({ classRecord, onBack }) {
  const schedule = parseSchedule(classRecord.schedule || '')
  const startTime = schedule.startTime || classRecord.startTime || null
  const endTime = schedule.endTime || classRecord.endTime || null
  const timeRange = formatTimeRange(startTime, endTime)
  const days = schedule.days || classRecord.days || null
  const capacity = classRecord.capacity != null ? classRecord.capacity : null
  const courseId = resolveCourseId(classRecord)

  return (
    <div className="class-details details-page">
      <div className="details-toolbar">
        <button type="button" className="btn btn--icon-left" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Classes
        </button>
      </div>

      <Card className="class-profile__header">
        <span className="class-profile__avatar" aria-hidden="true">
          <School size={26} />
        </span>
        <div className="class-profile__identity">
          <h2 className="class-profile__name">{formatClassName(classRecord)}</h2>
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
            <InfoItem label="Class Code">{classRecord.classCode || '—'}</InfoItem>
            <InfoItem label="Class Name">{formatClassName(classRecord)}</InfoItem>
          </dl>
        </Card>

        <Card title="Assignment">
          <dl className="info-grid">
            <InfoItem label="Course">{formatClassCourseName(classRecord)}</InfoItem>
            <InfoItem label="Teacher">
              {formatClassTeacherName(classRecord)}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Academic Period">
          <dl className="info-grid">
            <InfoItem label="Academic Year">
              {classRecord.academicYear || '—'}
            </InfoItem>
            <InfoItem label="Semester">{classRecord.semester || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Schedule &amp; Location">
          <dl className="info-grid">
            <InfoItem label="Days / Schedule">{days || '—'}</InfoItem>
            <InfoItem label="Time">{timeRange || '—'}</InfoItem>
            <InfoItem label="Room">{classRecord.room || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Capacity &amp; Status">
          <dl className="info-grid">
            <InfoItem label="Capacity">{capacity ?? '—'}</InfoItem>
            <InfoItem label="Class Status">
              <ClassStatusBadge status={classRecord.status} />
            </InfoItem>
          </dl>
        </Card>
      </div>

      <div className="class-details__grid class-details__sections">
        <RelatedSection
          icon={BookOpen}
          title="Course"
          description="Course information linked to this class will appear here."
          to={courseId ? `/student/courses/${courseId}` : '/student/courses'}
          actionLabel="View Course"
        />
        <RelatedSection
          icon={CalendarDays}
          title="Schedule"
          description="Your weekly schedule for this class will appear here."
          to="/student/schedule"
          actionLabel="View Schedule"
        />
        <RelatedSection
          icon={BarChart3}
          title="Attendance"
          description="Your attendance records for this class will appear here."
          to="/student/attendance"
          actionLabel="View Attendance"
        />
        <RelatedSection
          icon={Award}
          title="Grades"
          description="Grades published for this class will appear here."
          to="/student/grades"
          actionLabel="View Grades"
        />
      </div>
    </div>
  )
}

export default StudentClassProfile