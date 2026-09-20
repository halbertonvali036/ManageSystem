import { useCallback, useEffect, useState } from 'react'
import notificationsService from '@/services/notificationsService'

function useUnreadNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    notificationsService
      .getUnreadCount()
      .then((count) => {
        if (!isActive) {
          return
        }
        setError(null)
        setUnreadCount(Number.isFinite(count) ? count : 0)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }
        setError(requestError)
        setUnreadCount(0)
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
    notificationsService
      .getUnreadCount()
      .then((count) => {
        setUnreadCount(Number.isFinite(count) ? count : 0)
      })
      .catch((requestError) => {
        setError(requestError)
        setUnreadCount(0)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { unreadCount, isLoading, error, refetch }
}

export default useUnreadNotificationCount