import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyClass(id) {
  const [classRecord, setClassRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyClass(id)
      .then((data) => {
        if (isActive) {
          setError(null)
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
    studentService
      .getMyClass(id)
      .then((data) => setClassRecord(data))
      .catch((requestError) => {
        setError(requestError)
        setClassRecord(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { classRecord, isLoading, error, refetch }
}

export default useMyClass