import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, ClipboardCheck, Users } from 'lucide-react'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import TeacherStudentAttendanceSummary from '@/components/teacher/students/TeacherStudentAttendanceSummary'
import TeacherStudentGradesSummary from '@/components/teacher/students/TeacherStudentGradesSummary'
import useMyStudent from '@/hooks/teacher/useMyStudent'
import useMyStudentAttendance from '@/hooks/teacher/useMyStudentAttendance'
import useMyStudentGrades from '@/hooks/teacher/useMyStudentGrades'
import {
  formatStudentClassRef,
  formatStudentCourseRef,
  formatStudentName,
} from '@/models/student'
import { BackendNotConnectedError } from '@/services/httpClient'

const getInitials = (student) => {
  const name = formatStudentName(student)
  const parts = name
    .replace('-', ' ')
    .split(/\s+/)
    .filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Student data is unavailable</h3>
        <p className="table-state__text">
          Student data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load student</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function TeacherStudentDetails({ studentId }) {
  const navigate = useNavigate()
  const { student, isLoading, error, refetch } = useMyStudent(studentId)
  const {
    records: attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useMyStudentAttendance(studentId)
  const {
    grades,
    isLoading: gradesLoading,
    error: gradesError,
    refetch: refetchGrades,
  } = useMyStudentGrades(studentId)

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading student details&hellip;
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

  if (!student) {
    return null
  }

  return (
    <div className="student-details details-page">
      <div className="details-toolbar">
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={() => navigate('/teacher/students')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to My Students
        </button>
        <div className="details-toolbar__actions">
          <Link to="/teacher/attendance" className="btn btn--icon-left">
            <ClipboardCheck size={16} aria-hidden="true" />
            View Attendance
          </Link>
          <Link to="/teacher/grades" className="btn btn--primary btn--icon-left">
            <Award size={16} aria-hidden="true" />
            View Grades
          </Link>
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
            <InfoItem label="Student ID">{student.studentId || '—'}</InfoItem>
            <InfoItem label="Full Name">{formatStudentName(student)}</InfoItem>
          </dl>
        </Card>

        <Card title="Contact Information">
          <dl className="info-grid">
            <InfoItem label="Email">
              <span className="teacher-table-cell">{student.email || '—'}</span>
            </InfoItem>
            <InfoItem label="Phone">{student.phone || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Academic Information">
          <dl className="info-grid">
            <InfoItem label="Class">{formatStudentClassRef(student)}</InfoItem>
            <InfoItem label="Course">{formatStudentCourseRef(student)}</InfoItem>
          </dl>
        </Card>

        <Card title="Status">
          <dl className="info-grid">
            <InfoItem label="Status">
              <StudentStatusBadge status={student.status} />
            </InfoItem>
          </dl>
        </Card>
      </div>

      <TeacherStudentAttendanceSummary
        records={attendance}
        isLoading={attendanceLoading}
        error={attendanceError}
        onRetry={refetchAttendance}
      />

      <TeacherStudentGradesSummary
        grades={grades}
        isLoading={gradesLoading}
        error={gradesError}
        onRetry={refetchGrades}
      />
    </div>
  )
}

function TeacherStudentDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <TeacherStudentDetails key={id} studentId={id} />
}

export default TeacherStudentDetailsPage