import { useCallback, useEffect, useState } from 'react'
import coursesService from '@/services/coursesService'

function useCourses(filters = {}) {
  const { search, department, status } = filters
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    coursesService
      .getCourses({ search, department, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setCourses(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setCourses([])
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
  }, [search, department, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    coursesService
      .getCourses({ search, department, status })
      .then((data) => setCourses(data))
      .catch((requestError) => {
        setError(requestError)
        setCourses([])
      })
      .finally(() => setIsLoading(false))
  }, [search, department, status])

  return { courses, isLoading, error, refetch }
}

export default useCourses