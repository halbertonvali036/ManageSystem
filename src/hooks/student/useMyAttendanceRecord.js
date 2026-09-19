import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyAttendanceRecord(id) {
  const [record, setRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyAttendanceRecord(id)
      .then((data) => {
        if (isActive) {
          setError(null)
          setRecord(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setRecord(null)
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
  }, [id])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyAttendanceRecord(id)
      .then((data) => setRecord(data))
      .catch((requestError) => {
        setError(requestError)
        setRecord(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { record, isLoading, error, refetch }
}

export default useMyAttendanceRecord