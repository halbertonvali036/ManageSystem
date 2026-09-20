import { ROLES } from '@/utils/roles'

export const NOTIFICATION_TYPE = Object.freeze({
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
})

export const NOTIFICATION_TYPE_LABELS = Object.freeze({
  [NOTIFICATION_TYPE.INFO]: 'Information',
  [NOTIFICATION_TYPE.SUCCESS]: 'Success',
  [NOTIFICATION_TYPE.WARNING]: 'Warning',
  [NOTIFICATION_TYPE.ERROR]: 'Alert',
})

export const NOTIFICATION_TYPES = Object.freeze(Object.values(NOTIFICATION_TYPE))

export const NOTIFICATION_READ_STATE = Object.freeze({
  READ: 'read',
  UNREAD: 'unread',
})

/**
 * Role portal prefixes used to scope notification target routes.
 * Admin routes live at the root, teacher/student routes are portal-scoped.
 */
const ROLE_PORTAL_PREFIX = Object.freeze({
  [ROLES.ADMIN]: '',
  [ROLES.TEACHER]: '/teacher',
  [ROLES.STUDENT]: '/student',
})

const resolveReadState = (notification) => {
  if (!notification) {
    return null
  }
  if (typeof notification.isRead === 'boolean') {
    return notification.isRead
      ? NOTIFICATION_READ_STATE.READ
      : NOTIFICATION_READ_STATE.UNREAD
  }
  if (typeof notification.read === 'boolean') {
    return notification.read
      ? NOTIFICATION_READ_STATE.READ
      : NOTIFICATION_READ_STATE.UNREAD
  }
  if (
    notification.status === NOTIFICATION_READ_STATE.UNREAD ||
    notification.status === NOTIFICATION_READ_STATE.READ
  ) {
    return notification.status
  }
  return null
}

export const isNotificationUnread = (notification) =>
  resolveReadState(notification) === NOTIFICATION_READ_STATE.UNREAD

export const getNotificationType = (notification) => {
  const type = notification?.type
  if (NOTIFICATION_TYPES.includes(type)) {
    return type
  }
  return NOTIFICATION_TYPE.INFO
}

export const getNotificationTypeLabel = (notification) =>
  NOTIFICATION_TYPE_LABELS[getNotificationType(notification)]

export const formatNotificationTitle = (notification) => notification?.title ?? ''

export const formatNotificationMessage = (notification) => notification?.message ?? ''

export const formatNotificationCreatedAt = (notification) => {
  const value =
    notification?.createdAt ??
    notification?.created_at ??
    notification?.date
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Resolve a notification target against the signed-in role.
 *
 * Supported target shapes:
 * - `{ path: '/grades' }`                    → direct route (auto-scoped to role portal)
 * - `{ path: '/teacher/grades', role }`      → explicit route reserved for a role
 * - `{ route: 'grades/:id', id: '5', role }` → relative route + params, resolved under the role portal
 *
 * Returns `null` when the target is absent or not meant for the given role,
 * so cross-role routes are never generated.
 */
export const resolveNotificationTarget = (notification, role) => {
  const target = notification?.target
  if (!target) {
    return null
  }
  if (target.role && target.role !== role) {
    return null
  }
  if (typeof target.path === 'string' && target.path) {
    const direct = target.path.startsWith('/') ? target.path : `/${target.path}`
    return ROLE_PORTAL_PREFIX[role]
      ? `${ROLE_PORTAL_PREFIX[role]}${direct}`
      : direct
  }
  if (typeof target.route === 'string' && target.route) {
    const withParams = target.id
      ? target.route.replace(':id', String(target.id))
      : target.route
    const scoped = withParams.replace(/^\/+/, '')
    return ROLE_PORTAL_PREFIX[role]
      ? `${ROLE_PORTAL_PREFIX[role]}/${scoped}`
      : `/${scoped}`
  }
  return null
}

/**
 * @typedef {Object} Notification
 * @property {string} id - Internal database identifier.
 * @property {string} [title]
 * @property {string} [message]
 * @property {keyof typeof NOTIFICATION_TYPE | string} [type]
 * @property {string} [createdAt] - ISO date string.
 * @property {boolean} [isRead] - Read/unread state.
 * @property {boolean} [read] - Alternate read/unread field.
 * @property {Object} [target] - Optional role-scoped navigation target.
 * @property {string} [target.path] - Full route.
 * @property {string} [target.route] - Route relative to the role portal.
 * @property {string} [target.id] - Optional route param.
 * @property {keyof typeof ROLES | string} [target.role] - Role the target belongs to.
 */