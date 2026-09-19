import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyGrades(filters = {}) {
  const { search, courseId, classId, assessmentType, dateFrom, dateTo } = filters
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyGrades({
        search,
        courseId,
        classId,
        assessmentType,
        dateFrom,
        dateTo,
      })
      .then((data) => {
        if (isActive) {
          setError(null)
          setGrades(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setGrades([])
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
  }, [search, courseId, classId, assessmentType, dateFrom, dateTo])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyGrades({
        search,
        courseId,
        classId,
        assessmentType,
        dateFrom,
        dateTo,
      })
      .then((data) => setGrades(data))
      .catch((requestError) => {
        setError(requestError)
        setGrades([])
      })
      .finally(() => setIsLoading(false))
  }, [search, courseId, classId, assessmentType, dateFrom, dateTo])

  return { grades, isLoading, error, refetch }
}

export default useMyGrades