import { useCallback, useEffect, useState } from 'react'
import workspaceService from '@/services/workspaceService'

/**
 * Loads a single workspace by id.
 *
 * Returns null while loading or when the backend is absent, so the page can
 * show a not-found state rather than a blank screen.
 *
 * The result carries the id it belongs to, and the returned view compares that
 * id with the requested one. A workspace switch is therefore already a loading
 * state on the very first render after navigation, so the effect never has to
 * clear the previous workspace by setting state synchronously — it only has to
 * resolve the fetch.
 */
function useWorkspace(workspaceId) {
  const [result, setResult] = useState({
    id: null,
    workspace: null,
    isLoading: Boolean(workspaceId),
    error: null,
  })

  useEffect(() => {
    if (!workspaceId) {
      return undefined
    }

    let isActive = true

    workspaceService
      .getWorkspace(workspaceId)
      .then((workspace) => {
        if (isActive) {
          setResult({ id: workspaceId, workspace, isLoading: false, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ id: workspaceId, workspace: null, isLoading: false, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [workspaceId])

  const refetch = useCallback(() => {
    if (!workspaceId) return
    setResult((prev) => ({ ...prev, isLoading: true }))
    workspaceService
      .getWorkspace(workspaceId)
      .then((workspace) =>
        setResult({ id: workspaceId, workspace, isLoading: false, error: null })
      )
      .catch((error) =>
        setResult({ id: workspaceId, workspace: null, isLoading: false, error })
      )
  }, [workspaceId])

  return {
    workspace: result.id === workspaceId ? result.workspace : null,
    isLoading: result.id !== workspaceId || result.isLoading,
    error: result.id === workspaceId ? result.error : null,
    refetch,
  }
}

export default useWorkspace
