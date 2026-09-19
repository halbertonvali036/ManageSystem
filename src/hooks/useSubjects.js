import { useCallback, useEffect, useState } from 'react'
import subjectsService from '@/services/subjectsService'

function useSubjects({ search, departmentId, status } = {}) {
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    subjectsService
      .getSubjects({ search, departmentId, status })
      .then((data) => {
        if (isActive) {
          setSubjects(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setSubjects([])
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
  }, [search, departmentId, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    subjectsService
      .getSubjects({ search, departmentId, status })
      .then((data) => setSubjects(data))
      .catch((requestError) => {
        setError(requestError)
        setSubjects([])
      })
      .finally(() => setIsLoading(false))
  }, [search, departmentId, status])

  return { subjects, isLoading, error, refetch }
}

export default useSubjects