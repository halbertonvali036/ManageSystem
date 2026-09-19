export const TEACHER_STATUS = Object.freeze({
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  INACTIVE: 'inactive',
})

export const TEACHER_STATUS_LABELS = Object.freeze({
  [TEACHER_STATUS.ACTIVE]: 'Active',
  [TEACHER_STATUS.ON_LEAVE]: 'On Leave',
  [TEACHER_STATUS.INACTIVE]: 'Inactive',
})

export const formatTeacherName = (teacher) => {
  if (!teacher) {
    return '—'
  }
  const combined = [teacher.firstName, teacher.lastName]
    .filter(Boolean)
    .join(' ')
  return combined || teacher.fullName || 'Unnamed teacher'
}

/**
 * @typedef {Object} Teacher
 * @property {string} id - Internal database identifier.
 * @property {string} teacherId - Public teacher ID shown in the UI.
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [department]
 * @property {string} [subject]
 * @property {keyof typeof TEACHER_STATUS | string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */