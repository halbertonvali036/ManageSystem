import { useCallback, useEffect, useState } from 'react'
import assessmentsService from '@/services/assessmentsService'

function useAssessments({
  search,
  courseId,
  classId,
  type,
  academicYear,
  semester,
  status,
} = {}) {
  const [assessments, setAssessments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true
    assessmentsService
      .getAssessments({
        search,
        courseId,
        classId,
        type,
        academicYear,
        semester,
        status,
      })
      .then((data) => {
        if (isActive) {
          setError(null)
          setAssessments(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError)
          setAssessments([])
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
  }, [search, courseId, classId, type, academicYear, semester, status])

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    assessmentsService
      .getAssessments({
        search,
        courseId,
        classId,
        type,
        academicYear,
        semester,
        status,
      })
      .then((data) => setAssessments(data))
      .catch((requestError) => {
        setError(requestError)
        setAssessments([])
      })
      .finally(() => setIsLoading(false))
  }, [search, courseId, classId, type, academicYear, semester, status])

  return { assessments, isLoading, error, refetch }
}

export default useAssessments