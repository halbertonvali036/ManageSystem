import { roleMatchesPortal } from '@/utils/roles'
import { BILLING_PATH, SECURITY_PATH, WORKSPACES_PATH } from '@/utils/constants'

/**
 * Severity reported by the backend. Purely presentational: it drives the icon
 * and colour, never behaviour.
 */
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

/**
 * Product categories. These describe *what* a notification is about and map to
 * the modules that already exist in this portal, so a category always has a
 * real destination to open. Nothing here creates a record or a route.
 */
export const NOTIFICATION_CATEGORY = Object.freeze({
  WEBSITE: 'website', PUBLISHING: 'publishing', DOMAIN: 'domain',
  SYSTEM: 'system', ACCOUNT: 'account', BILLING: 'billing',
})
export const NOTIFICATION_CATEGORIES = Object.freeze(Object.values(NOTIFICATION_CATEGORY))
const CATEGORY_ALIASES = Object.freeze({
  site: 'website', websites: 'website', publish: 'publishing', domains: 'domain',
  security: 'account', account_security: 'account', profile: 'account',
  invoice: 'billing', payment: 'billing', subscription: 'billing',
})
const CATEGORY_META = Object.freeze({
  website: { label: 'Website', icon: 'globe' },
  publishing: { label: 'Publishing', icon: 'globe' },
  domain: { label: 'Domain', icon: 'globe' },
  system: { label: 'System', icon: 'info' },
  account: { label: 'Account & Security', icon: 'shield' },
  billing: { label: 'Billing', icon: 'card' },
})
const CATEGORY_TARGET = Object.freeze({
  website: WORKSPACES_PATH, publishing: WORKSPACES_PATH, domain: WORKSPACES_PATH, system: '/notifications',
  account: SECURITY_PATH, billing: BILLING_PATH,
})

export const NOTIFICATION_CATEGORY_LABELS = Object.freeze(
  Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((category) => [category, CATEGORY_META[category].label]),
  ),
)

export const NOTIFICATION_CATEGORY_ICONS = Object.freeze(
  Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((category) => [category, CATEGORY_META[category].icon]),
  ),
)

