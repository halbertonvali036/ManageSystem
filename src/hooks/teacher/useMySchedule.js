import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMySchedule(filters = {}) {
  const { date, weekStart } = filters
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    const request = date
      ? teacherService.getMyScheduleByDate(date)
      : teacherService.getMyScheduleByWeek(weekStart)

    request
      .then((data) => {
        if (isActive) {
          setError(null)
          setItems(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setItems([])
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
  }, [date, weekStart])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    const request = date
      ? teacherService.getMyScheduleByDate(date)
      : teacherService.getMyScheduleByWeek(weekStart)

    request
      .then((data) => setItems(data))
      .catch((requestError) => {
        setError(requestError)
        setItems([])
      })
      .finally(() => setIsLoading(false))
  }, [date, weekStart])

  return { items, isLoading, error, refetch }
}

export default useMySchedule