import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyStudents(filters = {}) {
  const { search, classId, status } = filters
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teacherService
      .getMyStudents({ search, classId, status })
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
  }, [search, classId, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyStudents({ search, classId, status })
      .then((data) => setStudents(data))
      .catch((requestError) => {
        setError(requestError)
        setStudents([])
      })
      .finally(() => setIsLoading(false))
  }, [search, classId, status])

  return { students, isLoading, error, refetch }
}

export default useMyStudents