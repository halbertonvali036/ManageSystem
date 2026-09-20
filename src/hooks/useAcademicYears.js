import { useCallback, useEffect, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'

function useAcademicYears({ search, status } = {}) {
  const [academicYears, setAcademicYears] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    academicYearsService
      .getAcademicYears({ search, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setAcademicYears(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAcademicYears([])
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
  }, [search, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    academicYearsService
      .getAcademicYears({ search, status })
      .then((data) => setAcademicYears(data))
      .catch((requestError) => {
        setError(requestError)
        setAcademicYears([])
      })
      .finally(() => setIsLoading(false))
  }, [search, status])

  return { academicYears, isLoading, error, refetch }
}

export default useAcademicYears