import { useCallback, useEffect, useState } from 'react'
import announcementsService from '@/services/announcementsService'

function useAnnouncements(filters = {}) {
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    announcementsService
      .getAnnouncements(filters)
      .then((data) => {
        if (isActive) {
          setError(null)
          setAnnouncements(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAnnouncements([])
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
  }, [filters])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    announcementsService
      .getAnnouncements(filters)
      .then((data) => setAnnouncements(data))
      .catch((requestError) => {
        setError(requestError)
        setAnnouncements([])
      })
      .finally(() => setIsLoading(false))
  }, [filters])

  return { announcements, isLoading, error, refetch }
}

export default useAnnouncements