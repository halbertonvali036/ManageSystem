import { useCallback, useEffect, useState } from 'react'
import dashboardService from '@/services/dashboardService'

const EMPTY_SUMMARY = {
  totalStudents: 0,
  totalTeachers: 0,
  totalCourses: 0,
  activeClasses: 0,
  attendance: null,
  recentActivity: [],
  upcomingClasses: [],
}

function useDashboard() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    dashboardService
      .getSummary()
      .then((data) => {
        if (!isActive) {
          return
        }
        setSummary(data)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }
        setError(requestError)
        setSummary(EMPTY_SUMMARY)
      })
      .finally(() => {
        if (!isActive) {
          return
        }
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    dashboardService
      .getSummary()
      .then((data) => {
        setSummary(data)
      })
      .catch((requestError) => {
        setError(requestError)
        setSummary(EMPTY_SUMMARY)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { summary, isLoading, error, refetch }
}

export default useDashboard