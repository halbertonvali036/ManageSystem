import { useCallback, useRef, useState } from 'react'
import assessmentsService from '@/services/assessmentsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getDeleteErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Assessment deletion is unavailable.'
  }
  return error?.message ?? 'Could not delete the assessment.'
}

function useDeleteAssessment(id) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const inFlightRef = useRef(false)

  const deleteAssessment = useCallback(async () => {
    if (!id || inFlightRef.current) {
      return { ok: false }
    }
    inFlightRef.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await assessmentsService.deleteAssessment(id)
      return { ok: true }
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error))
      return { ok: false }
    } finally {
      inFlightRef.current = false
      setIsDeleting(false)
    }
  }, [id])

  return { isDeleting, deleteError, deleteAssessment }
}

export default useDeleteAssessment