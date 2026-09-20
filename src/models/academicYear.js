export const ACADEMIC_PERIOD_STATUS = Object.freeze({
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
})

export const ACADEMIC_PERIOD_STATUS_LABELS = Object.freeze({
  [ACADEMIC_PERIOD_STATUS.UPCOMING]: 'Upcoming',
  [ACADEMIC_PERIOD_STATUS.ACTIVE]: 'Active',
  [ACADEMIC_PERIOD_STATUS.COMPLETED]: 'Completed',
})

export const ACADEMIC_YEAR_STATUS = ACADEMIC_PERIOD_STATUS
export const ACADEMIC_YEAR_STATUS_LABELS = ACADEMIC_PERIOD_STATUS_LABELS

export const formatAcademicYearName = (academicYear) => {
  if (!academicYear) {
    return '—'
  }
  return academicYear.name || academicYear.academicYear || academicYear.id || '—'
}

export const formatAcademicPeriodDate = (value) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

/**
 * @typedef {Object} AcademicYearRecord
 * @property {string} id - Internal database identifier.
 * @property {string} [name] - Academic year name, e.g. "2025-2026".
 * @property {string} [academicYear]
 * @property {string} [startDate] - ISO date (YYYY-MM-DD).
 * @property {string} [endDate] - ISO date (YYYY-MM-DD).
 * @property {keyof typeof ACADEMIC_YEAR_STATUS | string} [status]
 */