import { useCallback } from 'react'
import config from '@/config'
import useMyAssessments from '@/hooks/teacher/useMyAssessments'
import useMyClasses from '@/hooks/teacher/useMyClasses'
import useMyGrades from '@/hooks/teacher/useMyGrades'
import useMySchedule from '@/hooks/teacher/useMySchedule'
import useMyStudents from '@/hooks/teacher/useMyStudents'
import useTeacherAnnouncements from '@/hooks/teacher/useTeacherAnnouncements'
import { formatClassName, formatClassCourseName } from '@/models/class'
import { getScheduleDayKeys, WEEKDAY_KEYS } from '@/models/schedule'
import { parseSchedule } from '@/utils/classForm'

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const matchesToday = (classRecord) => {
  const days = parseSchedule(classRecord?.schedule || '').days || ''
  if (!days) {
    return false
  }
  const today = WEEKDAYS[new Date().getDay()]
  return days.includes(today) || days.includes(today.slice(0, 3))
}

const toScheduleItem = (classRecord) => {
  const schedule = parseSchedule(classRecord?.schedule || '')
  return {
    id: classRecord.id,
    className: formatClassName(classRecord),
    courseName: formatClassCourseName(classRecord),
    startTime: schedule.startTime || '',
    endTime: schedule.endTime || '',
    room: classRecord.room || '',
    class: classRecord,
    course: classRecord.course,
    status: classRecord.status,
  }
}

const isActiveAssessment = (assessment) => {
  const status = assessment?.status
  if (!status) {
    return null
  }
  const normalized = String(status).toLowerCase()
  if (
    normalized === 'draft' ||
    normalized === 'closed' ||
    normalized === 'archived'
  ) {
    return false
  }
  return true
}

const isVisibleAssessment = (assessment) => {
  const status = assessment?.status
  if (!status) {
    return true
  }
  return String(status).toLowerCase() !== 'draft'
}

const toDateValue = (assessment) => {
  const value =
    assessment?.date ?? assessment?.dueDate ?? assessment?.assessmentDate
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function useTeacherDashboard() {
  const {
    classes,
    isLoading: classesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useMyClasses()
  const {
    students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useMyStudents()
  const {
    grades,
    isLoading: gradesLoading,
    error: gradesError,
    refetch: refetchGrades,
  } = useMyGrades()
  const {
    assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments,
  } = useMyAssessments()
  const {
    items: scheduleItems,
    isLoading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useMySchedule()
  const {
    announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useTeacherAnnouncements()

  const backendAvailable = Boolean(config.api.baseUrl)

  const isLoading =
    classesLoading ||
    studentsLoading ||
    gradesLoading ||
    assessmentsLoading ||
    scheduleLoading ||
    announcementsLoading

  const todayKey = WEEKDAY_KEYS[(new Date().getDay() + 6) % 7]
  const todayIndex = WEEKDAY_KEYS.indexOf(todayKey)

  const scheduleToday = (scheduleItems || []).filter((item) =>
    getScheduleDayKeys(item).includes(todayKey),
  )

  const classesToday = (classes || []).filter(matchesToday).map(toScheduleItem)

  const mergedSchedule = [...scheduleToday]
  const seen = new Set(mergedSchedule.map((item) => item?.id ?? item?.scheduleId))
  classesToday.forEach((item) => {
    if (!seen.has(item.id)) {
      mergedSchedule.push(item)
      seen.add(item.id)
    }
  })
  const todaySchedule = mergedSchedule.slice(0, 6)

  const upcomingSchedule = (scheduleItems || [])
    .filter((item) =>
      getScheduleDayKeys(item).some(
        (key) => WEEKDAY_KEYS.indexOf(key) > todayIndex,
      ),
    )
    .slice(0, 6)

  const visibleAssessments = (assessments || []).filter(isVisibleAssessment)

  const sortedAssessments = [...visibleAssessments].sort((a, b) => {
    const aTime = toDateValue(a)
    const bTime = toDateValue(b)
    if (aTime === null && bTime === null) {
      return 0
    }
    if (aTime === null) {
      return 1
    }
    if (bTime === null) {
      return -1
    }
    const todayMs = startOfToday()
    const aUpcoming = aTime >= todayMs ? 0 : 1
    const bUpcoming = bTime >= todayMs ? 0 : 1
    if (aUpcoming !== bUpcoming) {
      return aUpcoming - bUpcoming
    }
    return aUpcoming === 0 ? aTime - bTime : bTime - aTime
  })

  const recentAssessments = sortedAssessments.slice(0, 4)

  const hasAnyAssessmentStatus =
    visibleAssessments.length === 0 ||
    visibleAssessments.some((assessment) => assessment?.status)

  const activeAssessmentsCount =
    !assessmentsLoading && backendAvailable && hasAnyAssessmentStatus
      ? visibleAssessments.filter(isActiveAssessment).length
      : null

  const classCount =
    !classesLoading && backendAvailable && !classesError
      ? classes.length
      : null
  const studentCount =
    !studentsLoading && backendAvailable && !studentsError
      ? students.length
      : null
  const gradesCount =
    !gradesLoading && backendAvailable && !gradesError ? grades.length : null

  const todayLessonsKnown =
    !(scheduleLoading || classesLoading) &&
    backendAvailable &&
    !(scheduleError && classesError)
  const todayLessonsCount = todayLessonsKnown ? todaySchedule.length : null

  const extractContext = (source, key) => {
    if (!backendAvailable) {
      return null
    }
    const values = (source || [])
      .map((item) => {
        const value = item?.[key]
        if (typeof value === 'string' && value.trim()) {
          return value.trim()
        }
        if (value && typeof value === 'object') {
          return value.name || value.label || ''
        }
        return ''
      })
      .filter(Boolean)
    const unique = [...new Set(values)]
    return unique.length === 1 ? unique[0] : null
  }

  const currentAcademicYear = extractContext(classes, 'academicYear')
  const currentSemester = extractContext(classes, 'semester')

  const summary = {
    assignedClassesCount: classCount,
    assignedStudentsCount: studentCount,
    activeAssessmentsCount,
    todayLessonsCount,
    todaySchedule,
    upcomingSchedule,
    pendingAttendanceClasses: (classes || [])
      .filter(matchesToday)
      .slice(0, 4)
      .map(toScheduleItem),
    recentAssessments,
    recentGrades: grades.slice(0, 5),
    gradesCount,
    recentAnnouncements: announcements.slice(0, 4),
    myClasses: classes.slice(0, 4),
    currentAcademicYear,
    currentSemester,
    backendAvailable,
  }

  const errors = {
    classes: classesError,
    students: studentsError,
    grades: gradesError,
    assessments: assessmentsError,
    schedule: scheduleError,
    announcements: announcementsError,
  }

  const refetch = useCallback(() => {
    refetchClasses()
    refetchStudents()
    refetchGrades()
    refetchAssessments()
    refetchSchedule()
    refetchAnnouncements()
  }, [
    refetchAssessments,
    refetchAnnouncements,
    refetchClasses,
    refetchGrades,
    refetchSchedule,
    refetchStudents,
  ])

  return { summary, errors, isLoading, refetch }
}

export default useTeacherDashboard