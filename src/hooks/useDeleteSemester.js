import { useCallback, useRef, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getDeleteErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Semester deletion is unavailable.'
  }
  return error?.message ?? 'Could not delete the semester.'
}

function useDeleteSemester(academicYearId, semesterId) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const inFlightRef = useRef(false)

  const deleteSemester = useCallback(async () => {
    if (!academicYearId || !semesterId || inFlightRef.current) {
      return { ok: false }
    }
    inFlightRef.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await academicYearsService.deleteSemester(academicYearId, semesterId)
      return { ok: true }
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error))
      return { ok: false }
    } finally {
      inFlightRef.current = false
      setIsDeleting(false)
    }
  }, [academicYearId, semesterId])

  return { isDeleting, deleteError, deleteSemester }
}

export default useDeleteSemester