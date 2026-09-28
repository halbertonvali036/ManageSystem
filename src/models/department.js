export const DEPARTMENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export const DEPARTMENT_STATUS_LABELS = Object.freeze({
  [DEPARTMENT_STATUS.ACTIVE]: 'Active',
  [DEPARTMENT_STATUS.INACTIVE]: 'Inactive',
})

const resolveHeadName = (head) => {
  if (typeof head === 'string') {
    return head
  }
  return head?.fullName ?? head?.name ?? ''
}

export const formatDepartmentName = (department) => {
  if (!department) {
    return '—'
  }
  return (
    department.name ||
    department.departmentName ||
    department.departmentCode ||
    '—'
  )
}

export const formatDepartmentCode = (department) => {
  if (!department) {
    return '—'
  }
  return department.departmentCode || department.code || '—'
}

export const formatDepartmentHead = (department) => {
  if (!department) {
    return '—'
  }
  return resolveHeadName(department.headOfDepartment) || '—'
}

/**
 * @typedef {Object} DepartmentRecord
 * @property {string} id - Internal database identifier.
 * @property {string} [departmentCode] - Short department code.
 * @property {string} [code]
 * @property {string} [name]
 * @property {string} [departmentName]
 * @property {string} [description]
 * @property {string | Object} [headOfDepartment] - Department head name or object.
 * @property {keyof typeof DEPARTMENT_STATUS | string} [status]
 */