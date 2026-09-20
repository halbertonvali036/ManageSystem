import { parseSchedule } from '@/utils/classForm'

const DAY_KEYS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
]

const DAY_LOOKUP = {
  Sun: 'Sun',
  Sunday: 'Sun',
  Mon: 'Mon',
  Monday: 'Mon',
  Tue: 'Tue',
  Tues: 'Tue',
  Tuesday: 'Tue',
  Wed: 'Wed',
  Wednesday: 'Wed',
  Thu: 'Thu',
  Thur: 'Thu',
  Thurs: 'Thu',
  Thursday: 'Thu',
  Fri: 'Fri',
  Friday: 'Fri',
  Sat: 'Sat',
  Saturday: 'Sat',
}

const resolveClassRef = (item) => {
  if (!item) {
    return ''
  }
  if (typeof item.class === 'string') {
    return item.class
  }
  const classRef = item.class
  return (
    classRef?.name ||
    classRef?.className ||
    classRef?.classCode ||
    item.className ||
    item.classCode ||
    ''
  )
}

const formatWeekdayKey = (value) => {
  if (!value) {
    return ''
  }
  const normalized = String(value)
    .trim()
    .replace(/^day-of-week$/i, '')
    .replace(/[_-]+/g, ' ')
  return DAY_LOOKUP[normalized] || ''
}

export const formatScheduleClassName = (item) => resolveClassRef(item) || '—'

export const formatScheduleCourseName = (item) => {
  if (!item) {
    return '—'
  }
  if (typeof item.course === 'string') {
    return item.course || '—'
  }
  return (
    item.course?.name ||
    item.course?.courseName ||
    item.course?.courseCode ||
    item.courseName ||
    '—'
  )
}

export const formatScheduleTimeRange = (item) => {
  if (!item) {
    return '—'
  }
  const startTime = item.startTime || item.timeStart || ''
  const endTime = item.endTime || item.timeEnd || ''
  if (startTime && endTime) {
    return `${startTime} – ${endTime}`
  }
  return startTime || endTime || '—'
}

export const formatScheduleRoom = (item) => item?.room || '—'

export const formatScheduleDate = (item) => {
  if (!item) {
    return '—'
  }
  if (item.date) {
    return item.date
  }
  return item.day || item.dayOfWeek || '—'
}

export const resolveScheduleClassId = (item) =>
  item?.classId ?? item?.class?.id ?? null

export const getScheduleDayKeys = (item) => {
  if (!item) {
    return []
  }
  const keys = new Set()
  const add = (value) => {
    const key = formatWeekdayKey(value)
    if (key) {
      keys.add(key)
    }
  }
  if (Array.isArray(item.day)) {
    item.day.forEach(add)
  } else {
    add(item.day)
  }
  add(item.dayOfWeek)
  if (item.date) {
    const date = new Date(item.date)
    if (!Number.isNaN(date.getTime())) {
      add(DAY_KEYS[(date.getDay() + 6) % 7])
    }
  }
  if (typeof item.schedule === 'string' || item.class?.schedule) {
    const parsed = parseSchedule(item.schedule || item.class?.schedule)
    parsed.days
      .split(/\s+/)
      .filter(Boolean)
      .forEach(add)
  }
  return [...keys]
}

export const WEEKDAY_KEYS = DAY_KEYS

export const SCHEDULE_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
})

export const SCHEDULE_STATUS_LABELS = Object.freeze({
  [SCHEDULE_STATUS.ACTIVE]: 'Active',
  [SCHEDULE_STATUS.INACTIVE]: 'Inactive',
})

const DAY_LONG_LABELS = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
}

export const SCHEDULE_DAY_OPTIONS = DAY_KEYS.map((key) => ({
  value: key,
  label: DAY_LONG_LABELS[key] || key,
}))

export const formatScheduleDayShortLabel = (value) => {
  if (!value) {
    return '—'
  }
  return formatWeekdayKey(value) || '—'
}

export const formatScheduleDayLabel = (value) => {
  if (!value) {
    return '—'
  }
  const key = formatWeekdayKey(value)
  return DAY_LONG_LABELS[key] || '—'
}

export const formatScheduleTeacherName = (item) => {
  if (!item) {
    return '—'
  }
  if (typeof item.teacherName === 'string' && item.teacherName.trim()) {
    return item.teacherName
  }
  const teacher = item.teacher
  if (!teacher) {
    return '—'
  }
  if (typeof teacher === 'string') {
    return teacher
  }
  return teacher.fullName || teacher.name || teacher.teacherId || '—'
}

export const formatScheduleAcademicYearName = (item) => {
  if (!item) {
    return '—'
  }
  if (typeof item.academicYear === 'string' || typeof item.academicYearName === 'string') {
    return item.academicYearName || item.academicYear || '—'
  }
  return (
    item.academicYear?.name ||
    item.academicYear?.academicYear ||
    item.academicYearId ||
    '—'
  )
}

export const formatScheduleSemesterName = (item) => {
  if (!item) {
    return '—'
  }
  if (typeof item.semester === 'string' || typeof item.semesterName === 'string') {
    return item.semesterName || item.semester || '—'
  }
  return item.semester?.name || item.semesterId || '—'
}

export const resolveScheduleCourseId = (item) => {
  const raw = item?.course
  return (
    item?.courseId ??
    (typeof raw === 'string' ? raw : raw?.id ?? raw?.courseId) ??
    null
  )
}

export const resolveScheduleTeacherId = (item) => {
  const raw = item?.teacher
  return (
    item?.teacherId ??
    (typeof raw === 'string' ? raw : raw?.id ?? raw?.teacherId) ??
    null
  )
}

export const resolveScheduleAcademicYearId = (item) =>
  item?.academicYearId ?? item?.academicYear?.id ?? null

export const resolveScheduleSemesterId = (item) =>
  item?.semesterId ?? item?.semester?.id ?? null

/**
 * @typedef {Object} ScheduleEntry
 * @property {string} id - Internal database identifier.
 * @property {string} [academicYearId]
 * @property {string} [semesterId]
 * @property {string} [classId]
 * @property {string} [courseId]
 * @property {string} [teacherId]
 * @property {string} dayOfWeek - Matches SCHEDULE_DAY_OPTIONS values (Mon-Sun).
 * @property {string} startTime - HH:MM.
 * @property {string} endTime - HH:MM.
 * @property {string} [room]
 * @property {keyof typeof SCHEDULE_STATUS | string} status
 */