import { useCallback, useEffect, useState } from 'react'
import coursesService from '@/services/coursesService'

function useCourse(id) {
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    coursesService
      .getCourse(id)
      .then((data) => {
        if (isActive) {
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
    coursesService
      .getCourse(id)
      .then((data) => setCourse(data))
      .catch((requestError) => {
        setError(requestError)
        setCourse(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { course, isLoading, error, refetch }
}

export default useCourse