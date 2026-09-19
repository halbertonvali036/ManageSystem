import { Menu } from 'lucide-react'
import UserMenu from '@/components/layout/UserMenu'
import { TEACHER_PORTAL_LABEL } from '@/utils/teacherConstants'

function TeacherHeader({ onOpenMobile }) {
  return (
    <header className="app-header">
      <div className="app-header__start">
        <button
          type="button"
          className="app-header__menu"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <span className="teacher-context">{TEACHER_PORTAL_LABEL}</span>
      </div>
      <UserMenu />
    </header>
  )
}

export default TeacherHeader