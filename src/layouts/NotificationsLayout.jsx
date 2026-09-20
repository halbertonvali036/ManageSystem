import useAuth from '@/hooks/useAuth'
import MainLayout from '@/layouts/MainLayout'
import StudentLayout from '@/layouts/StudentLayout'
import TeacherLayout from '@/layouts/TeacherLayout'
import { ROLES } from '@/utils/roles'

/**
 * Shared /notifications route shell.
 * Renders the signed-in role's current layout so notifications live
 * inside the right portal (admin / teacher / student) without duplicating.
 */
function NotificationsLayout() {
  const { user } = useAuth()

  if (user?.role === ROLES.TEACHER) {
    return <TeacherLayout />
  }
  if (user?.role === ROLES.STUDENT) {
    return <StudentLayout />
  }
  return <MainLayout />
}

export default NotificationsLayout