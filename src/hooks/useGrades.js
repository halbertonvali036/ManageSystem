import { useCallback, useEffect, useState } from 'react'
import gradesService from '@/services/gradesService'

function useGrades(filters = {}) {
  const { search, studentId, classId, courseId, assessmentType } = filters
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    gradesService
      .getGrades({ search, studentId, classId, courseId, assessmentType })
      .then((data) => {
        if (!isActive) {
          return
        }
        setError(null)
        setGrades(data)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }
        setError(requestError)
        setGrades([])
      })
      .finally(() => {
        if (!isActive) {
          return
        }
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [search, studentId, classId, courseId, assessmentType])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    gradesService
      .getGrades({ search, studentId, classId, courseId, assessmentType })
      .then((data) => {
        setGrades(data)
      })
      .catch((requestError) => {
        setError(requestError)
        setGrades([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [search, studentId, classId, courseId, assessmentType])

  return { grades, isLoading, error, refetch }
}

export default useGrades