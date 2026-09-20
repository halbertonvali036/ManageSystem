import { useCallback, useEffect, useState } from 'react'
import enrollmentsService from '@/services/enrollmentsService'
import { normalizeRoster } from '@/models/enrollment'

function useClassStudents(classId) {
  const [roster, setRoster] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    enrollmentsService
      .getClassStudents(classId)
      .then((data) => {
        if (isActive) {
          setError(null)
          setRoster(normalizeRoster(data))
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setRoster([])
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
  }, [classId])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    enrollmentsService
      .getClassStudents(classId)
      .then((data) => setRoster(normalizeRoster(data)))
      .catch((requestError) => {
        setError(requestError)
        setRoster([])
      })
      .finally(() => setIsLoading(false))
  }, [classId])

  return { roster, isLoading, error, refetch }
}

export default useClassStudents