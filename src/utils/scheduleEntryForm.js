export const EMPTY_SCHEDULE_ENTRY_FORM_VALUES = {
  academicYearId: '',
  semesterId: '',
  classId: '',
  courseId: '',
  teacherId: '',
  dayOfWeek: '',
  startTime: '',
  endTime: '',
  room: '',
  status: '',
}

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number)
  if (hours == null || minutes == null || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  return hours * 60 + minutes
}

const resolveId = (value, key) => {
  if (!value) {
    return ''
  }
  return value[key] ?? value.id ?? ''
}

export const toScheduleEntryFormValues = (entry = EMPTY_SCHEDULE_ENTRY_FORM_VALUES) => ({
  academicYearId:
    entry.academicYearId ??
    resolveId(entry.academicYear, 'academicYearId') ??
    (typeof entry.academicYear === 'string' ? entry.academicYear : '') ??
    '',
  semesterId:
    entry.semesterId ??
    resolveId(entry.semester, 'semesterId') ??
    (typeof entry.semester === 'string' ? entry.semester : '') ??
    '',
  classId:
    entry.classId ?? resolveId(entry.class, 'classId') ?? (typeof entry.class === 'string' ? entry.class : '') ?? '',
  courseId:
    entry.courseId ??
    resolveId(entry.course, 'courseId') ??
    (typeof entry.course === 'string' ? entry.course : '') ??
    '',
  teacherId:
    entry.teacherId ??
    resolveId(entry.teacher, 'teacherId') ??
    (typeof entry.teacher === 'string' ? entry.teacher : '') ??
    '',
  dayOfWeek: entry.dayOfWeek ?? '',
  startTime: entry.startTime ?? '',
  endTime: entry.endTime ?? '',
  room: entry.room ?? '',
  status: entry.status ?? '',
})

const optionHasValue = (options, value) =>
  options.some((option) => String(option.value) === String(value))

export const validateScheduleEntry = (
  values,
  {
    classOptions = [],
    courseOptions = [],
    teacherOptions = [],
    yearOptions = [],
    semesterOptions = [],
  } = {},
) => {
  const errors = {}

  const classesAvailable = classOptions.length > 0
  const coursesAvailable = courseOptions.length > 0
  const teachersAvailable = teacherOptions.length > 0
  const yearsAvailable = yearOptions.length > 0
  const semestersAvailable = semesterOptions.length > 0

  if (
    values.academicYearId &&
    yearsAvailable &&
    !optionHasValue(yearOptions, values.academicYearId)
  ) {
    errors.academicYearId = 'Select a valid academic year.'
  } else if (yearsAvailable && !values.academicYearId) {
    errors.academicYearId = 'Academic year is required.'
  }

  if (
    values.semesterId &&
    semestersAvailable &&
    !optionHasValue(semesterOptions, values.semesterId)
  ) {
    errors.semesterId = 'Select a valid semester.'
  } else if (
    values.academicYearId &&
    !values.semesterId &&
    semestersAvailable
  ) {
    errors.semesterId = 'Semester is required.'
  }

  if (
    values.classId &&
    classesAvailable &&
    !optionHasValue(classOptions, values.classId)
  ) {
    errors.classId = 'Select a valid class.'
  } else if (!values.classId && classesAvailable) {
    errors.classId = 'Class is required.'
  }

  if (
    values.courseId &&
    coursesAvailable &&
    !optionHasValue(courseOptions, values.courseId)
  ) {
    errors.courseId = 'Select a valid course.'
  } else if (!values.courseId && coursesAvailable) {
    errors.courseId = 'Course is required.'
  }

  if (
    values.teacherId &&
    teachersAvailable &&
    !optionHasValue(teacherOptions, values.teacherId)
  ) {
    errors.teacherId = 'Select a valid teacher.'
  } else if (!values.teacherId && teachersAvailable) {
    errors.teacherId = 'Teacher is required.'
  }

  if (!values.dayOfWeek) {
    errors.dayOfWeek = 'Day of week is required.'
  }

  if (!values.startTime) {
    errors.startTime = 'Start time is required.'
  }

  if (!values.endTime) {
    errors.endTime = 'End time is required.'
  } else {
    const startMinutes = toMinutes(values.startTime)
    const endMinutes = toMinutes(values.endTime)
    if (startMinutes != null && endMinutes != null && endMinutes <= startMinutes) {
      errors.endTime = 'End time must be after start time.'
    }
  }

  if (!values.status) {
    errors.status = 'Status is required.'
  }

  return errors
}

export const extractScheduleEntryPayload = (values) => ({
  academicYearId: values.academicYearId,
  semesterId: values.semesterId,
  classId: values.classId,
  courseId: values.courseId,
  teacherId: values.teacherId,
  dayOfWeek: values.dayOfWeek,
  startTime: values.startTime,
  endTime: values.endTime,
  room: values.room.trim(),
  status: values.status,
})