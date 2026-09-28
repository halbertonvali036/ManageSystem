export const ANNOUNCEMENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
})

export const ANNOUNCEMENT_STATUS_LABELS = Object.freeze({
  [ANNOUNCEMENT_STATUS.DRAFT]: 'Draft',
  [ANNOUNCEMENT_STATUS.PUBLISHED]: 'Published',
  [ANNOUNCEMENT_STATUS.ARCHIVED]: 'Archived',
})

export const ANNOUNCEMENT_AUDIENCE = Object.freeze({
  ALL: 'all',
  CLASS: 'class',
  COURSE: 'course',
})

const AUDIENCE_LABELS = {
  [ANNOUNCEMENT_AUDIENCE.ALL]: 'All',
  [ANNOUNCEMENT_AUDIENCE.CLASS]: 'Specific Class',
  [ANNOUNCEMENT_AUDIENCE.COURSE]: 'Specific Course',
}

export const ANNOUNCEMENT_AUDIENCE_LABELS = Object.freeze(AUDIENCE_LABELS)

export const ANNOUNCEMENT_AUDIENCE_OPTIONS = Object.freeze(
  Object.keys(AUDIENCE_LABELS).map((value) => ({
    value,
    label: AUDIENCE_LABELS[value],
  })),
)

const resolveClassRef = (item) => {
  if (!item) {
    return ''
  }
  const classRef = item.class
  if (typeof classRef === 'string') {
    return classRef
  }
  return classRef?.name || classRef?.className || classRef?.classCode || item.className || ''
}

const resolveCourseRef = (item) => {
  if (!item) {
    return ''
  }
  const courseRef = item.course
  if (typeof courseRef === 'string') {
    return courseRef
  }
  return (
    courseRef?.name ||
    courseRef?.courseName ||
    courseRef?.courseCode ||
    item.courseName ||
    ''
  )
}

export const formatAnnouncementTitle = (item) => {
  if (!item) {
    return '—'
  }
  return item.title || item.announcementTitle || 'Untitled announcement'
}

export const formatAnnouncementMessage = (item) => item?.message || ''

export const formatAnnouncementAudienceLabel = (value) => {
  if (!value) {
    return '—'
  }
  return AUDIENCE_LABELS[value] || value || '—'
}

export const formatAnnouncementDate = (value) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

export const formatAnnouncementClassContext = (item) => {
  if (!item) {
    return '—'
  }
  return resolveClassRef(item) || item.classId || '—'
}

export const formatAnnouncementCourseContext = (item) => {
  if (!item) {
    return '—'
  }
  return resolveCourseRef(item) || item.courseId || '—'
}

export const formatAnnouncementAcademicYearName = (item) => {
  if (!item) {
    return '—'
  }
  if (typeof item.academicYear === 'string') {
    return item.academicYear
  }
  return (
    item.academicYear?.name ||
    item.academicYear?.academicYear ||
    item.academicYearId ||
    '—'
  )
}

export const formatAnnouncementSemesterName = (item) => {
  if (!item) {
    return '—'
  }
  if (typeof item.semester === 'string') {
    return item.semester
  }
  return item.semester?.name || item.semesterId || '—'
}

export const formatAnnouncementContextLabel = (item) => {
  if (!item || !item.audience) {
    return ''
  }
  if (String(item.audience) === ANNOUNCEMENT_AUDIENCE.CLASS) {
    return formatAnnouncementClassContext(item)
  }
  if (String(item.audience) === ANNOUNCEMENT_AUDIENCE.COURSE) {
    return formatAnnouncementCourseContext(item)
  }
  return ''
}

export const resolveAnnouncementClassId = (item) =>
  item?.classId ?? item?.class?.id ?? ''

export const resolveAnnouncementCourseId = (item) =>
  item?.courseId ?? item?.course?.id ?? ''

export const resolveAnnouncementAcademicYearId = (item) =>
  item?.academicYearId ?? item?.academicYear?.id ?? ''

export const resolveAnnouncementSemesterId = (item) =>
  item?.semesterId ?? item?.semester?.id ?? ''

/**
 * @typedef {Object} Announcement
 * @property {string} id - Internal database identifier.
 * @property {string} title - Announcement title.
 * @property {string} message - Announcement body text.
 * @property {keyof typeof ANNOUNCEMENT_AUDIENCE | string} audience
 * @property {string} [classId] - Required when audience is class.
 * @property {string} [courseId] - Required when audience is course.
 * @property {string} [academicYearId] - Optional academic context.
 * @property {string} [semesterId] - Optional academic context.
 * @property {string} publishDate - ISO date (YYYY-MM-DD).
 * @property {string} [expiryDate] - ISO date (YYYY-MM-DD), must be after publishDate.
 * @property {keyof typeof ANNOUNCEMENT_STATUS | string} status
 * @property {string} [createdBy] - Backend field, resolves against the authenticated user.
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */