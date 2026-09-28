import { useCallback, useEffect, useMemo, useState } from 'react'
import siteService from '@/services/siteService'
import {
  ALL_SITES_FILTER,
  countSitesByStatus,
  filterSites,
} from '@/models/site'

/** Stable identity so consumers do not re-derive on every render. */
const NO_SITES = Object.freeze([])

/**
 * Loads the signed-in account's website projects.
 *
 * Search and status filtering happen here, on already-loaded data, so every
 * consumer agrees on what "recent" and "draft" mean. Nothing is invented to fill
 * a filter: with no backend the list is empty and the honest empty state renders.
 */
function useSites({ enabled = true } = {}) {
  // A reload token makes refetching an ordinary key change, so the effect and
  // the retry path stay a single request path.
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({
    key: null,
    sites: NO_SITES,
    error: null,
  })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(ALL_SITES_FILTER)

  const requestKey = enabled ? `all|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    siteService
      .getMySites()
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
  }, [requestKey])

  // Derived during render: a request is in flight until the result matches the
  // current key. This keeps the effect free of synchronous state updates.
  const isLoading = requestKey !== null && result.key !== requestKey
  const sites = result.key === requestKey ? result.sites : NO_SITES

  const refetch = useCallback(() => {
    if (!enabled) {
      return
    }
    setReloadToken((token) => token + 1)
  }, [enabled])

  const visibleSites = useMemo(() => {
    const matched = filterSites(sites, { query, status })
    // Most recently updated first, so the top of the grid is the "recent
    // projects" the workspace leads with. Projects without a timestamp keep a
    // stable position at the end instead of jumping around.
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

export default useSites
