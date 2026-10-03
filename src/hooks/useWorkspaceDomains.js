import { useCallback, useEffect, useMemo, useState } from 'react'
import domainService from '@/services/domainService'
import {
  DOMAIN_FILTER_ALL,
  DOMAIN_STATUS,
  countDomainsByStatus,
  filterDomains,
} from '@/models/domain'

/**
 * Loads a workspace's domains and owns the search / type / status filters.
 *
 * There is no catalog to fall back on here, unlike integrations: a domain is a record
 * the customer created, so a workspace with no backend reports no domains and the
 * page stays empty. That is the honest answer — seeding example.com would look like
 * real data and invite a DNS change against a name nobody owns.
 *
 * All filters run over the loaded list; nothing is fetched per keystroke.
 */
function useWorkspaceDomains(workspaceId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, domains: [], error: null })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(DOMAIN_FILTER_ALL)
  const [type, setType] = useState(DOMAIN_FILTER_ALL)

  const requestKey = enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    domainService
      .getDomains(workspaceId)
      .then((domains) => {
        if (isActive) {
          setResult({ key: requestKey, domains, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, domains: [], error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isMatched = result.key === requestKey
  const domains = useMemo(
    () => (isMatched ? result.domains : []),
    [isMatched, result.domains]
  )

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId])

  const visibleDomains = useMemo(
    () => filterDomains(domains, { query, status, type }),
    [domains, query, status, type]
  )

  const statusCounts = useMemo(() => countDomainsByStatus(domains), [domains])

  const isFiltered =
    query.trim().length > 0 ||
    status !== DOMAIN_FILTER_ALL ||
    type !== DOMAIN_FILTER_ALL

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus(DOMAIN_FILTER_ALL)
    setType(DOMAIN_FILTER_ALL)
  }, [])

  return {
    domains,
    visibleDomains,
    total: domains.length,
    connectedCount: statusCounts[DOMAIN_STATUS.CONNECTED],
    pendingCount: statusCounts[DOMAIN_STATUS.PENDING],
    errorCount: statusCounts[DOMAIN_STATUS.ERROR],
    statusCounts,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    query,
    setQuery,
    status,
    setStatus,
    type,
    setType,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceDomains
