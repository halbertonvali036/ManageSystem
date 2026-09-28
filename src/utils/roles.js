import { PROFILE_PATH, LEGACY_ACADEMIC_NAV_ITEMS } from '@/utils/constants'

/** Public accounts are platform users. Administration is provisioned internally. */
export const ROLES = Object.freeze({ USER: 'user', ADMIN: 'admin' })
export const ROLE_NAMES = Object.freeze({ [ROLES.USER]: 'User', [ROLES.ADMIN]: 'Admin' })
export const PUBLIC_ROLES = Object.freeze([ROLES.USER])
export const USER_HOME_PATH = '/sites'
export const ADMIN_HOME_PATH = '/admin'
export const ROLE_DASHBOARD_PATHS = Object.freeze({ user: USER_HOME_PATH, admin: ADMIN_HOME_PATH })
export const ROLE_PROFILE_PATHS = Object.freeze({ user: PROFILE_PATH, admin: '/settings#admin-profile' })
export const isKnownRole = (role) => role === ROLES.USER || role === ROLES.ADMIN
export const getRoleDashboardPath = (role) => ROLE_DASHBOARD_PATHS[role] ?? USER_HOME_PATH
export const getRoleProfilePath = (role) => ROLE_PROFILE_PATHS[role] ?? PROFILE_PATH
const matchesPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
const SHARED_PATHS = ['/sites', '/templates', '/dashboard', '/notifications', '/billing', '/security', '/account', '/403']
export const isAdminPath = (pathname) => matchesPrefix(pathname, '/admin') ||
  LEGACY_ACADEMIC_NAV_ITEMS.some(({ path }) => matchesPrefix(pathname, path))

/** Route guards are UI isolation; the backend must enforce authorization too. */
export const roleMatchesPortal = (role, pathname) => isKnownRole(role) && (
  SHARED_PATHS.some((prefix) => matchesPrefix(pathname, prefix)) ||
  (role === ROLES.ADMIN && isAdminPath(pathname))
)
