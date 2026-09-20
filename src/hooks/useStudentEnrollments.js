import { useCallback, useEffect, useState } from 'react'
import enrollmentsService from '@/services/enrollmentsService'
import { normalizeEnrollments } from '@/models/enrollment'

function useStudentEnrollments(studentId) {
  const [enrollments, setEnrollments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    enrollmentsService
      .getStudentEnrollments(studentId)
      .then((data) => {
        if (isActive) {
          setError(null)
          setEnrollments(normalizeEnrollments(data))
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setEnrollments([])
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
    enrollmentsService
      .getStudentEnrollments(studentId)
      .then((data) => setEnrollments(normalizeEnrollments(data)))
      .catch((requestError) => {
        setError(requestError)
        setEnrollments([])
      })
      .finally(() => setIsLoading(false))
  }, [studentId])

  return { enrollments, isLoading, error, refetch }
}

export default useStudentEnrollments