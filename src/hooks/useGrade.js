import { useCallback, useEffect, useState } from 'react'
import gradesService from '@/services/gradesService'

function useGrade(id) {
  const [grade, setGrade] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    gradesService
      .getGrade(id)
      .then((data) => {
        if (isActive) {
          setGrade(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setGrade(null)
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
    gradesService
      .getGrade(id)
      .then((data) => setGrade(data))
      .catch((requestError) => {
        setError(requestError)
        setGrade(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { grade, isLoading, error, refetch }
}

export default useGrade