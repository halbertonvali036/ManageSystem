import { useCallback, useEffect, useState } from 'react'
import databaseService from '@/services/databaseService'

/**
 * Loads a single schema model by id.
 *
 * Returns null while loading or when the backend is absent, so the page can show
 * a not-found state rather than a blank screen. Mirrors useWorkspace.
 */
function useWorkspaceModel(workspaceId, modelId) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({
    key: null,
    model: null,
    isLoading: Boolean(workspaceId && modelId),
    error: null,
  })

  const requestKey = workspaceId && modelId ? `${workspaceId}|${modelId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    databaseService
      .getModel(workspaceId, modelId)
      .then((model) => {
        if (isActive) {
          setResult({ key: requestKey, model, isLoading: false, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, model: null, isLoading: false, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, modelId])

  const isCurrent = result.key === requestKey

  const refetch = useCallback(() => {
    if (!workspaceId || !modelId) return
    setReloadToken((token) => token + 1)
  }, [workspaceId, modelId])

  return {
    model: isCurrent ? result.model : null,
    isLoading: !isCurrent || result.isLoading,
    error: isCurrent ? result.error : null,
    refetch,
  }
}

export default useWorkspaceModel
