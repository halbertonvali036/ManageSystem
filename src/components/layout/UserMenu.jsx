import { LogOut, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { getRoleProfilePath, ROLE_NAMES } from '@/utils/roles'

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const profilePath = getRoleProfilePath(user?.role)
  const roleLabel = ROLE_NAMES[user?.role] ?? user?.role

  return (
    <div className="user-menu" data-role={user?.role}>
      <Link
        to={profilePath}
        className="user-menu__identity"
        aria-label={`Profile: ${user?.name ?? 'User'}`}
        title="Profile"
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="user-menu__info">
          <span className="user-menu__name">{user?.name ?? 'User'}</span>
          <span className="user-menu__meta">
            <span className="user-menu__role">{roleLabel}</span>
            {user?.email ? (
              <span className="user-menu__email">{user.email}</span>
            ) : null}
          </span>
        </span>
      </Link>
      <span className="user-menu__divider" aria-hidden="true" />
      <div className="user-menu__actions">
        <Link
          to={profilePath}
          className="user-menu__action user-menu__action--profile"
          aria-label="Open profile"
          title="Profile"
        >
          <UserRound size={16} aria-hidden="true" />
          <span className="user-menu__action-label">Profile</span>
        </Link>
        <button
          type="button"
          className="user-menu__action user-menu__action--logout"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default UserMenu