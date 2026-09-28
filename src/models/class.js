export const CLASS_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
})

export const CLASS_STATUS_LABELS = Object.freeze({
  [CLASS_STATUS.SCHEDULED]: 'Scheduled',
  [CLASS_STATUS.ACTIVE]: 'Active',
  [CLASS_STATUS.COMPLETED]: 'Completed',
})

const resolveName = (value) => {
  if (typeof value === 'string') {
    return value
  }
  return value?.name ?? value?.className ?? ''
}

export const formatClassName = (classRecord) => {
  if (!classRecord) {
    return '—'
  }
  return classRecord.name || classRecord.className || 'Unnamed class'
}

export const formatClassCourseName = (classRecord) => {
  if (!classRecord) {
    return '—'
  }
  return (
    resolveName(classRecord.course) ||
    classRecord.courseName ||
    '—'
  )
}

/**
 * @typedef {Object} ClassRecord
 * @property {string} id - Internal database identifier.
 * @property {string} classCode - Public class code shown in the UI.
 * @property {string} name - Class name.
 * @property {string | Object} [course] - Course name or object.
 * @property {string} [academicYear]
 * @property {string} [semester]
 * @property {string} [schedule]
 * @property {string} [room]
 * @property {number} [capacity]
 * @property {keyof typeof CLASS_STATUS | string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */