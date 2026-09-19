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

export const formatCourseTeacherName = (course) => {
  if (!course) {
    return '—'
  }
  if (typeof course.teacherName === 'string' && course.teacherName.trim()) {
    return course.teacherName
  }
  const teacher = course.teacher
  if (!teacher) {
    return '—'
  }
  if (typeof teacher === 'string') {
    return teacher
  }
  return teacher.name || teacher.fullName || teacher.teacherId || '—'
}

/**
 * @typedef {Object} Course
 * @property {string} id - Internal database identifier.
 * @property {string} courseCode - Public course code shown in the UI.
 * @property {string} name - Course name.
 * @property {string} [description]
 * @property {string} [department]
 * @property {string | Object} [teacher] - Assigned teacher name or object.
 * @property {number} [credits]
 * @property {keyof typeof COURSE_STATUS | string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */