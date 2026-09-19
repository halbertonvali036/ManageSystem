import { useCallback, useRef, useState } from 'react'
import usersService from '@/services/usersService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getDeleteErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. User deletion is unavailable.'
  }
  return error?.message ?? 'Could not delete the user.'
}

function useDeleteUser(id) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const inFlightRef = useRef(false)

  const deleteUser = useCallback(async () => {
    if (!id || inFlightRef.current) {
      return { ok: false }
    }
    inFlightRef.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await usersService.deleteUser(id)
      return { ok: true }
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error))
      return { ok: false }
    } finally {
      inFlightRef.current = false
      setIsDeleting(false)
    }
  }, [id])

  return { isDeleting, deleteError, deleteUser }
}

export default useDeleteUser