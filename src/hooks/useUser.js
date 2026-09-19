import { useCallback, useEffect, useState } from 'react'
import usersService from '@/services/usersService'

function useUser(id) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    usersService
      .getUser(id)
      .then((data) => {
        if (isActive) {
          setUser(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setUser(null)
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
    usersService
      .getUser(id)
      .then((data) => setUser(data))
      .catch((requestError) => {
        setError(requestError)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { user, isLoading, error, refetch }
}

export default useUser