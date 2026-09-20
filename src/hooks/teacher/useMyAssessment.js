import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyAssessment(id) {
  const [assessment, setAssessment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teacherService
      .getMyAssessment(id)
      .then((data) => {
        if (isActive) {
          setError(null)
          setAssessment(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAssessment(null)
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
    teacherService
      .getMyAssessment(id)
      .then((data) => setAssessment(data))
      .catch((requestError) => {
        setError(requestError)
        setAssessment(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { assessment, isLoading, error, refetch }
}

export default useMyAssessment