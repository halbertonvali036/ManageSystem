import { useCallback, useEffect, useState } from 'react'
import announcementsService from '@/services/announcementsService'

function useTeacherAnnouncements(filters = {}) {
  const { search, status } = filters
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    announcementsService
      .getTeacherAnnouncements({ search, status })
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
  }, [search, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    announcementsService
      .getTeacherAnnouncements({ search, status })
      .then((data) => setAnnouncements(data))
      .catch((requestError) => {
        setError(requestError)
        setAnnouncements([])
      })
      .finally(() => setIsLoading(false))
  }, [search, status])

  return { announcements, isLoading, error, refetch }
}

export default useTeacherAnnouncements