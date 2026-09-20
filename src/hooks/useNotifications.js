import { useCallback, useEffect, useState } from 'react'
import notificationsService from '@/services/notificationsService'

function useNotifications(filters = {}) {
  const { unreadOnly, type } = filters
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    notificationsService
      .getNotifications({ unreadOnly, type })
      .then((data) => {
        if (!isActive) {
          return
        }
        setError(null)
        setNotifications(data)
      })
      .catch((requestError) => {
        if (!isActive) {
          return
        }
        setError(requestError)
        setNotifications([])
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
  }, [unreadOnly, type])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    notificationsService
      .getNotifications({ unreadOnly, type })
      .then((data) => {
        setNotifications(data)
      })
      .catch((requestError) => {
        setError(requestError)
        setNotifications([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [unreadOnly, type])

  return { notifications, isLoading, error, refetch }
}

export default useNotifications