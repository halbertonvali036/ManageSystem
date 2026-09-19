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