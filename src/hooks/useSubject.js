import { useCallback, useEffect, useState } from 'react'
import subjectsService from '@/services/subjectsService'

function useSubject(id) {
  const [subject, setSubject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    subjectsService
      .getSubject(id)
      .then((data) => {
        if (isActive) {
          setSubject(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setSubject(null)
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
    subjectsService
      .getSubject(id)
      .then((data) => setSubject(data))
      .catch((requestError) => {
        setError(requestError)
        setSubject(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { subject, isLoading, error, refetch }
}

export default useSubject