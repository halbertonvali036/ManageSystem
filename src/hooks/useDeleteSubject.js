import { useCallback, useRef, useState } from 'react'
import subjectsService from '@/services/subjectsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getDeleteErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Subject deletion is unavailable.'
  }
  return error?.message ?? 'Could not delete the subject.'
}

function useDeleteSubject(id) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const inFlightRef = useRef(false)

  const deleteSubject = useCallback(async () => {
    if (!id || inFlightRef.current) {
      return { ok: false }
    }
    inFlightRef.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await subjectsService.deleteSubject(id)
      return { ok: true }
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error))
      return { ok: false }
    } finally {
      inFlightRef.current = false
      setIsDeleting(false)
    }
  }, [id])

  return { isDeleting, deleteError, deleteSubject }
}

export default useDeleteSubject