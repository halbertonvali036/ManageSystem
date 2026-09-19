import { useCallback, useEffect, useState } from 'react'
import classesService from '@/services/classesService'

function useClasses(filters = {}) {
  const { search, academicYear, status } = filters
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    classesService
      .getClasses({ search, academicYear, status })
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
    classesService
      .getClasses({ search, academicYear, status })
      .then((data) => setClasses(data))
      .catch((requestError) => {
        setError(requestError)
        setClasses([])
      })
      .finally(() => setIsLoading(false))
  }, [search, academicYear, status])

  return { classes, isLoading, error, refetch }
}

export default useClasses