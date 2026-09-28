const EMPTY_FORM_VALUES = {
  classCode: '',
  name: '',
  course: '',
  academicYear: '',
  semester: '',
  room: '',
  capacity: '',
  startTime: '',
  endTime: '',
  days: '',
  status: '',
}

const TIME_RANGE_SEPARATOR = '–'

const resolveCourseValue = (classRecord) => {
  if (classRecord.courseId) {
    return classRecord.courseId
  }
  const course = classRecord.course
  if (typeof course === 'string') {
    return course
  }
  return course?.courseCode ?? course?.id ?? ''
}

export const parseSchedule = (schedule = '') => {
  if (!schedule || !schedule.trim()) {
    return { days: '', startTime: '', endTime: '' }
  }
  const parts = schedule.trim().split(/\s+/)
  const lastPart = parts[parts.length - 1]
  const timeMatch = lastPart.match(/^(\d{1,2}:\d{2})[-–](\d{1,2}:\d{2})$/)
  if (!timeMatch) {
    return { days: parts.join(' '), startTime: '', endTime: '' }
  }
  return {
    days: parts.slice(0, -1).join(' '),
    startTime: timeMatch[1],
    endTime: timeMatch[2],
  }
}

export const buildSchedule = (days, startTime, endTime) => {
  const timeRange = startTime && endTime ? `${startTime}${TIME_RANGE_SEPARATOR}${endTime}` : ''
  return [days.trim(), timeRange].filter(Boolean).join(' ')
}

export const toClassFormValues = (classRecord = EMPTY_FORM_VALUES) => {
  const schedule = parseSchedule(classRecord.schedule)
  return {
    classCode: classRecord.classCode ?? '',
    name: classRecord.name ?? classRecord.className ?? '',
    course: resolveCourseValue(classRecord),
    academicYear: classRecord.academicYear ?? '',
    semester: classRecord.semester ?? '',
    room: classRecord.room ?? '',
    capacity: classRecord.capacity != null ? String(classRecord.capacity) : '',
    startTime: schedule.startTime || classRecord.startTime || '',
    endTime: schedule.endTime || classRecord.endTime || '',
    days: schedule.days || classRecord.days || '',
    status: classRecord.status ?? '',
  }
}

export const extractClassPayload = (values) => ({
  classCode: values.classCode.trim(),
  name: values.name.trim(),
  course: values.course,
  academicYear: values.academicYear.trim(),
  semester: values.semester.trim(),
  room: values.room.trim(),
  capacity: Number(values.capacity),
  schedule: buildSchedule(values.days, values.startTime, values.endTime),
  status: values.status,
})
