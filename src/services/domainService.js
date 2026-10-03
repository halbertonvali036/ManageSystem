import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import { buildDomainDraft, isKnownDomainType, normalizeDomain, normalizeDomainList } from '@/models/domain'

/**
 * Domain service.
 *
 * Follows the same contract as workspaceService, capabilityService and
 * integrationService:
 *  - Read operations return a safe empty value ([] / null) when the backend is not
 *    connected, so the page shows an honest state instead of a seeded domain.
 *  - Every write calls requireBackend() first and throws BackendNotConnectedError,
 *    so nothing here can report a domain as verified or connected that never was.
 *
 * Nothing here resolves a hostname, checks a DNS record or issues a certificate.
 * `verifyDomain` is a request the backend fulfils; if it refuses or the records have
 * not propagated, the domain stays exactly as the backend reported it.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

const DOMAINS_API_PATH = (workspaceId) => `/workspaces/${workspaceId}/domains`

const DOMAIN_API_PATH = (workspaceId, domainId) => `${DOMAINS_API_PATH(workspaceId)}/${domainId}`

/** Every domain the backend reports for a workspace. Empty while the API is absent. */
const getDomains = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }
  return normalizeDomainList(await httpClient.get(DOMAINS_API_PATH(workspaceId)))
}

/**
 * One domain, or null when absent or the API is not connected.
 *
 * Unlike an integration, a domain is not a fixed catalog entry, so there is no
 * "unknown id" list to check against: the backend simply returns nothing.
 */
const getDomain = async (domainId, workspaceId) => {
  if (!isBackendConnected() || !workspaceId || !domainId) {
    return null
  }
  return normalizeDomain(await httpClient.get(DOMAIN_API_PATH(workspaceId, domainId)))
}

/**
 * Registers a hostname with the backend. Refused until a backend is available.
 *
 * The hostname is validated for shape here so an obviously malformed value never
 * leaves the browser, and a name already in the list is rejected before the round
 * trip. Neither check proves the customer owns the name — the backend decides that,
 * and it is the backend that decides the resulting state.
 */
const addDomain = async (hostname, workspaceId, { siteId = null } = {}) => {
  requireBackend('Adding a domain is unavailable until the backend is connected.')

  const draft = buildDomainDraft({ hostname })
  if (!draft.isValid) {
    throw new Error('The domain name is not valid.')
  }

  return normalizeDomain(
    await httpClient.post(DOMAINS_API_PATH(workspaceId), {
      hostname: draft.hostname,
      ...(siteId ? { siteId } : {}),
    })
  )
}

/**
 * Asks the backend to check a domain's DNS records. Refused until one is available.
 *
 * This never marks anything verified. The backend resolves the records and reports
 * the outcome; a failed check comes back as an `error` domain carrying the backend's
 * own reason.
 */
const verifyDomain = async (domainId, workspaceId) => {
  requireBackend('Verifying a domain is unavailable until the backend is connected.')

  return normalizeDomain(
    await httpClient.post(`${DOMAIN_API_PATH(workspaceId, domainId)}/verify`)
  )
}

/** Asks the backend to remove a domain. Refused until a backend is available. */
const removeDomain = async (domainId, workspaceId) => {
  requireBackend('Removing a domain is unavailable until the backend is connected.')

  return normalizeDomain(
    await httpClient.delete(DOMAIN_API_PATH(workspaceId, domainId))
  )
}

/**
 * Asks the backend to make a domain the primary one. Refused until one is available.
 *
 * The backend owns which name a site answers on. This does not reorder the local
 * list optimistically, so the list never shows a different primary domain from the
 * one the backend has on record.
 */
const setPrimaryDomain = async (domainId, workspaceId) => {
  requireBackend('Changing the primary domain is unavailable until the backend is connected.')

  return normalizeDomain(
    await httpClient.post(`${DOMAIN_API_PATH(workspaceId, domainId)}/primary`)
  )
}

const domainService = {
  getDomains,
  getDomain,
  addDomain,
  verifyDomain,
  removeDomain,
  setPrimaryDomain,
  /** Re-exported so the add-domain form can validate without importing the model. */
  isKnownDomainType,
}

export default domainService
