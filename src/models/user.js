export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export const USER_STATUS_LABELS = Object.freeze({
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
})

export const formatUserName = (user) => {
  if (!user) {
    return '—'
  }
  const combined = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
  return (
    combined ||
    user.fullName ||
    user.name ||
    user.username ||
    'Unnamed user'
  )
}

export const formatUserEmail = (user) => {
  if (!user) {
    return '—'
  }
  return user.email || '—'
}

export const formatUserRole = (user) => {
  if (!user) {
    return '—'
  }
  if (typeof user.role === 'string') {
    return user.role
  }
  if (user.role) {
    return user.role.name || user.role.label || user.role.roleName || '—'
  }
  return '—'
}

export const formatLastLogin = (user) => {
  if (!user || !user.lastLogin) {
    return '—'
  }
  const date = new Date(user.lastLogin)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleString()
}

export const formatUserCreatedAt = (user) => {
  if (!user || !user.createdAt) {
    return '—'
  }
  const date = new Date(user.createdAt)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleString()
}

/**
 * @typedef {Object} UserRecord
 * @property {string} id
 * @property {string} [userId] - Public user ID shown in the UI.
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [fullName]
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [username]
 * @property {string | Object} [role] - Role code/name or object with a name.
 * @property {keyof typeof USER_STATUS | string} [status]
 * @property {string} [lastLogin]
 * @property {string} [createdAt]
 */