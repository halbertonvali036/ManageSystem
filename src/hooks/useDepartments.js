import { useCallback, useEffect, useState } from 'react'
import departmentsService from '@/services/departmentsService'

function useDepartments({ search, status } = {}) {
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    departmentsService
      .getDepartments({ search, status })
      .then((data) => {
        if (isActive) {
          setDepartments(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setDepartments([])
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
    departmentsService
      .getDepartments({ search, status })
      .then((data) => setDepartments(data))
      .catch((requestError) => {
        setError(requestError)
        setDepartments([])
      })
      .finally(() => setIsLoading(false))
  }, [search, status])

  return { departments, isLoading, error, refetch }
}

export default useDepartments