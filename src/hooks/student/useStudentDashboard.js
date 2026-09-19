import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

const EMPTY_SUMMARY = {
  courses: [],
  classes: [],
  schedule: [],
  attendance: [],
  grades: [],
  profile: null,
}

function useStudentDashboard() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    return studentService
      .getMyDashboard()
      .then((data) => setSummary(data ?? EMPTY_SUMMARY))
      .catch((requestError) => {
        setError(requestError)
        setSummary(EMPTY_SUMMARY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    let isActive = true

    studentService
      .getMyDashboard()
      .then((data) => {
        if (isActive) {
          setError(null)
          setSummary(data ?? EMPTY_SUMMARY)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setSummary(EMPTY_SUMMARY)
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
  }, [])

  return { summary, isLoading, error, refetch }
}

export default useStudentDashboard