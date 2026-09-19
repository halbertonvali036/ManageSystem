import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, ClipboardCheck, School, Users } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import ClassStatusBadge from '@/components/classes/ClassStatusBadge'
import TeacherClassStudentsCard from '@/components/teacher/classes/TeacherClassStudentsCard'
import useMyClass from '@/hooks/teacher/useMyClass'
import useMyClassStudents from '@/hooks/teacher/useMyClassStudents'
import { formatClassCourseName, formatClassName } from '@/models/class'
import { BackendNotConnectedError } from '@/services/httpClient'
import { parseSchedule } from '@/utils/classForm'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <School className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Class data is unavailable</h3>
        <p className="table-state__text">
          Class data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load class</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function TeacherClassDetails({ classId }) {
  const navigate = useNavigate()
  const { classRecord, isLoading, error, refetch } = useMyClass(classId)
  const {
    students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useMyClassStudents(classId)

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading class details&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!classRecord) {
    return null
  }

  const schedule = parseSchedule(classRecord.schedule || '')
  const startTime = schedule.startTime || classRecord.startTime || null
  const endTime = schedule.endTime || classRecord.endTime || null

  return (
    <div className="class-details details-page">
      <div className="details-toolbar">
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={() => navigate('/teacher/classes')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Classes
        </button>
        <div className="details-toolbar__actions">
          <Link to="/teacher/students" className="btn btn--icon-left">
            <Users size={16} aria-hidden="true" />
            View Students
          </Link>
          <Link to="/teacher/attendance" className="btn btn--icon-left">
            <ClipboardCheck size={16} aria-hidden="true" />
            Mark Attendance
          </Link>
          <Link to="/teacher/grades" className="btn btn--primary btn--icon-left">
            <Award size={16} aria-hidden="true" />
            Manage Grades
          </Link>
        </div>
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
            <InfoItem label="Days / Schedule">{schedule.days || '—'}</InfoItem>
            <InfoItem label="Start Time">{startTime || '—'}</InfoItem>
            <InfoItem label="End Time">{endTime || '—'}</InfoItem>
            <InfoItem label="Room">{classRecord.room || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Status">
          <dl className="info-grid">
            <InfoItem label="Class Status">
              <ClassStatusBadge status={classRecord.status} />
            </InfoItem>
          </dl>
        </Card>
      </div>

      <TeacherClassStudentsCard
        students={students}
        isLoading={studentsLoading}
        error={studentsError}
        onRetry={refetchStudents}
      />
    </div>
  )
}

function TeacherClassDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <TeacherClassDetails key={id} classId={id} />
}

export default TeacherClassDetailsPage