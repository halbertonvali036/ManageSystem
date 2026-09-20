import { useCallback, useEffect, useState } from 'react'
import schedulesService from '@/services/schedulesService'

function useSchedule(id) {
  const [scheduleEntry, setScheduleEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    schedulesService
      .getSchedule(id)
      .then((data) => {
        if (isActive) {
          setScheduleEntry(data)
          setError(null)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setScheduleEntry(null)
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
    schedulesService
      .getSchedule(id)
      .then((data) => setScheduleEntry(data))
      .catch((requestError) => {
        setError(requestError)
        setScheduleEntry(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { scheduleEntry, isLoading, error, refetch }
}

export default useSchedule