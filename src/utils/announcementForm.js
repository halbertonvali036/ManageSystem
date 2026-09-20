import { ANNOUNCEMENT_AUDIENCE } from '@/models/announcement'

export const EMPTY_ANNOUNCEMENT_FORM_VALUES = {
  title: '',
  message: '',
  audience: '',
  classId: '',
  courseId: '',
  academicYearId: '',
  semesterId: '',
  publishDate: '',
  expiryDate: '',
  status: '',
}

const toDateInputValue = (value) => {
  if (!value) {
    return ''
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return ''
    }
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const stringValue = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue
  }
  const date = new Date(stringValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return toDateInputValue(date)
}

const resolveRef = (entry, field, refKey) => {
  if (!entry) {
    return ''
  }
  const direct = entry[`${field}Id`]
  if (direct) {
    return direct
  }
  const ref = entry[field]
  if (ref == null) {
    return ''
  }
  if (typeof ref === 'string') {
    return ref
  }
  return ref[refKey] || ref.id || ''
}

export const toAnnouncementFormValues = (
  announcement = EMPTY_ANNOUNCEMENT_FORM_VALUES,
) => ({
  title: announcement.title ?? announcement.announcementTitle ?? '',
  message: announcement.message ?? '',
  audience: announcement.audience ?? '',
  classId: resolveRef(announcement, 'class', 'classId'),
  courseId: resolveRef(announcement, 'course', 'courseId'),
  academicYearId: resolveRef(announcement, 'academicYear', 'academicYearId'),
  semesterId: resolveRef(announcement, 'semester', 'semesterId'),
  publishDate: toDateInputValue(announcement.publishDate),
  expiryDate: toDateInputValue(announcement.expiryDate),
  status: announcement.status ?? '',
})

const optionHasValue = (options, value) =>
  options.length > 0 &&
  options.some((option) => String(option.value) === String(value))

export const validateAnnouncement = (
  values,
  {
    classOptions = [],
    courseOptions = [],
    yearOptions = [],
    semesterOptions = [],
  } = {},
) => {
  const errors = {}
  const audience = String(values.audience || '')

  if (!values.title.trim()) {
    errors.title = 'Title is required.'
  }

  if (!values.message.trim()) {
    errors.message = 'Message is required.'
  }

  if (!audience) {
    errors.audience = 'Audience is required.'
  } else if (audience === ANNOUNCEMENT_AUDIENCE.CLASS) {
    if (!String(values.classId)) {
      errors.classId = 'Select a class for this audience.'
    } else if (!optionHasValue(classOptions, values.classId)) {
      errors.classId = 'Select a valid class.'
    }
  } else if (audience === ANNOUNCEMENT_AUDIENCE.COURSE) {
    if (!String(values.courseId)) {
      errors.courseId = 'Select a course for this audience.'
    } else if (!optionHasValue(courseOptions, values.courseId)) {
      errors.courseId = 'Select a valid course.'
    }
  }

  if (
    String(values.academicYearId) &&
    !optionHasValue(yearOptions, values.academicYearId)
  ) {
    errors.academicYearId = 'Select a valid academic year.'
  }

  if (
    String(values.semesterId) &&
    !optionHasValue(semesterOptions, values.semesterId)
  ) {
    errors.semesterId = 'Select a valid semester.'
  }

  if (!String(values.publishDate)) {
    errors.publishDate = 'Publish date is required.'
  }

  if (
    String(values.expiryDate) &&
    String(values.publishDate) &&
    values.expiryDate <= values.publishDate
  ) {
    errors.expiryDate = 'Expiry date must be after the publish date.'
  }

  if (!String(values.status)) {
    errors.status = 'Status is required.'
  }

  return errors
}

export const extractAnnouncementPayload = (values) => {
  const isClassAudience = String(values.audience) === ANNOUNCEMENT_AUDIENCE.CLASS
  const isCourseAudience =
    String(values.audience) === ANNOUNCEMENT_AUDIENCE.COURSE
  return {
    title: values.title.trim(),
    message: values.message.trim(),
    audience: values.audience,
    classId: isClassAudience ? values.classId : '',
    courseId: isCourseAudience ? values.courseId : '',
    academicYearId: values.academicYearId,
    semesterId: values.semesterId,
    publishDate: String(values.publishDate),
    expiryDate: String(values.expiryDate),
    status: values.status,
  }
}