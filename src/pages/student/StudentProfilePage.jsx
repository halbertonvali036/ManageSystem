import useAuth from '@/hooks/useAuth'
import useMyProfile from '@/hooks/student/useMyProfile'
import Card from '@/components/common/Card'
import InfoItem from '@/components/common/InfoItem'
import StudentProfileHeader from '@/components/student/profile/StudentProfileHeader'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import {
  formatStudentClassRef,
  formatStudentCourseRef,
  formatStudentName,
  GENDER_LABELS,
  STUDENT_STATUS_LABELS,
} from '@/models/student'
import { BackendNotConnectedError } from '@/services/httpClient'
import { ROLE_NAMES } from '@/utils/roles'

const formatDisplayDate = (value) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

const resolveGender = (profile) =>
  (profile && GENDER_LABELS[profile.gender]) || profile?.gender || '—'

const resolveStatus = (profile) => {
  if (!profile || !profile.status) {
    return null
  }
  if (STUDENT_STATUS_LABELS[profile.status]) {
    return profile.status
  }
  return null
}

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading profile&hellip;
      </div>
    </Card>
  )
}

function UnavailableState({ message }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Profile not available</h3>
        <p className="table-state__text">{message}</p>
      </div>
    </Card>
  )
}

function StudentProfilePage() {
  const { user: sessionUser } = useAuth()
  const { profile, isLoading, error } = useMyProfile()

  if (isLoading) {
    return <LoadingState />
  }

  if (error instanceof BackendNotConnectedError) {
    return (
      <UnavailableState
        message="Your full profile will be available here once the backend API is connected. You can still review your courses, schedule and attendance."
      />
    )
  }

  if (error || !profile) {
    return <UnavailableState message={error?.message || 'Profile data is unavailable right now.'} />
  }

  const displayName =
    profile.fullName || formatStudentName(profile) || sessionUser?.name || 'Student'
  const studentId = profile.studentId ?? profile.username ?? '—'
  const className = formatStudentClassRef(profile)
  const courseName = formatStudentCourseRef(profile)
  const email = profile.email || sessionUser?.email || '—'
  const role = profile.role || sessionUser?.role || 'student'
  const status = resolveStatus(profile)

  return (
    <div>
      <p className="page-description">
        Review the profile and account details associated with your student
        record.
      </p>

      <StudentProfileHeader profile={profile} sessionUser={sessionUser} />

      <div className="class-details__grid">
        <Card title="Personal Information">
          <dl className="info-grid">
            <InfoItem label="Full Name">
              {displayName || '—'}
            </InfoItem>
            <InfoItem label="Date of Birth">
              {formatDisplayDate(profile.dateOfBirth)}
            </InfoItem>
            <InfoItem label="Gender">{resolveGender(profile)}</InfoItem>
          </dl>
        </Card>

        <Card title="Contact Information">
          <dl className="info-grid">
            <InfoItem label="Email">{email}</InfoItem>
            <InfoItem label="Phone">{profile.phone || '—'}</InfoItem>
          </dl>
        </Card>

        <Card title="Academic Information">
          <dl className="info-grid">
            <InfoItem label="Student ID">{studentId}</InfoItem>
            <InfoItem label="Class">{className}</InfoItem>
            <InfoItem label="Course">{courseName}</InfoItem>
            <InfoItem label="Enrollment Date">
              {formatDisplayDate(profile.enrollmentDate || profile.enrolledAt)}
            </InfoItem>
            <InfoItem label="Status">
              {status ? <StudentStatusBadge status={status} /> : profile.status || '—'}
            </InfoItem>
          </dl>
        </Card>

        <Card title="Account Information">
          <dl className="info-grid">
            <InfoItem label="Username">{profile.username || '—'}</InfoItem>
            <InfoItem label="Role">
              {ROLE_NAMES[role] || role || '—'}
            </InfoItem>
            <InfoItem label="Last Login">
              {formatDisplayDate(profile.lastLogin || profile.lastLoginAt)}
            </InfoItem>
          </dl>
        </Card>
      </div>
    </div>
  )
}

export default StudentProfilePage