import { useCallback, useEffect, useState } from 'react'
import teachersService from '@/services/teachersService'

function useTeacher(id) {
  const [teacher, setTeacher] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    teachersService
      .getTeacher(id)
      .then((data) => {
        if (isActive) {
          setTeacher(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setTeacher(null)
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
    teachersService
      .getTeacher(id)
      .then((data) => setTeacher(data))
      .catch((requestError) => {
        setError(requestError)
        setTeacher(null)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { teacher, isLoading, error, refetch }
}

export default useTeacher