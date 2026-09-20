import {
  ACADEMIC_PERIOD_STATUS,
  ACADEMIC_PERIOD_STATUS_LABELS,
  formatAcademicPeriodDate,
} from '@/models/academicYear'

export const SEMESTER_STATUS = ACADEMIC_PERIOD_STATUS
export const SEMESTER_STATUS_LABELS = ACADEMIC_PERIOD_STATUS_LABELS

export const formatSemesterName = (semester) => {
  if (!semester) {
    return '—'
  }
  return semester.name || semester.semester || semester.id || '—'
}

export const formatSemesterDates = (semester) => {
  if (!semester || (!semester.startDate && !semester.endDate)) {
    return '—'
  }
  return `${formatAcademicPeriodDate(semester.startDate)} – ${formatAcademicPeriodDate(semester.endDate)}`
}

/**
 * @typedef {Object} SemesterRecord
 * @property {string} id - Internal database identifier.
 * @property {string} [academicYearId] - Parent academic year identifier.
 * @property {string} [name] - Semester name, e.g. "Semester 1" or "Fall 2026".
 * @property {string} [semester]
 * @property {string} [startDate] - ISO date (YYYY-MM-DD).
 * @property {string} [endDate] - ISO date (YYYY-MM-DD).
 * @property {keyof typeof SEMESTER_STATUS | string} [status]
 */