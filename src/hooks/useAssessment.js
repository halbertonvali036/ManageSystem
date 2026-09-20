import { useCallback, useEffect, useState } from 'react'
import assessmentsService from '@/services/assessmentsService'

function useAssessment(id) {
  const [assessment, setAssessment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    assessmentsService
      .getAssessment(id)
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
    assessmentsService
      .getAssessment(id)
      .then((data) => setAssessment(data))
      .catch((requestError) => {
        setError(requestError)
        setAssessment(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { assessment, isLoading, error, refetch }
}

export default useAssessment