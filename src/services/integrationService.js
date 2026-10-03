import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildIntegrationConfigDraft,
  getIntegrationConfigFields,
  isKnownIntegration,
  normalizeIntegration,
  normalizeIntegrationList,
} from '@/models/integration'

/**
 * Integration service.
 *
 * Follows the same contract as workspaceService, databaseService and
 * capabilityService:
 *  - Read operations return a safe empty value ([] / null) when the backend is not
 *    connected, so the page shows an honest state instead of placeholder services.
 *  - Every write calls requireBackend() first and throws BackendNotConnectedError,
 *    so nothing here can report a service as connected that was never connected.
 *
 * Nothing here performs a handshake or holds a credential. Connecting is a request
 * the backend fulfils; if it refuses, the card is unchanged.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

/**
 * Refuses an id the catalog does not declare.
 *
 * A service the frontend cannot describe or configure has no business being
 * connected, so the request never leaves the browser.
 */
const requireKnownIntegration = (id) => {
  if (!isKnownIntegration(id)) {
    throw new Error(`Unknown integration: ${id}`)
  }
}

const INTEGRATIONS_API_PATH = (workspaceId) => `/workspaces/${workspaceId}/integrations`

const INTEGRATION_API_PATH = (workspaceId, id) =>
  `${INTEGRATIONS_API_PATH(workspaceId)}/${id}`

/** Every integration configured for a workspace. Empty while the API is absent. */
const getIntegrations = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }
  return normalizeIntegrationList(await httpClient.get(INTEGRATIONS_API_PATH(workspaceId)))
}

/**
 * One integration, or null when absent, unknown to the catalog, or the API is not
 * connected. An id the catalog does not declare is never shown.
 */
const getIntegration = async (id, workspaceId) => {
  if (!isBackendConnected() || !workspaceId || !id || !isKnownIntegration(id)) {
    return null
  }
  return normalizeIntegration(
    await httpClient.get(INTEGRATION_API_PATH(workspaceId, id))
  )
}

/**
 * Asks the backend to connect a service. Refused until a backend is available.
 *
 * `inputs` are raw form values validated against the catalog's declared config
 * fields here, so an unknown key or an out-of-range option can never be sent. The
 * backend owns the connection and reports the resulting state; this method only
 * requests it.
 */
const connectIntegration = async (id, workspaceId, inputs = {}) => {
  requireKnownIntegration(id)
  requireBackend(
    'Connecting an integration is unavailable until the backend is connected.'
  )

  const draft = buildIntegrationConfigDraft(
    inputs,
    getIntegrationConfigFields(id)
  )
  if (!draft.isValid) {
    throw new Error('The integration settings are not valid.')
  }

  return normalizeIntegration(
    await httpClient.post(INTEGRATION_API_PATH(workspaceId, id) + '/connect', {
      config: draft.config,
    })
  )
}

/** Asks the backend to disconnect a service. Refused until a backend is available. */
const disconnectIntegration = async (id, workspaceId) => {
  requireKnownIntegration(id)
  requireBackend(
    'Disconnecting an integration is unavailable until the backend is connected.'
  )

  return normalizeIntegration(
    await httpClient.post(INTEGRATION_API_PATH(workspaceId, id) + '/disconnect')
  )
}

/**
 * Saves the settings form. Refused until a backend is available.
 *
 * Validation happens here so an unknown key or an option outside the declared list
 * can never be sent, and so a write-only secret is only transmitted when the user
 * actually typed a new value.
 */
const updateIntegrationConfig = async (id, workspaceId, inputs = {}) => {
  requireKnownIntegration(id)
  requireBackend(
    'Saving integration settings is unavailable until the backend is connected.'
  )

  const draft = buildIntegrationConfigDraft(
    inputs,
    getIntegrationConfigFields(id)
  )
  if (!draft.isValid) {
    throw new Error('The integration settings are not valid.')
  }

  return normalizeIntegration(
    await httpClient.put(INTEGRATION_API_PATH(workspaceId, id), {
      config: draft.config,
    })
  )
}

const integrationService = {
  getIntegrations,
  getIntegration,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationConfig,
}

export default integrationService
