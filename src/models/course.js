export const COURSE_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
})

export const COURSE_STATUS_LABELS = Object.freeze({
  [COURSE_STATUS.ACTIVE]: 'Active',
  [COURSE_STATUS.INACTIVE]: 'Inactive',
  [COURSE_STATUS.ARCHIVED]: 'Archived',
})

/**
 * @typedef {Object} Course
 * @property {string} id - Internal database identifier.
 * @property {string} courseCode - Public course code shown in the UI.
 * @property {string} name - Course name.
 * @property {string} [description]
 * @property {string} [department]
 * @property {number} [credits]
 * @property {keyof typeof COURSE_STATUS | string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */