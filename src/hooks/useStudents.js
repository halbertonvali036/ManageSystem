import { useCallback, useEffect, useState } from 'react'
import studentsService from '@/services/studentsService'

function useStudents(filters = {}, options = {}) {
  const { search, classId, status } = filters
  const enabled = options.enabled !== false
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }
    let isActive = true

    studentsService
      .getStudents({ search, classId, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setStudents(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setStudents([])
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
  }, [search, classId, status, enabled])

  const refetch = useCallback(() => {
    if (!enabled) {
      return
    }
    setIsLoading(true)
    setError(null)
    studentsService
      .getStudents({ search, classId, status })
      .then((data) => setStudents(data))
      .catch((requestError) => {
        setError(requestError)
        setStudents([])
      })
      .finally(() => setIsLoading(false))
  }, [search, classId, status, enabled])

  return { students, isLoading, error, refetch }
}

export default useStudents