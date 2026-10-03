import { useCallback, useEffect, useState } from 'react'
import workspaceService from '@/services/workspaceService'

const NO_WORKSPACES = Object.freeze([])

/**
 * Loads the signed-in account's workspaces.
 *
 * Without a backend the list is always empty and the honest empty state renders.
 * No placeholder workspace is ever invented.
 */
function useWorkspaces({ enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({
    key: null,
    workspaces: NO_WORKSPACES,
    error: null,
  })

  const requestKey = enabled ? `all|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    workspaceService
      .getWorkspaces()
      .then((workspaces) => {
        if (isActive) {
          setResult({ key: requestKey, workspaces, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, workspaces: NO_WORKSPACES, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey])

  const isLoading = requestKey !== null && result.key !== requestKey
  const workspaces =
    result.key === requestKey ? result.workspaces : NO_WORKSPACES

  const refetch = useCallback(() => {
    if (!enabled) return
    setReloadToken((t) => t + 1)
  }, [enabled])

  return {
    workspaces,
    total: workspaces.length,
    isLoading,
    error: result.key === requestKey ? result.error : null,
    refetch,
  }
}

export default useWorkspaces
