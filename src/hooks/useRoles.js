import { useCallback, useEffect, useState } from 'react'
import rolesService from '@/services/rolesService'

function useRoles({ search, status } = {}) {
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    rolesService
      .getRoles({ search, status })
      .then((data) => {
        if (isActive) {
          setRoles(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setRoles([])
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
    rolesService
      .getRoles({ search, status })
      .then((data) => setRoles(data))
      .catch((requestError) => {
        setError(requestError)
        setRoles([])
      })
      .finally(() => setIsLoading(false))
  }, [search, status])

  return { roles, isLoading, error, refetch }
}

export default useRoles