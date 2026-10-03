import { useCallback, useEffect, useMemo, useState } from 'react'
import integrationService from '@/services/integrationService'
import {
  INTEGRATION_FILTER_ALL,
  INTEGRATION_STATUS,
  countIntegrationsByStatus,
  filterIntegrations,
  withCatalogIntegrations,
} from '@/models/integration'

/**
 * Loads a workspace's integrations and owns the search / status / category filters.
 *
 * The catalog is known code, so services the backend has not reported yet are still
 * listed — as available and not connected. That fills the page in honestly without
 * inventing a single connection, because only the backend can set one.
 *
 * All filters run over the loaded list; nothing is fetched per keystroke.
 */
function useWorkspaceIntegrations(workspaceId, { enabled = true, getLabels } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, integrations: [], error: null })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(INTEGRATION_FILTER_ALL)
  const [category, setCategory] = useState(INTEGRATION_FILTER_ALL)

  const requestKey = enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    integrationService
      .getIntegrations(workspaceId)
      .then((integrations) => {
        if (isActive) {
          setResult({ key: requestKey, integrations, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, integrations: [], error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isLoading = requestKey !== null && result.key !== requestKey

  const integrations = useMemo(
    () =>
      withCatalogIntegrations(
        result.key === requestKey ? result.integrations : []
      ),
    [result.key, requestKey, result.integrations]
  )

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId])

  const visibleIntegrations = useMemo(
    () => filterIntegrations(integrations, { query, status, category }, getLabels),
    [integrations, query, status, category, getLabels]
  )

  const statusCounts = useMemo(
    () => countIntegrationsByStatus(integrations),
    [integrations]
  )

  const isFiltered =
    query.trim().length > 0 ||
    status !== INTEGRATION_FILTER_ALL ||
    category !== INTEGRATION_FILTER_ALL

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus(INTEGRATION_FILTER_ALL)
    setCategory(INTEGRATION_FILTER_ALL)
  }, [])

  return {
    integrations,
    visibleIntegrations,
    total: integrations.length,
    connectedCount: statusCounts[INTEGRATION_STATUS.CONNECTED],
    needsConfigCount: statusCounts[INTEGRATION_STATUS.REQUIRES_CONFIG],
    statusCounts,
    isLoading,
    error: result.key === requestKey ? result.error : null,
    query,
    setQuery,
    status,
    setStatus,
    category,
    setCategory,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceIntegrations
