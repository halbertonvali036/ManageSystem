import { useCallback, useEffect, useMemo, useState } from 'react'
import deploymentService from '@/services/deploymentService'
import {
  DEPLOYMENT_FILTER_ALL,
  DEPLOYMENT_STATUS,
  countDeploymentsByStatus,
  filterDeployments,
  findLiveDeployment,
  isPendingDeployment,
  sortDeploymentsByCreatedAt,
} from '@/models/deployment'

/**
 * Loads a workspace's deployment history and owns the search / status / site filters.
 *
 * Like domains, a deployment is a record the backend owns, so an unconnected
 * workspace reports no history at all. There is deliberately no seeded "draft" row to
 * make the page look used: a fabricated build would be indistinguishable from a real
 * one in the UI, and someone would eventually try to promote it.
 *
 * All filters run over the loaded list; nothing is fetched per keystroke.
 */
function useWorkspaceDeployments(workspaceId, { enabled = true } = {}) {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState({ key: null, deployments: [], error: null })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(DEPLOYMENT_FILTER_ALL)
  const [siteId, setSiteId] = useState(null)

  const requestKey = enabled && workspaceId ? `${workspaceId}|${reloadToken}` : null

  useEffect(() => {
    if (requestKey === null) {
      return undefined
    }

    let isActive = true

    deploymentService
      .getDeployments(workspaceId)
      .then((deployments) => {
        if (isActive) {
          setResult({ key: requestKey, deployments, error: null })
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({ key: requestKey, deployments: [], error })
        }
      })

    return () => {
      isActive = false
    }
  }, [requestKey, workspaceId])

  const isMatched = result.key === requestKey

  // Newest first. Sorting is on the timestamps the backend supplied; a row with no
  // timestamp keeps its place at the end rather than being guessed at.
  const deployments = useMemo(
    () => (isMatched ? sortDeploymentsByCreatedAt(result.deployments) : []),
    [isMatched, result.deployments]
  )

  const refetch = useCallback(() => {
    if (!enabled || !workspaceId) return
    setReloadToken((token) => token + 1)
  }, [enabled, workspaceId])

  const visibleDeployments = useMemo(
    () => filterDeployments(deployments, { query, status, siteId }),
    [deployments, query, status, siteId]
  )

  const statusCounts = useMemo(
    () => countDeploymentsByStatus(deployments),
    [deployments]
  )

  /** The build currently on the record, or null when the backend reports none. */
  const liveDeployment = useMemo(
    () => findLiveDeployment(deployments, siteId),
    [deployments, siteId]
  )

  /**
   * True while the backend reports a build in flight. Polling is opt-in: the page
   * enables it only when there is something moving, so an idle history does not
   * generate requests.
   */
  const hasRunningDeployment = useMemo(
    () => deployments.some((deployment) => isPendingDeployment(deployment.status)),
    [deployments]
  )

  const isFiltered =
    query.trim().length > 0 ||
    status !== DEPLOYMENT_FILTER_ALL ||
    Boolean(siteId)

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus(DEPLOYMENT_FILTER_ALL)
    setSiteId(null)
  }, [])

  return {
    deployments,
    visibleDeployments,
    total: deployments.length,
    liveCount: statusCounts[DEPLOYMENT_STATUS.LIVE],
    failedCount: statusCounts[DEPLOYMENT_STATUS.FAILED],
    statusCounts,
    liveDeployment,
    hasRunningDeployment,
    isLoading: requestKey !== null && !isMatched,
    error: isMatched ? result.error : null,
    query,
    setQuery,
    status,
    setStatus,
    siteId,
    setSiteId,
    isFiltered,
    clearFilters,
    refetch,
  }
}

export default useWorkspaceDeployments
