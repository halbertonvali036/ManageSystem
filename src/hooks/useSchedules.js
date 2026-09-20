import { useCallback, useEffect, useState } from 'react'
import schedulesService from '@/services/schedulesService'

function useSchedules(filters = {}) {
  const {
    search,
    academicYearId,
    semesterId,
    classId,
    courseId,
    teacherId,
    dayOfWeek,
    status,
  } = filters
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    schedulesService
      .getSchedules({
        search,
        academicYearId,
        semesterId,
        classId,
        courseId,
        teacherId,
        dayOfWeek,
        status,
      })
      .then((data) => {
        if (isActive) {
          setError(null)
          setSchedules(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setSchedules([])
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [
    search,
    academicYearId,
    semesterId,
    classId,
    courseId,
    teacherId,
    dayOfWeek,
    status,
  ])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    schedulesService
      .getSchedules({
        search,
        academicYearId,
        semesterId,
        classId,
        courseId,
        teacherId,
        dayOfWeek,
        status,
      })
      .then((data) => setSchedules(data))
      .catch((requestError) => {
        setError(requestError)
        setSchedules([])
      })
      .finally(() => setIsLoading(false))
  }, [
    search,
    academicYearId,
    semesterId,
    classId,
    courseId,
    teacherId,
    dayOfWeek,
    status,
  ])

  return { schedules, isLoading, error, refetch }
}

export default useSchedules