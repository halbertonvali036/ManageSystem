import { useCallback, useEffect, useState } from 'react'
import usersService from '@/services/usersService'

function useUsers({ search, role, status } = {}) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    usersService
      .getUsers({ search, role, status })
      .then((data) => {
        if (isActive) {
          setUsers(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setUsers([])
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
  }, [search, role, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    usersService
      .getUsers({ search, role, status })
      .then((data) => setUsers(data))
      .catch((requestError) => {
        setError(requestError)
        setUsers([])
      })
      .finally(() => setIsLoading(false))
  }, [search, role, status])

  return { users, isLoading, error, refetch }
}

export default useUsers