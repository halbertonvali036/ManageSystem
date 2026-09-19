import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyStudentAttendance(studentId) {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    teacherService
      .getMyStudentAttendance(studentId)
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
  }, [studentId])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyStudentAttendance(studentId)
      .then((data) => setRecords(data))
      .catch((requestError) => {
        setError(requestError)
        setRecords([])
      })
      .finally(() => setIsLoading(false))
  }, [studentId])

  return { records, isLoading, error, refetch }
}

export default useMyStudentAttendance