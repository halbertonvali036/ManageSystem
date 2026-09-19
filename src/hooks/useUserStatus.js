import { useCallback, useRef, useState } from 'react'
import usersService from '@/services/usersService'
import { BackendNotConnectedError } from '@/services/httpClient'

const getStatusErrorMessage = (action, error) => {
  if (error instanceof BackendNotConnectedError) {
    return `Backend API is not connected yet. User ${action} is unavailable.`
  }
  return error?.message ?? `Could not ${action} the user.`
}

function useUserStatus(id) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const inFlightRef = useRef(false)

  const runAction = useCallback(
    async (name, action) => {
      if (!id || inFlightRef.current) {
        return { ok: false }
      }
      inFlightRef.current = true
      setIsUpdating(true)
      setStatusError(null)
      try {
        await action()
        return { ok: true }
      } catch (error) {
        setStatusError(getStatusErrorMessage(name, error))
        return { ok: false }
      } finally {
        inFlightRef.current = false
        setIsUpdating(false)
      }
    },
    [id],
  )

  const activate = useCallback(
    () => runAction('activation', () => usersService.activateUser(id)),
    [id, runAction],
  )

  const deactivate = useCallback(
    () => runAction('deactivation', () => usersService.deactivateUser(id)),
    [id, runAction],
  )

  return { isUpdating, statusError, activate, deactivate }
}

export default useUserStatus