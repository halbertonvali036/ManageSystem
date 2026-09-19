import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyAttendance(filters = {}) {
  const { search, dateFrom, dateTo, classId, courseId, status } = filters
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyAttendance({ search, dateFrom, dateTo, classId, courseId, status })
      .then((data) => {
        if (isActive) {
          setError(null)
          setRecords(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setRecords([])
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
  }, [search, dateFrom, dateTo, classId, courseId, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyAttendance({ search, dateFrom, dateTo, classId, courseId, status })
      .then((data) => setRecords(data))
      .catch((requestError) => {
        setError(requestError)
        setRecords([])
      })
      .finally(() => setIsLoading(false))
  }, [search, dateFrom, dateTo, classId, courseId, status])

  return { records, isLoading, error, refetch }
}

export default useMyAttendance