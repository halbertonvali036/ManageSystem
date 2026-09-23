export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
})

export const ROLE_NAMES = Object.freeze({
  [ROLES.ADMIN]: 'Admin',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
})

export const ROLE_DASHBOARD_PATHS = Object.freeze({
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
})

export const ROLE_PROFILE_PATHS = Object.freeze({
  [ROLES.ADMIN]: '/settings#admin-profile',
  [ROLES.TEACHER]: '/teacher/profile',
  [ROLES.STUDENT]: '/student/profile',
})

export const getRoleDashboardPath = (role) =>
  ROLE_DASHBOARD_PATHS[role] ?? ROLE_DASHBOARD_PATHS[ROLES.ADMIN]

export const getRoleProfilePath = (role) =>
  ROLE_PROFILE_PATHS[role] ?? ROLE_PROFILE_PATHS[ROLES.ADMIN]

export const isKnownRole = (role) =>
  role === ROLES.ADMIN || role === ROLES.TEACHER || role === ROLES.STUDENT

export const roleMatchesPortal = (role, pathname) => {
  if (!isKnownRole(role)) {
    return false
  }
  if (pathname === '/login') {
    return true
  }
  // Shared notifications page is available to every authenticated role.
  if (pathname === '/notifications') {
    return true
  }
  if (pathname === '/student' || pathname.startsWith('/student/')) {
    return role === ROLES.STUDENT
  }
  if (pathname === '/teacher' || pathname.startsWith('/teacher/')) {
    return role === ROLES.TEACHER
  }
  return role === ROLES.ADMIN
}
