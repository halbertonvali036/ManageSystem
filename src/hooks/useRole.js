import { useCallback, useEffect, useState } from 'react'
import rolesService from '@/services/rolesService'

function useRole(id) {
  const [role, setRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    rolesService
      .getRole(id)
      .then((data) => {
        if (isActive) {
          setRole(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setRole(null)
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
    rolesService
      .getRole(id)
      .then((data) => setRole(data))
      .catch((requestError) => {
        setError(requestError)
        setRole(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { role, isLoading, error, refetch }
}

export default useRole