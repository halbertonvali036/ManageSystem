import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyCourse(id) {
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyCourse(id)
      .then((data) => {
        if (isActive) {
          setError(null)
          setCourse(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setCourse(null)
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
      .getMyCourse(id)
      .then((data) => setCourse(data))
      .catch((requestError) => {
        setError(requestError)
        setCourse(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { course, isLoading, error, refetch }
}

export default useMyCourse