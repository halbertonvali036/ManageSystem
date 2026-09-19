import { useCallback, useEffect, useState } from 'react'
import teacherService from '@/services/teacherService'

function useMyClassStudents(classId) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    teacherService
      .getMyClassStudents(classId)
      .then((data) => {
        if (isActive) {
          setError(null)
          setStudents(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setStudents([])
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
  }, [classId])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    teacherService
      .getMyClassStudents(classId)
      .then((data) => setStudents(data))
      .catch((requestError) => {
        setError(requestError)
        setStudents([])
      })
      .finally(() => setIsLoading(false))
  }, [classId])

  return { students, isLoading, error, refetch }
}

export default useMyClassStudents