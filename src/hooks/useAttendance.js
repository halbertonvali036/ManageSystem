import { useCallback, useEffect, useState } from 'react'
import attendanceService from '@/services/attendanceService'

function useAttendance(filters = {}) {
  const { search, date, classId, status } = filters
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    attendanceService
      .getAttendance({ search, date, classId, status })
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
  }, [search, date, classId, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    attendanceService
      .getAttendance({ search, date, classId, status })
      .then((data) => setRecords(data))
      .catch((requestError) => {
        setError(requestError)
        setRecords([])
      })
      .finally(() => setIsLoading(false))
  }, [search, date, classId, status])

  return { records, isLoading, error, refetch }
}

export default useAttendance