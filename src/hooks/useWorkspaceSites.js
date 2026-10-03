import { useCallback, useEffect, useMemo, useState } from 'react'
import workspaceService from '@/services/workspaceService'
import {
  ALL_SITES_FILTER,
  countSitesByStatus,
  filterSites,
} from '@/models/site'

const NO_SITES = Object.freeze([])

/**
 * Loads the sites inside a specific workspace.
 *
 * Mirrors useSites exactly, but scoped to a workspaceId. Search and status
 * filtering happen on already-loaded data. Without a backend the list is empty
 * and the honest empty state renders — no placeholder site is invented.
 */
function useWorkspaceSites(workspaceId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({
    key: null,
    sites: NO_SITES,
    error: null,
  })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(ALL_SITES_FILTER)

  const requestKey =
    enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    workspaceService
      .getWorkspaceSites(workspaceId)
      .then((sites) => {
        if (isActive) {
          setResult({ key: requestKey, sites, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, sites: NO_SITES, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isLoading = requestKey !== null && result.key !== requestKey
  const sites = result.key === requestKey ? result.sites : NO_SITES

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((t) => t + 1)
  }, [enabled, workspaceId])

  const visibleSites = useMemo(() => {
    const matched = filterSites(sites, { query, status })
    return [...matched].sort((a, b) => {
      if (!a.updatedAt) return b.updatedAt ? 1 : 0
      if (!b.updatedAt) return -1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }, [sites, query, status])

  const counts = useMemo(() => countSitesByStatus(sites), [sites])

  const isFiltered = query.trim().length > 0 || status !== ALL_SITES_FILTER

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus(ALL_SITES_FILTER)
  }, [])

  return {
    sites,
    visibleSites,
    counts,
    total: sites.length,
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

export default useWorkspaceSites
