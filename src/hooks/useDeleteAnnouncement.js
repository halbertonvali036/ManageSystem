import { useCallback, useRef, useState } from 'react'
import announcementsService from '@/services/announcementsService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getDeleteErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return 'Backend API is not connected yet. Announcement deletion is unavailable.'
  }
  return error?.message ?? 'Could not delete the announcement.'
}

function useDeleteAnnouncement(id) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const inFlightRef = useRef(false)

  const deleteAnnouncement = useCallback(async () => {
    if (!id || inFlightRef.current) {
      return { ok: false }
    }
    inFlightRef.current = true
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await announcementsService.deleteAnnouncement(id)
      return { ok: true }
    } catch (error) {
      setDeleteError(getDeleteErrorMessage(error))
      return { ok: false }
    } finally {
      inFlightRef.current = false
      setIsDeleting(false)
    }
  }, [id])

  return { isDeleting, deleteError, deleteAnnouncement }
}

export default useDeleteAnnouncement