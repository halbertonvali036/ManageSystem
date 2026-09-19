import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyClasses(filters = {}) {
  const { search, academicYear, status } = filters
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teacherService
      .getMyClasses({ search, academicYear, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setClasses(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setClasses([])
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
  }, [search, academicYear, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyClasses({ search, academicYear, status })
      .then((data) => setClasses(data))
      .catch((requestError) => {
        setError(requestError)
        setClasses([])
      })
      .finally(() => setIsLoading(false))
  }, [search, academicYear, status])

  return { classes, isLoading, error, refetch }
}

export default useMyClasses