import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import { isKnownDeploymentStatus, normalizeDeployment, normalizeDeploymentList } from '@/models/deployment'

/**
 * Deployment service.
 *
 * Follows the same contract as workspaceService, capabilityService and
 * integrationService:
 *  - Read operations return a safe empty value ([] / null) when the backend is not
 *    connected, so the page shows an honest state instead of a seeded history.
 *  - Every write calls requireBackend() first and throws BackendNotConnectedError,
 *    so nothing here can report a build that did not run.
 *
 * Every method below is a *request*. None of them waits for a build, none of them
 * invents a result, and none of them returns a deployment the backend did not send.
 * A deploy that is accepted comes back `queued`; what it reaches afterwards is the
 * backend's to report on a later read.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

const DEPLOYMENTS_API_PATH = (workspaceId) => `/workspaces/${workspaceId}/deployments`

const DEPLOYMENT_API_PATH = (workspaceId, deploymentId) =>
  `${DEPLOYMENTS_API_PATH(workspaceId)}/${deploymentId}`

/** The backend's site list, used to resolve a site name to its id. */
const WORKSPACE_SITES_PATH = (workspaceId) => `/workspaces/${workspaceId}/sites`

/** Every deployment the backend reports for a workspace. Empty while the API is absent. */
const getDeployments = async (workspaceId, { siteId = null, status = null } = {}) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }

  // Filtering happens server-side when the backend is present; the local filters in
  // the model stay available for narrowing a page that is already loaded.
  const params = new URLSearchParams()
  if (siteId) params.set('siteId', siteId)
  if (status && isKnownDeploymentStatus(status)) params.set('status', status)

  const query = params.toString()
  const path = query ? `${DEPLOYMENTS_API_PATH(workspaceId)}?${query}` : DEPLOYMENTS_API_PATH(workspaceId)

  return normalizeDeploymentList(await httpClient.get(path))
}

/** One deployment, or null when absent or the API is not connected. */
const getDeployment = async (deploymentId, workspaceId) => {
  if (!isBackendConnected() || !workspaceId || !deploymentId) {
    return null
  }
  return normalizeDeployment(
    await httpClient.get(DEPLOYMENT_API_PATH(workspaceId, deploymentId))
  )
}

/**
 * Requests a publish of a site. Refused until a backend is available.
 *
 * `siteId` is required and checked here so a request can never go out without
 * naming what to publish. The returned deployment is whatever the backend replied
 * with — usually `queued` — not a promise that the build succeeded.
 */
const deploySite = async (siteId, workspaceId, { version = null } = {}) => {
  requireBackend('Deploying is unavailable until the backend is connected.')

  if (!siteId) {
    throw new Error('A site is required to deploy.')
  }

  return normalizeDeployment(
    await httpClient.post(DEPLOYMENTS_API_PATH(workspaceId), {
      siteId,
      ...(version ? { version } : {}),
    })
  )
}

/** Requests a fresh build of an existing deployment. Refused until a backend is available. */
const redeploy = async (deploymentId, workspaceId) => {
  requireBackend('Redeploying is unavailable until the backend is connected.')

  return normalizeDeployment(
    await httpClient.post(`${DEPLOYMENT_API_PATH(workspaceId, deploymentId)}/redeploy`)
  )
}

/** Asks the backend to stop a build that is still moving. Refused until one is available. */
const stopDeployment = async (deploymentId, workspaceId) => {
  requireBackend('Stopping a deployment is unavailable until the backend is connected.')

  return normalizeDeployment(
    await httpClient.post(`${DEPLOYMENT_API_PATH(workspaceId, deploymentId)}/stop`)
  )
}

/**
 * Asks the backend to promote a previous version back to live. Refused until one is
 * available.
 *
 * The backend owns which version serves traffic, so this does not touch any local
 * state: the list only changes once the backend reports a new live deployment.
 */
const rollbackDeployment = async (deploymentId, workspaceId) => {
  requireBackend('Rolling back is unavailable until the backend is connected.')

  return normalizeDeployment(
    await httpClient.post(`${DEPLOYMENT_API_PATH(workspaceId, deploymentId)}/rollback`)
  )
}

/**
 * The sites available to deploy, or an empty list while the API is absent.
 *
 * Separate from the deployments list on purpose: a workspace with no deployment
 * history may still have sites, and the deploy form should not invent either one.
 */
const getDeployableSites = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }
  return httpClient.get(WORKSPACE_SITES_PATH(workspaceId))
}

const deploymentService = {
  getDeployments,
  getDeployment,
  deploySite,
  redeploy,
  stopDeployment,
  rollbackDeployment,
  getDeployableSites,
}

export default deploymentService
