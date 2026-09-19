import { formatDepartmentName } from '@/models/department'

export const SUBJECT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
})

export const SUBJECT_STATUS_LABELS = Object.freeze({
  [SUBJECT_STATUS.ACTIVE]: 'Active',
  [SUBJECT_STATUS.INACTIVE]: 'Inactive',
  [SUBJECT_STATUS.ARCHIVED]: 'Archived',
})

export const formatSubjectName = (subject) => {
  if (!subject) {
    return '—'
  }
  return subject.name || subject.subjectName || subject.subjectCode || '—'
}

export const formatSubjectCode = (subject) => {
  if (!subject) {
    return '—'
  }
  return subject.subjectCode || subject.code || '—'
}

export const formatSubjectDepartmentName = (subject) => {
  if (!subject) {
    return '—'
  }
  if (subject.department) {
    return formatDepartmentName(subject.department)
  }
  return (
    subject.departmentName ||
    subject.departmentCode ||
    '—'
  )
}

/**
 * @typedef {Object} SubjectRecord
 * @property {string} id - Internal database identifier.
 * @property {string} [subjectCode] - Short subject code.
 * @property {string} [code]
 * @property {string} [name]
 * @property {string} [subjectName]
 * @property {string | Object} [department] - Department name or object.
 * @property {string} [description]
 * @property {keyof typeof SUBJECT_STATUS | string} [status]
 */