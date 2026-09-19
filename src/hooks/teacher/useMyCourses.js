import { useMemo } from 'react'
import useMyClasses from '@/hooks/teacher/useMyClasses'

const resolveCourse = (classRecord) => {
  if (!classRecord) {
    return null
  }
  const raw = classRecord.course
  if (typeof raw === 'string') {
    return { id: raw, name: raw }
  }
  if (raw && typeof raw === 'object') {
    const id = raw.id ?? raw.courseId ?? raw.courseCode ?? ''
    const name = raw.name ?? raw.courseName ?? raw.courseCode ?? id
    return id ? { id, name } : null
  }
  const id = classRecord.courseId ?? classRecord.courseCode ?? ''
  const name = classRecord.courseName ?? ''
  return id ? { id, name } : null
}

function useMyCourses() {
  const { classes, isLoading, error } = useMyClasses()

  const courses = useMemo(() => {
    const seen = new Map()
    for (const classRecord of classes) {
      const course = resolveCourse(classRecord)
      if (course && !seen.has(course.id)) {
        seen.set(course.id, course)
      }
    }
    return [...seen.values()]
  }, [classes])

  return { courses, isLoading, error }
}

export default useMyCourses