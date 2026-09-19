import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyGrades(filters = {}) {
  const { search, studentId, classId, courseId, assessmentType } = filters
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teacherService
      .getMyGrades({ search, studentId, classId, courseId, assessmentType })
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
  }, [search, studentId, classId, courseId, assessmentType])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyGrades({ search, studentId, classId, courseId, assessmentType })
      .then((data) => setGrades(data))
      .catch((requestError) => {
        setError(requestError)
        setGrades([])
      })
      .finally(() => setIsLoading(false))
  }, [search, studentId, classId, courseId, assessmentType])

  return { grades, isLoading, error, refetch }
}

export default useMyGrades