import { useCallback, useEffect, useMemo, useState } from 'react'
import domainService from '@/services/domainService'

/**
 * Loads one domain by id.
 *
 * A domain is a stored record rather than a catalog entry, so there is nothing to
 * fall back on: without a backend the read returns null and the page renders an
 * honest not-found state. The empty shape exists only so the detail view can name
 * the domain it was asked for — it carries no verification or certificate state.
 */
function useWorkspaceDomain(workspaceId, domainId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, domain: null, error: null })

  const requestKey =
    enabled && workspaceId && domainId
      ? `${workspaceId}|${domainId}|${reloadToken}`
      : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    domainService
      .getDomain(domainId, workspaceId)
      .then((domain) => {
        if (isActive) {
          setResult({ key: requestKey, domain, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, domain: null, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, domainId])

  const isMatched = result.key === requestKey

  const domain = useMemo(() => {
    if (!isMatched) return null
    return result.domain
  }, [isMatched, result.domain])

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId || !domainId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId, domainId])

  return {
    domain,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    refetch,
  }
}

export default useWorkspaceDomain