export const NOTIFICATION_READ_STATE = Object.freeze({
  READ: 'read',
  UNREAD: 'unread',
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

/** Stable identifier used for React keys and for `markNotificationRead`. */
export const getNotificationId = (notification) => {
  const value = notification?.id ?? notification?._id ?? notification?.notificationId
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }
  return String(value)
}

export const getNotificationType = (notification) => {
  const type = notification?.type
  if (NOTIFICATION_TYPES.includes(type)) {
    return type
  }
  return NOTIFICATION_TYPE.INFO
}

export const getNotificationTypeLabel = (notification) =>
  NOTIFICATION_TYPE_LABELS[getNotificationType(notification)]

/**
 * Normalises a backend category. Unknown or absent values resolve to `null`
 * rather than guessing, so a record is never relabelled with a category the
 * backend did not send.
 */
export const getNotificationCategory = (notification) => {
  const raw = notification?.category ?? notification?.kind ?? notification?.topic
  if (typeof raw !== 'string') {
    return null
  }
  const normalized = raw.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (NOTIFICATION_CATEGORIES.includes(normalized)) {
    return normalized
  }
  return CATEGORY_ALIASES[normalized] ?? null
}

export const getNotificationCategoryLabel = (notification) => {
  const category = getNotificationCategory(notification)
  return category ? CATEGORY_META[category].label : null
}

export const getNotificationCategoryIcon = (notification) => {
  const category = getNotificationCategory(notification)
  return category ? CATEGORY_META[category].icon : null
}

/** Normalises a category filter, or `null` when it is "all". */
export const toNotificationCategoryFilter = (value) => {
  if (value === 'all' || value === undefined || value === null) {
    return null
  }
  return getNotificationCategory({ category: value })
}

export const formatNotificationTitle = (notification) => notification?.title ?? ''

export const formatNotificationMessage = (notification) => notification?.message ?? ''

/** Parsed creation time, or `null` when the backend did not send a usable one. */
export const getNotificationDate = (notification) => {
  const value =
    notification?.createdAt ??
    notification?.created_at ??
    notification?.date ??
    notification?.sentAt ??
    notification?.sent_at
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatNotificationCreatedAt = (notification) => {
  const date = getNotificationDate(notification)
  if (!date) {
    return ''
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Machine-readable value for `<time dateTime>`. Readable labels stay
 * localised, the attribute stays ISO so assistive tech and the DOM agree.
 */
export const getNotificationDateTime = (notification) =>
  getNotificationDate(notification)?.toISOString() ?? null

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Short relative label, e.g. `just now`, `12m ago`, `3h ago`, `Mar 4`.
 * Purely derived from the backend timestamp; never a substitute for it.
 */
export const formatNotificationRelativeTime = (notification, now = Date.now()) => {
  const date = getNotificationDate(notification)
  if (!date) {
    return ''
  }
  const seconds = Math.round((now - date.getTime()) / 1000)
  if (seconds < 0) {
    return 'just now'
  }
  if (seconds < MINUTE) {
    return 'just now'
  }
  if (seconds < HOUR) {
    return `${Math.floor(seconds / MINUTE)}m ago`
  }
  if (seconds < DAY) {
    return `${Math.floor(seconds / HOUR)}h ago`
  }
  if (seconds < 7 * DAY) {
    return `${Math.floor(seconds / DAY)}d ago`
  }
  return formatNotificationCreatedAt(notification)
}

/** Accept only local routes that this account may navigate to. */
const scopePath = (path, role) => {
  if (typeof path !== 'string' || !path || path.startsWith('//') || /[\\:\s]/.test(path)) return null
  const direct = path.startsWith('/') ? path : `/${path}`
  const pathname = direct.split(/[?#]/)[0]
  return roleMatchesPortal(role, pathname) ? direct : null
}

/**
 * Resolve a notification target against the signed-in role.
 *
 * A backend `target` always wins. Without one, the item's own category points
 * at the matching page that already exists in this portal — the record itself
 * is never created, altered or routed anywhere new.
 *
 * Supported target shapes:
 * - `{ path: '/sites' }`                    → direct route (auto-scoped to role portal)
 * - `{ path: '/admin/audit', role }`      → explicit route reserved for a role
 * - `{ route: 'sites/:id', id: '5', role }` → relative route + params, resolved under the role portal
 *
 * Returns `null` when the target is absent or not meant for the given role,
 * so cross-role routes are never generated.
 */
export const resolveNotificationTarget = (notification, role) => {
  const target = notification?.target
  if (!target) {
    const category = getNotificationCategory(notification)
    const fallback = category ? CATEGORY_TARGET[category] : null
    return fallback ? scopePath(fallback, role) : null
  }
  if (target.role && target.role !== role) {
    return null
  }
  if (typeof target.path === 'string' && target.path) {
    return scopePath(target.path, role)
  }
  if (typeof target.route === 'string' && target.route) {
    const withParams = target.id
      ? target.route.replace(':id', encodeURIComponent(String(target.id)))
      : target.route
    return scopePath(withParams, role)
  }
  return null
}

/**
 * @typedef {Object} Notification
 * @property {string} id - Internal database identifier.
 * @property {string} [title]
 * @property {string} [message]
 * @property {keyof typeof NOTIFICATION_TYPE | string} [type] - Severity, presentational only.
 * @property {keyof typeof NOTIFICATION_CATEGORY | string} [category] - What the item is about.
 * @property {string} [createdAt] - ISO date string.
 * @property {boolean} [isRead] - Read/unread state.
 * @property {boolean} [read] - Alternate read/unread field.
 * @property {Object} [target] - Optional role-scoped navigation target.
 * @property {string} [target.path] - Full route.
 * @property {string} [target.route] - Route relative to the role portal.
 * @property {string} [target.id] - Optional route param.
 * @property {keyof typeof ROLES | string} [target.role] - Role the target belongs to.
 */
