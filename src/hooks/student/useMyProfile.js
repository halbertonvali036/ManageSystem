import { useCallback, useEffect, useState } from 'react'
import studentService from '@/services/studentService'

function useMyProfile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    studentService
      .getMyProfile()
      .then((data) => {
        if (isActive) {
          setError(null)
          setProfile(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setProfile(null)
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
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    studentService
      .getMyProfile()
      .then((data) => setProfile(data))
      .catch((requestError) => {
        setError(requestError)
        setProfile(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { profile, isLoading, error, refetch }
}

export default useMyProfile