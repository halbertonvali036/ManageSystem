import { useCallback, useEffect, useState } from 'react'
import departmentsService from '@/services/departmentsService'

function useDepartment(id) {
  const [department, setDepartment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    departmentsService
      .getDepartment(id)
      .then((data) => {
        if (isActive) {
          setDepartment(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setDepartment(null)
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
    departmentsService
      .getDepartment(id)
      .then((data) => setDepartment(data))
      .catch((requestError) => {
        setError(requestError)
        setDepartment(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { department, isLoading, error, refetch }
}

export default useDepartment