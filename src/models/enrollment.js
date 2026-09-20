export const ENROLLMENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
})

export const ENROLLMENT_STATUS_LABELS = Object.freeze({
  [ENROLLMENT_STATUS.ACTIVE]: 'Active',
  [ENROLLMENT_STATUS.COMPLETED]: 'Completed',
  [ENROLLMENT_STATUS.DROPPED]: 'Dropped',
})

export const formatEnrollmentStatus = (status) => {
  if (!status) {
    return null
  }
  return ENROLLMENT_STATUS_LABELS[status] ?? status
}

const resolveName = (value) => {
  if (typeof value === 'string') {
    return value || null
  }
  return value?.name || value?.className || null
}

const resolveClassRef = (enrollment) => {
  if (!enrollment) {
    return null
  }
  if (typeof enrollment.class === 'string') {
    return { name: enrollment.class || null }
  }
  return enrollment.class && typeof enrollment.class === 'object'
    ? enrollment.class
    : null
}

export const toEnrollmentRecord = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const classRef = resolveClassRef(raw)
  const courseRef = classRef?.course ?? raw.course
  return {
    id: raw.id ?? null,
    studentId: raw.studentId ?? raw.student_id ?? null,
    classId: raw.classId ?? raw.class_id ?? classRef?.id ?? null,
    enrolledAt: raw.enrolledAt ?? raw.enrolled_at ?? null,
    status: raw.status ?? null,
    student: raw.student ?? null,
    class: {
      id: classRef?.id ?? raw.classId ?? raw.class_id ?? null,
      classCode: classRef?.classCode ?? null,
      name: resolveName(classRef) ?? null,
      course: resolveName(courseRef) ?? null,
      academicYear: classRef?.academicYear ?? raw.academicYear ?? null,
      semester: classRef?.semester ?? raw.semester ?? null,
    },
  }
}

export const toRosterEntry = (raw) => {
  const enrollment = toEnrollmentRecord(raw)
  if (!enrollment) {
    return null
  }
  const embedded = enrollment.student
  const student = {
    id: embedded?.id ?? enrollment.studentId,
    studentId: embedded?.studentId ?? embedded?.id ?? enrollment.studentId,
    firstName: embedded?.firstName ?? null,
    lastName: embedded?.lastName ?? null,
    fullName: embedded?.fullName ?? null,
    email: embedded?.email ?? null,
    status: embedded?.status ?? null,
  }
  const hasIdentity = Boolean(
    student.id ||
      student.studentId ||
      student.firstName ||
      student.lastName ||
      student.fullName,
  )
  if (!hasIdentity) {
    return null
  }
  return { enrollment, student }
}

export const normalizeEnrollments = (rawList) => {
  if (!Array.isArray(rawList)) {
    return []
  }
  return rawList.map(toEnrollmentRecord).filter(Boolean)
}

export const normalizeRoster = (rawList) => {
  if (!Array.isArray(rawList)) {
    return []
  }
  return rawList.map(toRosterEntry).filter(Boolean)
}

/**
 * @typedef {Object} EnrollmentRecord
 * @property {string} [id]
 * @property {string} [studentId]
 * @property {string} [classId]
 * @property {string} [enrolledAt]
 * @property {string} [status]
 * @property {Object} [student]
 * @property {Object} [class]
 * @property {string} [class.id]
 * @property {string} [class.classCode]
 * @property {string} [class.name]
 * @property {string} [class.course]
 * @property {string} [class.academicYear]
 * @property {string} [class.semester]
 */