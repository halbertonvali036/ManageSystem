export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
})

export const ATTENDANCE_STATUS_LABELS = Object.freeze({
  [ATTENDANCE_STATUS.PRESENT]: 'Present',
  [ATTENDANCE_STATUS.ABSENT]: 'Absent',
  [ATTENDANCE_STATUS.LATE]: 'Late',
  [ATTENDANCE_STATUS.EXCUSED]: 'Excused',
})

const resolveStudentName = (student) => {
  if (typeof student === 'string') {
    return student
  }
  if (!student) {
    return ''
  }
  const firstName = student.firstName || student.first_name || ''
  const lastName = student.lastName || student.last_name || ''
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim()
  }
  return student.fullName || student.name || student.studentName || ''
}

const resolveClassRef = (classRecord) => {
  if (typeof classRecord === 'string') {
    return classRecord
  }
  if (!classRecord) {
    return ''
  }
  return classRecord.name || classRecord.className || classRecord.classCode || ''
}

const resolveCourseName = (course) => {
  if (typeof course === 'string') {
    return course
  }
  if (!course) {
    return ''
  }
  return course.name || course.courseName || ''
}

export const formatAttendanceStudentName = (record) => {
  if (!record) {
    return '—'
  }
  return resolveStudentName(record.student) || record.studentName || '—'
}

export const formatAttendanceClassRef = (record) => {
  if (!record) {
    return '—'
  }
  return (
    resolveClassRef(record.class) ||
    record.className ||
    record.classCode ||
    record.classRef ||
    '—'
  )
}

export const formatAttendanceCourseName = (record) => {
  if (!record) {
    return '—'
  }
  return resolveCourseName(record.course) || record.courseName || '—'
}

export const formatAttendanceDate = (value) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

/**
 * @typedef {Object} AttendanceRecord
 * @property {string} id - Internal database identifier.
 * @property {string | Object} student - Student name or object.
 * @property {string} [studentId]
 * @property {string | Object} [class] - Class name or object.
 * @property {string | Object} [course] - Course name or object.
 * @property {string} [date] - Attendance date (YYYY-MM-DD).
 * @property {keyof typeof ATTENDANCE_STATUS | string} status
 * @property {string} [checkInTime]
 * @property {string} [notes]
 */