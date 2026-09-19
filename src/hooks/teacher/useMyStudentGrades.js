import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyStudentGrades(studentId) {
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    teacherService
      .getMyStudentGrades(studentId)
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
  }, [studentId])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyStudentGrades(studentId)
      .then((data) => setGrades(data))
      .catch((requestError) => {
        setError(requestError)
        setGrades([])
      })
      .finally(() => setIsLoading(false))
  }, [studentId])

  return { grades, isLoading, error, refetch }
}

export default useMyStudentGrades