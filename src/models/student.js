export const STUDENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
})

export const STUDENT_STATUS_LABELS = Object.freeze({
  [STUDENT_STATUS.ACTIVE]: 'Active',
  [STUDENT_STATUS.INACTIVE]: 'Inactive',
  [STUDENT_STATUS.GRADUATED]: 'Graduated',
})

export { GENDER as STUDENT_GENDER, GENDER_LABELS } from '@/models/gender'

export const formatStudentName = (student) => {
  if (!student) {
    return '—'
  }
  const combined = [student.firstName, student.lastName]
    .filter(Boolean)
    .join(' ')
  return combined || student.fullName || 'Unnamed student'
}

export const formatStudentClassRef = (student) => {
  if (!student) {
    return '—'
  }
  const classRef = student.class
  if (typeof classRef === 'string') {
    return classRef || '—'
  }
  return (
    classRef?.name ||
    classRef?.className ||
    student.className ||
    classRef?.classCode ||
    '—'
  )
}

export const formatStudentCourseRef = (student) => {
  if (!student) {
    return '—'
  }
  const course = student.course
  if (typeof course === 'string') {
    return course || '—'
  }
  return (
    course?.name ||
    course?.courseName ||
    course?.courseCode ||
    student.courseName ||
    '—'
  )
}

/**
 * @typedef {Object} Student
 * @property {string} id - Internal database identifier.
 * @property {string} studentId - Public student ID shown in the UI.
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [dateOfBirth]
 * @property {keyof typeof STUDENT_GENDER | string} [gender]
 * @property {string} [className]
 * @property {keyof typeof STUDENT_STATUS | string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */