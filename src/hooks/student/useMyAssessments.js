import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyAssessments(filters = {}) {
  const { search, type } = filters
  const [assessments, setAssessments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyAssessments({ search, type })
      .then((data) => {
        if (isActive) {
          setError(null)
          setAssessments(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAssessments([])
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
  }, [search, type])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyAssessments({ search, type })
      .then((data) => setAssessments(data))
      .catch((requestError) => {
        setError(requestError)
        setAssessments([])
      })
      .finally(() => setIsLoading(false))
  }, [search, type])

  return { assessments, isLoading, error, refetch }
}

export default useMyAssessments