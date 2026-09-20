import { useCallback, useEffect, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'

function useAcademicYear(id) {
  const [academicYear, setAcademicYear] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    academicYearsService
      .getAcademicYear(id)
      .then((data) => {
        if (isActive) {
          setAcademicYear(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAcademicYear(null)
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
    academicYearsService
      .getAcademicYear(id)
      .then((data) => setAcademicYear(data))
      .catch((requestError) => {
        setError(requestError)
        setAcademicYear(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { academicYear, isLoading, error, refetch }
}

export default useAcademicYear