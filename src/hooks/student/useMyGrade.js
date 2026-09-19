import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyGrade(id) {
  const [grade, setGrade] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyGrade(id)
      .then((data) => {
        if (isActive) {
          setError(null)
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
    studentService
      .getMyGrade(id)
      .then((data) => setGrade(data))
      .catch((requestError) => {
        setError(requestError)
        setGrade(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { grade, isLoading, error, refetch }
}

export default useMyGrade