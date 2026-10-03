import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildCapabilityConfigDraft,
  getCapabilityConfigFields,
  isKnownCapability,
  normalizeCapability,
  normalizeCapabilityList,
} from '@/models/capability'

/**
 * Capability service.
 *
 * Follows exactly the same contract as workspaceService and databaseService:
 *  - Read operations return a safe empty value ([] / null) when the backend is not
 *    connected, so the page shows an honest state instead of placeholder modules.
 *  - Every write calls requireBackend() first and throws BackendNotConnectedError,
 *    so no action can report a capability that was never persisted.
 *
 * Nothing here invents state. Enabling a capability is a request, not a local
 * flag: if the backend refuses, the card is unchanged.
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
 * A capability the frontend cannot describe or configure has no business being
 * switched on, so the request never leaves the browser.
 */
const requireKnownCapability = (id) => {
  if (!isKnownCapability(id)) {
    throw new Error(`Unknown capability: ${id}`)
  }
}

const CAPABILITIES_API_PATH = (workspaceId) =>
  `/workspaces/${workspaceId}/capabilities`

const CAPABILITY_API_PATH = (workspaceId, id) =>
  `${CAPABILITIES_API_PATH(workspaceId)}/${id}`

/** Every capability configured for a workspace. Empty while the API is absent. */
const getCapabilities = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }
  return normalizeCapabilityList(await httpClient.get(CAPABILITIES_API_PATH(workspaceId)))
}

/**
 * One capability, or null when absent, unknown to the catalog, or the API is not
 * connected. An id the catalog does not declare is never shown.
 */
const getCapability = async (workspaceId, id) => {
  if (!isBackendConnected() || !workspaceId || !id || !isKnownCapability(id)) {
    return null
  }
  return normalizeCapability(await httpClient.get(CAPABILITY_API_PATH(workspaceId, id)))
}

/**
 * Switches a capability on. Refused until a backend is available.
 * The only body is the flag: the backend owns the resulting state.
 */
const enableCapability = async (workspaceId, id) => {
  requireKnownCapability(id)
  requireBackend(
    'Enabling a capability is unavailable until the backend is connected.'
  )
  return normalizeCapability(
    await httpClient.post(`${CAPABILITY_API_PATH(workspaceId, id)}/enable`)
  )
}

/** Switches a capability off. Refused until a backend is available. */
const disableCapability = async (workspaceId, id) => {
  requireKnownCapability(id)
  requireBackend(
    'Disabling a capability is unavailable until the backend is connected.'
  )
  return normalizeCapability(
    await httpClient.post(`${CAPABILITY_API_PATH(workspaceId, id)}/disable`)
  )
}

/**
 * Saves the settings form. Refused until a backend is available.
 *
 * `inputs` are raw form values; they are validated against the catalog's declared
 * config fields here, so an unknown key or an option outside the declared list can
 * never be sent. `config` is the validated, unknown-key-free payload.
 */
const updateCapabilityConfig = async (workspaceId, id, inputs) => {
  requireKnownCapability(id)
  requireBackend(
    'Saving capability settings is unavailable until the backend is connected.'
  )

  const draft = buildCapabilityConfigDraft(inputs, getCapabilityConfigFields(id))
  if (!draft.isValid) {
    throw new Error('The capability settings are not valid.')
  }

  return normalizeCapability(
    await httpClient.put(CAPABILITY_API_PATH(workspaceId, id), { config: draft.config })
  )
}

const capabilityService = {
  getCapabilities,
  getCapability,
  enableCapability,
  disableCapability,
  updateCapabilityConfig,
}

export default capabilityService
