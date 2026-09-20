import { useCallback, useEffect, useState } from 'react'
import announcementsService from '@/services/announcementsService'

function useAnnouncement(id) {
  const [announcement, setAnnouncement] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    announcementsService
      .getAnnouncement(id)
      .then((data) => {
        if (isActive) {
          setAnnouncement(data)
          setError(null)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAnnouncement(null)
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
    if (!id) {
      return
    }
    setIsLoading(true)
    setError(null)
    announcementsService
      .getAnnouncement(id)
      .then((data) => setAnnouncement(data))
      .catch((requestError) => {
        setError(requestError)
        setAnnouncement(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { announcement, isLoading, error, refetch }
}

export default useAnnouncement