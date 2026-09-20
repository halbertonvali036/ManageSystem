import { useCallback, useEffect, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'

function useSemesters(academicYearId) {
  const [semesters, setSemesters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    academicYearsService
      .getSemesters(academicYearId)
      .then((data) => {
        if (isActive) {
          setError(null)
          setSemesters(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setSemesters([])
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
  }, [academicYearId])

  const refetch = useCallback(() => {
    if (!academicYearId) {
      setSemesters([])
      setError(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    academicYearsService
      .getSemesters(academicYearId)
      .then((data) => setSemesters(data))
      .catch((requestError) => {
        setError(requestError)
        setSemesters([])
      })
      .finally(() => setIsLoading(false))
  }, [academicYearId])

  return { semesters, isLoading, error, refetch }
}

export default useSemesters