import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyCourses(filters = {}) {
  const { search, status } = filters
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyCourses({ search, status })
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
  }, [search, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyCourses({ search, status })
      .then((data) => setCourses(data))
      .catch((requestError) => {
        setError(requestError)
        setCourses([])
      })
      .finally(() => setIsLoading(false))
  }, [search, status])

  return { courses, isLoading, error, refetch }
}

export default useMyCourses