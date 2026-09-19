import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyClasses(filters = {}) {
  const { search, course, academicYear, semester, status } = filters
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyClasses({ search, course, academicYear, semester, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setClasses(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setClasses([])
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
  }, [search, course, academicYear, semester, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyClasses({ search, course, academicYear, semester, status })
      .then((data) => setClasses(data))
      .catch((requestError) => {
        setError(requestError)
        setClasses([])
      })
      .finally(() => setIsLoading(false))
  }, [search, course, academicYear, semester, status])

  return { classes, isLoading, error, refetch }
}

export default useMyClasses