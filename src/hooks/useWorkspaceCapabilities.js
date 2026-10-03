import { useCallback, useEffect, useMemo, useState } from 'react'
import capabilityService from '@/services/capabilityService'
import {
  CAPABILITY_FILTER_ALL,
  CAPABILITY_STATUS,
  countCapabilitiesByStatus,
  filterCapabilities,
  withCatalogCapabilities,
} from '@/models/capability'

/**
 * Loads a workspace's capabilities and owns the search / status filter.
 *
 * The catalog is known code, so capabilities the backend has not reported yet are
 * still listed — as available and disabled. That fills the page in honestly
 * without inventing a single `enabled` flag, because only the backend can set one.
 *
 * Both filters run over the loaded list; nothing is fetched per keystroke.
 */
function useWorkspaceCapabilities(workspaceId, { enabled = true, getLabels } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, capabilities: [], error: null })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(CAPABILITY_FILTER_ALL)

  const requestKey =
    enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    capabilityService
      .getCapabilities(workspaceId)
      .then((capabilities) => {
        if (isActive) {
          setResult({ key: requestKey, capabilities, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, capabilities: [], error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isLoading = requestKey !== null && result.key !== requestKey

  const capabilities = useMemo(
    () => withCatalogCapabilities(result.key === requestKey ? result.capabilities : []),
    [result.key, requestKey, result.capabilities]
  )

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId])

  const visibleCapabilities = useMemo(
    () => filterCapabilities(capabilities, { query, status }, getLabels),
    [capabilities, query, status, getLabels]
  )

  const statusCounts = useMemo(
    () => countCapabilitiesByStatus(capabilities),
    [capabilities]
  )

  const isFiltered = query.trim().length > 0 || status !== CAPABILITY_FILTER_ALL

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus(CAPABILITY_FILTER_ALL)
  }, [])

  return {
    capabilities,
    visibleCapabilities,
    total: capabilities.length,
    enabledCount: statusCounts[CAPABILITY_STATUS.ENABLED],
    integrationCount: statusCounts[CAPABILITY_STATUS.REQUIRES_INTEGRATION],
    statusCounts,
    isLoading,
    error: result.key === requestKey ? result.error : null,
    query,
    setQuery,
    status,
    setStatus,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceCapabilities
