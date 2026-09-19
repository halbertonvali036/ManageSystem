import { useCallback, useEffect, useState } from 'react'
import studentsService from '@/services/studentsService'

function useStudent(id) {
  const [student, setStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    studentsService
      .getStudent(id)
      .then((data) => {
        if (isActive) {
          setStudent(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setStudent(null)
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
  }, [id])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentsService
      .getStudent(id)
      .then((data) => setStudent(data))
      .catch((requestError) => {
        setError(requestError)
        setStudent(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { student, isLoading, error, refetch }
}

export default useStudent