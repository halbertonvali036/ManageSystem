import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyAssessments(filters = {}) {
  const { search, type, status } = filters
  const [assessments, setAssessments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teacherService
      .getMyAssessments({ search, type, status })
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
  }, [search, type, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyAssessments({ search, type, status })
      .then((data) => setAssessments(data))
      .catch((requestError) => {
        setError(requestError)
        setAssessments([])
      })
      .finally(() => setIsLoading(false))
  }, [search, type, status])

  return { assessments, isLoading, error, refetch }
}

export default useMyAssessments