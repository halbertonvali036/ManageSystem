import { useCallback, useEffect, useMemo, useState } from 'react'
import deploymentService from '@/services/deploymentService'

/**
 * Loads one deployment by id.
 *
 * A deployment is a stored record, so there is no catalog to fall back on. Without a
 * backend the read returns null and the page renders an honest not-found state
 * rather than a plausible-looking build.
 */
function useDeployment(deploymentId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, deployment: null, error: null })

  const requestKey =
    enabled && deploymentId ? `${deploymentId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    deploymentService
      .getDeployment(deploymentId)
      .then((deployment) => {
        if (isActive) {
          setResult({ key: requestKey, deployment, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, deployment: null, error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, deploymentId])

  const isMatched = result.key === requestKey

  const deployment = useMemo(() => {
    if (!isMatched) return null
    return result.deployment
  }, [isMatched, result.deployment])

  const refetch = useCallback(() => {
    if (!enabled || !deploymentId) return
    setReloadToken((token) => token + 1)
  }, [enabled, deploymentId])

  return {
    deployment,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    refetch,
  }
}

export default useDeployment
