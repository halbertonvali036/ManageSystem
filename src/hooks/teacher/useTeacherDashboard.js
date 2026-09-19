import { useCallback } from 'react'
import useMyAttendance from '@/hooks/teacher/useMyAttendance'
import useMyClasses from '@/hooks/teacher/useMyClasses'
import useMyGrades from '@/hooks/teacher/useMyGrades'
import useMyStudents from '@/hooks/teacher/useMyStudents'
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
    records,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useMyAttendance()
  const {
    grades,
    isLoading: gradesLoading,
    error: gradesError,
    refetch: refetchGrades,
  } = useMyGrades()

  const isLoading =
    classesLoading || studentsLoading || attendanceLoading || gradesLoading

  const error =
    classesError || studentsError || attendanceError || gradesError || null

  const summary = {
    classCount: classes.length,
    studentCount: students.length,
    attendanceCount: records.length,
    gradesEntered: grades.length,
    myClasses: classes.slice(0, 4),
    todaySchedule: classes.filter(matchesToday).slice(0, 5),
    students: students.slice(0, 5),
    attendanceRecords: records.slice(0, 5),
    recentGrades: grades.slice(0, 6),
  }

  const refetch = useCallback(() => {
    refetchClasses()
    refetchStudents()
    refetchAttendance()
    refetchGrades()
  }, [refetchAttendance, refetchClasses, refetchGrades, refetchStudents])

  return { summary, isLoading, error, refetch }
}

export default useTeacherDashboard