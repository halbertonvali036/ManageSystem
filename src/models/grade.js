export const GRADE_ASSESSMENT_TYPES = Object.freeze({
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  MIDTERM: 'midterm',
  FINAL: 'final',
  PROJECT: 'project',
})

export const GRADE_ASSESSMENT_TYPE_LABELS = Object.freeze({
  [GRADE_ASSESSMENT_TYPES.QUIZ]: 'Quiz',
  [GRADE_ASSESSMENT_TYPES.ASSIGNMENT]: 'Assignment',
  [GRADE_ASSESSMENT_TYPES.MIDTERM]: 'Midterm',
  [GRADE_ASSESSMENT_TYPES.FINAL]: 'Final',
  [GRADE_ASSESSMENT_TYPES.PROJECT]: 'Project',
})

export const GRADE_LETTER_LABELS = Object.freeze({
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  F: 'F',
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

const resolveClassName = (classRecord) => {
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
  return course.name || course.courseName || course.courseCode || ''
}

const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const formatGradeStudentName = (record) => {
  if (!record) {
    return '—'
  }
  return resolveStudentName(record.student) || record.studentName || '—'
}

export const formatGradeStudentId = (record) => {
  if (!record) {
    return '—'
  }
  return (
    record.studentId ||
    record.student?.studentId ||
    record.student?.id ||
    '—'
  )
}

export const formatGradeCourseName = (record) => {
  if (!record) {
    return '—'
  }
  return resolveCourseName(record.course) || record.courseName || '—'
}

export const formatGradeClassName = (record) => {
  if (!record) {
    return '—'
  }
  return (
    resolveClassName(record.class) ||
    record.className ||
    record.classCode ||
    '—'
  )
}

export const formatGradeAssessmentType = (record) => {
  const type = record?.assessmentType || record?.examType || record?.gradeType
  if (!type) {
    return '—'
  }
  const label = GRADE_ASSESSMENT_TYPE_LABELS[type]
  if (label) {
    return label
  }
  const normalized = String(type).replace(/[_-]+/g, ' ').trim()
  return normalized
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const formatGradeScore = (record) => {
  if (!record) {
    return '—'
  }
  const score = normalizeNumber(record.score)
  const maximum = normalizeNumber(
    record.maximumScore ?? record.maxScore ?? record.totalScore,
  )
  if (score === null && maximum === null) {
    return '—'
  }
  if (maximum === null) {
    return String(score)
  }
  return `${score} / ${maximum}`
}

export const formatGradeScoreValue = (record) => {
  const score = record ? normalizeNumber(record.score) : null
  return score === null ? '—' : String(score)
}

export const formatGradeMaximumScore = (record) => {
  const maximum = record
    ? normalizeNumber(record.maximumScore ?? record.maxScore ?? record.totalScore)
    : null
  return maximum === null ? '—' : String(maximum)
}

export const computeGradePercentage = (record) => {
  if (!record) {
    return null
  }
  const percentage = normalizeNumber(record.percentage)
  if (percentage !== null) {
    return percentage
  }
  const score = normalizeNumber(record.score)
  const maximum = normalizeNumber(
    record.maximumScore ?? record.maxScore ?? record.totalScore,
  )
  if (score !== null && maximum !== null && maximum > 0) {
    return Math.round((score / maximum) * 100)
  }
  return null
}

export const formatGradePercentage = (record) => {
  const percentage = computeGradePercentage(record)
  return percentage === null ? '—' : `${percentage}%`
}

export const resolveGradeLetter = (record) => {
  if (!record) {
    return ''
  }
  const letter = record.letterGrade || record.grade || record.letter
  return typeof letter === 'string' ? letter.trim().toUpperCase() : ''
}

export const deriveGradeLetter = (record) => {
  const letter = resolveGradeLetter(record)
  return /^[A-F]/.test(letter) ? letter.charAt(0) : ''
}

export const formatGradeDate = (value) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

/**
 * @typedef {Object} GradeRecord
 * @property {string} id - Internal database identifier.
 * @property {string | Object} student - Student name or object.
 * @property {string} [studentId]
 * @property {string | Object} [course] - Course name or object.
 * @property {string | Object} [class] - Class name or object.
 * @property {keyof typeof GRADE_ASSESSMENT_TYPES | string} [assessmentType]
 * @property {string} [assessmentName] - Assessment name for display.
 * @property {string} [assessmentId] - Optional linked assessment reference.
 * @property {number | string} [score]
 * @property {number | string} [maximumScore]
 * @property {number | string} [percentage]
 * @property {string} [letterGrade] - Letter grade provided by the backend.
 * @property {string} [grade] - Fallback letter-grade value.
 * @property {string} [date] - Grade date (YYYY-MM-DD).
 * @property {string} [notes]
 * @property {string} [status]
 */