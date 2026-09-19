import { useCallback, useEffect, useState } from 'react'
import teachersService from '@/services/teachersService'

function useTeachers(filters = {}) {
  const { search, department, status } = filters
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teachersService
      .getTeachers({ search, department, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setTeachers(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setTeachers([])
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
  }, [search, department, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teachersService
      .getTeachers({ search, department, status })
      .then((data) => setTeachers(data))
      .catch((requestError) => {
        setError(requestError)
        setTeachers([])
      })
      .finally(() => setIsLoading(false))
  }, [search, department, status])

  return { teachers, isLoading, error, refetch }
}

export default useTeachers