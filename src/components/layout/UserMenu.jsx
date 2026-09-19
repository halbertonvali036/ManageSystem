import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

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

  return (
    <div className="user-menu">
      <div className="user-menu__info">
        <span className="user-menu__name">{user?.name}</span>
        <span className="user-menu__role">{user?.role}</span>
      </div>
      <span className="user-menu__avatar" aria-hidden="true">
        {initials}
      </span>
      <button
        type="button"
        className="user-menu__logout"
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
      >
        <LogOut size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

export default UserMenu