import { useCallback, useRef, useState } from 'react'
import enrollmentsService from '@/services/enrollmentsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getRemoveErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Removing this student from the class is unavailable.'
  }
  return error?.message ?? 'Could not remove the student from the class.'
}

function useRemoveClassStudent(classId) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(null)
  const inFlightRef = useRef(false)

  const removeStudent = useCallback(
    async (studentId) => {
      if (!studentId || inFlightRef.current) {
        return { ok: false }
      }
      inFlightRef.current = true
      setIsRemoving(true)
      setRemoveError(null)
      try {
        await enrollmentsService.removeStudentFromClass(classId, studentId)
        return { ok: true }
      } catch (error) {
        setRemoveError(getRemoveErrorMessage(error))
        return { ok: false }
      } finally {
        inFlightRef.current = false
        setIsRemoving(false)
      }
    },
    [classId],
  )

  return { isRemoving, removeError, removeStudent }
}

export default useRemoveClassStudent