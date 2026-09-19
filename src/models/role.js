export const ROLE_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export const ROLE_STATUS_LABELS = Object.freeze({
  [ROLE_STATUS.ACTIVE]: 'Active',
  [ROLE_STATUS.INACTIVE]: 'Inactive',
})

export const formatRoleName = (role) => {
  if (!role) {
    return '—'
  }
  return role.name || role.roleName || role.code || '—'
}

export const formatRoleDescription = (role) => {
  if (!role) {
    return '—'
  }
  return role.description || 'No description provided.'
}

export const formatRoleUserCount = (role) => {
  if (!role) {
    return '—'
  }
  const count = role.userCount ?? role.numOfUsers ?? role.usersCount
  return count === null || count === undefined ? '—' : count
}

/**
 * @typedef {Object} RoleRecord
 * @property {string} id
 * @property {string} [roleId] - Public role ID shown in the UI.
 * @property {string} [name]
 * @property {string} [code]
 * @property {string} [description]
 * @property {string[] | Object[]} [permissions] - Permission keys or objects.
 * @property {number} [userCount] - Number of users assigned to the role.
 * @property {number} [numOfUsers]
 * @property {keyof typeof ROLE_STATUS | string} [status]
 */