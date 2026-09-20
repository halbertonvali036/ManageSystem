import { formatClassName } from '@/models/class'

export const ASSESSMENT_TYPES = Object.freeze({
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  MIDTERM: 'midterm',
  FINAL: 'final',
  PROJECT: 'project',
})

export const ASSESSMENT_TYPE_LABELS = Object.freeze({
  [ASSESSMENT_TYPES.QUIZ]: 'Quiz',
  [ASSESSMENT_TYPES.ASSIGNMENT]: 'Assignment',
  [ASSESSMENT_TYPES.MIDTERM]: 'Midterm',
  [ASSESSMENT_TYPES.FINAL]: 'Final',
  [ASSESSMENT_TYPES.PROJECT]: 'Project',
})

export const ASSESSMENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
})

export const ASSESSMENT_STATUS_LABELS = Object.freeze({
  [ASSESSMENT_STATUS.DRAFT]: 'Draft',
  [ASSESSMENT_STATUS.PUBLISHED]: 'Published',
  [ASSESSMENT_STATUS.CLOSED]: 'Closed',
})

const resolveName = (value) => {
  if (typeof value === 'string') {
    return value
  }
  return value?.name ?? value?.courseName ?? ''
}

const resolveClassRef = (assessment) => {
  if (!assessment) {
    return null
  }
  if (typeof assessment.class === 'string') {
    return { name: assessment.class }
  }
  return assessment.class && typeof assessment.class === 'object'
    ? assessment.class
    : null
}

const resolveCourseRef = (assessment) => {
  if (!assessment) {
    return null
  }
  if (typeof assessment.course === 'string') {
    return { name: assessment.course }
  }
  return assessment.course && typeof assessment.course === 'object'
    ? assessment.course
    : null
}

const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const formatAssessmentTitle = (assessment) => {
  if (!assessment) {
    return '—'
  }
  return assessment.title || assessment.assessmentName || 'Untitled assessment'
}

export const formatAssessmentType = (assessment) => {
  const type = assessment?.type ?? assessment?.assessmentType
  if (!type) {
    return '—'
  }
  const label = ASSESSMENT_TYPE_LABELS[type]
  if (label) {
    return label
  }
  const normalized = String(type).replace(/[_-]+/g, ' ').trim()
  return normalized
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const getAssessmentCourseId = (assessment) => {
  if (!assessment) {
    return null
  }
  const courseRef = resolveCourseRef(assessment)
  return assessment.courseId ?? courseRef?.id ?? null
}

export const getAssessmentClassId = (assessment) => {
  if (!assessment) {
    return null
  }
  const classRef = resolveClassRef(assessment)
  return assessment.classId ?? classRef?.id ?? null
}

export const formatAssessmentCourseName = (assessment) => {
  if (!assessment) {
    return '—'
  }
  const courseRef = resolveCourseRef(assessment)
  return resolveName(courseRef) || assessment.courseName || '—'
}

export const formatAssessmentCourseCode = (assessment) => {
  if (!assessment) {
    return '—'
  }
  const courseRef = resolveCourseRef(assessment)
  return (
    courseRef?.courseCode ??
    assessment.courseCode ??
    '—'
  )
}

export const formatAssessmentClassName = (assessment) => {
  if (!assessment) {
    return '—'
  }
  const classRef = resolveClassRef(assessment)
  return classRef ? formatClassName(classRef) : assessment.className || '—'
}

export const formatAssessmentClassCode = (assessment) => {
  if (!assessment) {
    return '—'
  }
  const classRef = resolveClassRef(assessment)
  return classRef?.classCode ?? assessment.classCode ?? '—'
}

export const formatAssessmentMaximumScore = (assessment) => {
  const maximum = assessment
    ? normalizeNumber(assessment.maximumScore ?? assessment.maxScore)
    : null
  return maximum === null ? '—' : String(maximum)
}

export const formatAssessmentDate = (assessment) => {
  const value =
    assessment?.date ?? assessment?.dueDate ?? assessment?.assessmentDate
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString()
}

export const normalizeAssessments = (rawList) => {
  if (!Array.isArray(rawList)) {
    return []
  }
  return rawList
    .map((raw) => {
      if (!raw || typeof raw !== 'object') {
        return null
      }
      return {
        id: raw.id ?? null,
        title: raw.title ?? raw.assessmentName ?? null,
        type: raw.type ?? raw.assessmentType ?? null,
        courseId: getAssessmentCourseId(raw),
        classId: getAssessmentClassId(raw),
        maximumScore:
          normalizeNumber(raw.maximumScore ?? raw.maxScore) ?? null,
        date: raw.date ?? raw.dueDate ?? raw.assessmentDate ?? null,
        description: raw.description ?? null,
        status: raw.status ?? null,
        course: resolveCourseRef(raw),
        class: resolveClassRef(raw),
      }
    })
    .filter((assessment) => assessment && assessment.id != null)
}

/**
 * @typedef {Object} AssessmentRecord
 * @property {string} id - Internal database identifier.
 * @property {string} [title] - Assessment title shown in the UI.
 * @property {keyof typeof ASSESSMENT_TYPES | string} [type]
 * @property {string} [courseId]
 * @property {string | Object} [course] - Course name or object.
 * @property {string} [classId]
 * @property {string | Object} [class] - Class name or object.
 * @property {number} [maximumScore]
 * @property {string} [date] - Assessment date (YYYY-MM-DD).
 * @property {string} [description]
 * @property {keyof typeof ASSESSMENT_STATUS | string} [status]
 */