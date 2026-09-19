import { useCallback, useEffect, useState } from 'react'
import classesService from '@/services/classesService'

function useClass(id) {
  const [classRecord, setClassRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    classesService
      .getClass(id)
      .then((data) => {
        if (isActive) {
          setClassRecord(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setClassRecord(null)
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
    classesService
      .getClass(id)
      .then((data) => setClassRecord(data))
      .catch((requestError) => {
        setError(requestError)
        setClassRecord(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { classRecord, isLoading, error, refetch }
}

export default useClass