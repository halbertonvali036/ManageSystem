import { useCallback, useEffect, useMemo, useState } from 'react'
import integrationService from '@/services/integrationService'
import {
  isKnownIntegration,
  normalizeIntegration,
} from '@/models/integration'

/**
 * Loads one integration by catalog id.
 *
 * The catalog guarantees the id exists, so this never 404s on an unknown service.
 * Without a backend the read returns null and the page renders an honest
 * not-found state rather than a card with invented connection values.
 */
function useWorkspaceIntegration(workspaceId, integrationId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, integration: null, error: null })

  const requestKey =
    enabled && workspaceId && integrationId
      ? `${workspaceId}|${integrationId}|${reloadToken}`
      : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    integrationService
      .getIntegration(integrationId, workspaceId)
      .then((integration) => {
        if (isActive) {
          setResult({ key: requestKey, integration, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, integration: null, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId, integrationId])

  const isMatched = result.key === requestKey

  // A read that returns nothing still has a catalog shape to render, so the
  // detail view can describe the service without claiming it is connected.
  const integration = useMemo(() => {
    if (!isMatched) return null
    return (
      result.integration ??
      normalizeIntegration({ id: integrationId })
    )
  }, [isMatched, result.integration, integrationId])

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId || !integrationId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId, integrationId])

  return {
    integration,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    isCatalogIntegration: isKnownIntegration(integrationId),
    refetch,
  }
}

export default useWorkspaceIntegration
