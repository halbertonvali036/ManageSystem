import { useCallback, useRef, useState } from 'react'
import enrollmentsService from '@/services/enrollmentsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getEnrollErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Enrollment is unavailable.'
  }
  return error?.message ?? 'Could not enroll the selected students.'
}

function useEnrollStudents(classId) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState(null)
  const inFlightRef = useRef(false)

  const enrollStudents = useCallback(
    async (studentIds) => {
      if (
        !Array.isArray(studentIds) ||
        studentIds.length === 0 ||
        inFlightRef.current
      ) {
        return { ok: false }
      }
      inFlightRef.current = true
      setIsEnrolling(true)
      setEnrollError(null)
      try {
        await enrollmentsService.enrollStudents(classId, studentIds)
        return { ok: true }
      } catch (error) {
        setEnrollError(getEnrollErrorMessage(error))
        return { ok: false }
      } finally {
        inFlightRef.current = false
        setIsEnrolling(false)
      }
    },
    [classId],
  )

  return { isEnrolling, enrollError, enrollStudents }
}

export default useEnrollStudents