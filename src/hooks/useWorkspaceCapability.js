import { useCallback, useEffect, useMemo, useState } from 'react'
import capabilityService from '@/services/capabilityService'
import {
  isKnownCapability,
  normalizeCapability,
} from '@/models/capability'

/**
 * Loads one capability by catalog id.
 *
 * The catalog guarantees the id exists, so this never 404s on an unknown module.
 * Without a backend the read returns null and the page renders an honest
 * not-found state rather than a capability card with invented values.
 */
function useWorkspaceCapability(workspaceId, capabilityId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, capability: null, error: null })

  const requestKey =
    enabled && workspaceId && capabilityId
      ? `${workspaceId}|${capabilityId}|${reloadToken}`
      : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    capabilityService
      .getCapability(workspaceId, capabilityId)
      .then((capability) => {
        if (isActive) {
          setResult({ key: requestKey, capability, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, capability: null, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, capabilityId])

  const isMatched = result.key === requestKey

  // A read that returns nothing still has a catalog shape to render, so the
  // settings view can describe the module without claiming it is configured.
  const capability = useMemo(() => {
    if (!isMatched) return null
    return (
      result.capability ??
      normalizeCapability({ id: capabilityId, enabled: false })
    )
  }, [isMatched, result.capability, capabilityId])

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId || !capabilityId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId, capabilityId])

  return {
    capability,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    isCatalogCapability: isKnownCapability(capabilityId),
    refetch,
  }
}

export default useWorkspaceCapability
