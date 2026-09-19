import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyAttendance(filters = {}) {
  const { search, date, classId, status } = filters
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    teacherService
      .getMyAttendance({ search, date, classId, status })
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
    teacherService
      .getMyAttendance({ search, date, classId, status })
      .then((data) => setRecords(data))
      .catch((requestError) => {
        setError(requestError)
        setRecords([])
      })
      .finally(() => setIsLoading(false))
  }, [search, date, classId, status])

  return { records, isLoading, error, refetch }
}

export default useMyAttendance