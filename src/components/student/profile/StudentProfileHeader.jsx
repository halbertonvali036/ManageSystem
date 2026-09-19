import { GraduationCap, KeyRound, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import { formatStudentName } from '@/models/student'

function StudentProfileHeader({ profile, sessionUser }) {
  const displayName = formatStudentName(profile) || sessionUser?.name || 'Student'
  const studentId = profile?.studentId || sessionUser?.id || '—'
  const className = profile?.className || '—'

  return (
    <Card className="profile-header">
      <span className="profile-header__avatar" aria-hidden="true">
        <GraduationCap size={28} />
      </span>
      <div className="profile-header__identity">
        <h2 className="profile-header__name">{displayName}</h2>
        <p className="profile-header__meta">
          Student ID: <span className="profile-header__meta-value">{studentId}</span>
          {className && className !== '—' ? (
            <>
              {' '}
              &middot; Class: <span className="profile-header__meta-value">{className}</span>
            </>
          ) : null}
        </p>
      </div>
      <div className="profile-header__actions">
        <Link to="/student/profile/edit" className="btn btn--icon-left">
          <Pencil size={16} aria-hidden="true" />
          Edit Profile
        </Link>
        <Link
          to="/student/profile/change-password"
          className="btn btn--outline btn--icon-left"
        >
          <KeyRound size={16} aria-hidden="true" />
          Change Password
        </Link>
      </div>
    </Card>
  )
}

export default StudentProfileHeader