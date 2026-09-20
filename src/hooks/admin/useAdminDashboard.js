import { useCallback, useEffect, useState } from 'react'
import config from '@/config'
import enrollmentsService from '@/services/enrollmentsService'
import useAcademicYears from '@/hooks/useAcademicYears'
import useAnnouncements from '@/hooks/useAnnouncements'
import useAssessments from '@/hooks/useAssessments'
import useAttendance from '@/hooks/useAttendance'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useSchedules from '@/hooks/useSchedules'
import useStudents from '@/hooks/useStudents'
import useTeachers from '@/hooks/useTeachers'
import { formatAcademicYearName } from '@/models/academicYear'
import { getScheduleDayKeys, WEEKDAY_KEYS } from '@/models/schedule'

const PUBLISHED_ANNOUNCEMENTS = { status: 'published' }
const ENROLLMENT_SLOT_COUNT = 4

const toLocalDateValue = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
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

const toPercent = (count, total) =>
  total > 0 ? Math.round((count / total) * 100) : null

function useAdminDashboard() {
  const {
    students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudents()
  const {
    teachers,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers,
  } = useTeachers()
  const {
    courses,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useCourses()
  const {
    classes,
    isLoading: classesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useClasses()
  const {
    schedules,
    isLoading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useSchedules()
  const {
    assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments,
  } = useAssessments()
  const {
    records: attendanceRecords,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useAttendance({ date: toLocalDateValue() })
  const {
    academicYears,
    isLoading: academicYearsLoading,
    error: academicYearsError,
    refetch: refetchAcademicYears,
  } = useAcademicYears()
  const {
    announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useAnnouncements(PUBLISHED_ANNOUNCEMENTS)

  const backendAvailable = Boolean(config.api.baseUrl)

  const [enrollmentCounts, setEnrollmentCounts] = useState({})

  useEffect(() => {
    if (!backendAvailable) {
      return undefined
    }
    const classIds = classes
      .slice(0, ENROLLMENT_SLOT_COUNT)
      .map((c) => c.id)
      .filter((id) => id != null)
    if (classIds.length === 0) {
      return undefined
    }
    let isActive = true

    Promise.allSettled(
      classIds.map((classId) =>
        enrollmentsService
          .getClassStudents(classId)
          .then((data) => ({ classId, count: Array.isArray(data) ? data.length : null })),
      ),
    ).then((results) => {
      if (!isActive) {
        return
      }
      const next = {}
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const { classId, count } = result.value
          if (classId != null) {
            next[classId] = count
          }
        } else if (result.status === 'rejected') {
          const classId = classIds[index]
          if (classId != null) {
            next[classId] = null
          }
        }
      })
      setEnrollmentCounts(next)
    })

    return () => {
      isActive = false
    }
  }, [backendAvailable, classes])

  const isLoading =
    studentsLoading ||
    teachersLoading ||
    coursesLoading ||
    classesLoading ||
    schedulesLoading ||
    assessmentsLoading ||
    attendanceLoading ||
    academicYearsLoading ||
    announcementsLoading

  const todayKey = WEEKDAY_KEYS[(new Date().getDay() + 6) % 7]
  const todayIndex = WEEKDAY_KEYS.indexOf(todayKey)

  const todaySchedule = (schedules || []).filter((item) =>
    getScheduleDayKeys(item).includes(todayKey),
  )

  const upcomingSchedule = (schedules || [])
    .filter((item) =>
      getScheduleDayKeys(item).some(
        (key) => WEEKDAY_KEYS.indexOf(key) > todayIndex,
      ),
    )
    .slice(0, 6)

  const attendanceTotal = attendanceRecords.length
  const presentCount = attendanceRecords.filter(
    (record) => String(record.status).toLowerCase() === 'present',
  ).length
  const lateCount = attendanceRecords.filter(
    (record) => String(record.status).toLowerCase() === 'late',
  ).length
  const absentCount = attendanceRecords.filter(
    (record) => String(record.status).toLowerCase() === 'absent',
  ).length
  const excusedCount = attendanceRecords.filter(
    (record) => String(record.status).toLowerCase() === 'excused',
  ).length

  const todayAttendance =
    attendanceTotal > 0
      ? {
          total: attendanceTotal,
          presentCount,
          lateCount,
          absentCount,
          excusedCount,
          presentRate: toPercent(presentCount, attendanceTotal),
          lateRate: toPercent(lateCount, attendanceTotal),
          absentRate: toPercent(absentCount, attendanceTotal),
        }
      : null

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

  const totalCount = (source, loading, hasError) =>
    !loading && backendAvailable && !hasError ? source.length : null

  const activeAcademicYear =
    academicYears.find(
      (year) => String(year.status).toLowerCase() === 'active',
    ) ?? null

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

  const currentAcademicYear = activeAcademicYear
    ? formatAcademicYearName(activeAcademicYear)
    : extractContext(classes, 'academicYear')
  const currentSemester = extractContext(classes, 'semester')

  const enrolledClasses = classes.slice(0, ENROLLMENT_SLOT_COUNT).map((c) => ({
    class: c,
    count:
      c.id != null && c.id in enrollmentCounts ? enrollmentCounts[c.id] : null,
  }))

  const summary = {
    totalStudents: totalCount(students, studentsLoading, studentsError),
    totalTeachers: totalCount(teachers, teachersLoading, teachersError),
    totalCourses: totalCount(courses, coursesLoading, coursesError),
    totalClasses: totalCount(classes, classesLoading, classesError),
    todaySchedule,
    upcomingSchedule,
    todayAttendance,
    activeAssessmentsCount,
    recentAssessments,
    recentAnnouncements: announcements.slice(0, 4),
    enrolledClasses,
    currentAcademicYear,
    currentSemester,
    backendAvailable,
  }

  const errors = {
    students: studentsError,
    teachers: teachersError,
    courses: coursesError,
    classes: classesError,
    schedules: schedulesError,
    assessments: assessmentsError,
    attendance: attendanceError,
    academicYears: academicYearsError,
    announcements: announcementsError,
  }

  const refetch = useCallback(() => {
    refetchStudents()
    refetchTeachers()
    refetchCourses()
    refetchClasses()
    refetchSchedules()
    refetchAssessments()
    refetchAttendance()
    refetchAcademicYears()
    refetchAnnouncements()
  }, [
    refetchAcademicYears,
    refetchAnnouncements,
    refetchAssessments,
    refetchAttendance,
    refetchClasses,
    refetchCourses,
    refetchSchedules,
    refetchStudents,
    refetchTeachers,
  ])

  return { summary, errors, isLoading, refetch }
}

export default useAdminDashboard