import { useCallback, useRef, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getDeleteErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Academic year deletion is unavailable.'
  }
  return error?.message ?? 'Could not delete the academic year.'
}

function useDeleteAcademicYear(id) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const inFlightRef = useRef(false)

  const deleteAcademicYear = useCallback(async () => {
    if (!id || inFlightRef.current) {
      return { ok: false }
    }
    inFlightRef.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await academicYearsService.deleteAcademicYear(id)
      return { ok: true }
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error))
      return { ok: false }
    } finally {
      inFlightRef.current = false
      setIsDeleting(false)
    }
  }, [id])

  return { isDeleting, deleteError, deleteAcademicYear }
}

export default useDeleteAcademicYear