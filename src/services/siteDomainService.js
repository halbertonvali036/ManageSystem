import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
} from '@/services/httpClient'
import { normalizeDomainStatus } from '@/models/sitePublishing'
import { SITES_API_PATH } from '@/utils/constants'

/**
 * The custom-domain resource of one site.
 *
 * The backend owns everything about a domain — whether one is configured,
 * which DNS records it expects, whether verification passed, when it was last
 * checked — so this service is a thin adapter over exactly four calls:
 *
 *   GET    /api/sites/{id}/domain          current state
 *   PUT    /api/sites/{id}/domain          `{ hostname }` — attach or replace
 *   POST   /api/sites/{id}/domain/verify   re-check DNS for the stored domain
 *   DELETE /api/sites/{id}/domain          detach
 *
 * Every answer goes through `normalizeDomainStatus`, so a response the
 * frontend has never seen degrades to the known-empty state instead of
 * rendering as an unknown one. Nothing here infers a status from a hostname:
 * only the server may say a domain is pending, connected or in error.
 */

/** @param {string} siteId */
export const SITE_DOMAIN_ENDPOINT = (siteId) => `${SITES_API_PATH}/${siteId}/domain`

/** @param {string} siteId */
export const VERIFY_DOMAIN_ENDPOINT = (siteId) => `${SITE_DOMAIN_ENDPOINT(siteId)}/verify`

export const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

/**
 * Reads the stored state of a site's domain.
 *
 * Resolves `null` only without a backend or site id. Every HTTP failure
 * propagates: only a successful response can establish "unconfigured".
 *
 * @param {string} siteId
 * @returns {Promise<ReturnType<typeof normalizeDomainStatus> | null>}
 */
const getSiteDomain = async (siteId) => {
  if (!isBackendConnected() || !siteId) {
    return null
  }
  const response = await httpClient.get(SITE_DOMAIN_ENDPOINT(siteId))
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid domain response.')
  }
  return normalizeDomainStatus(response)
}

/**
 * Attaches (or replaces) the site's domain.
 *
 * The plan gate answers `403` with `CUSTOM_DOMAIN_NOT_ALLOWED`, and validation
 * answers `400` with `errors.hostname` — both are the backend's decision and
 * are left to propagate with their message intact.
 *
 * @param {string} siteId
 * @param {string} hostname A bare hostname, e.g. `example.com`.
 */
const setSiteDomain = async (siteId, hostname) => {
  requireBackend('Attaching a domain requires the backend to be connected.')
  const response = await httpClient.put(SITE_DOMAIN_ENDPOINT(siteId), {
    hostname: String(hostname ?? '').trim().toLowerCase(),
  })
  return response ? normalizeDomainStatus(response) : null
}

/**
 * Asks the backend to re-check DNS for the domain it already holds.
 *
 * @param {string} siteId
 */
const verifySiteDomain = async (siteId) => {
  requireBackend('Verifying a domain requires the backend to be connected.')
  const response = await httpClient.post(VERIFY_DOMAIN_ENDPOINT(siteId), {})
  return response ? normalizeDomainStatus(response) : null
}

/**
 * Detaches the domain. A `204` has no body, so the result is the empty state
 * rather than an inference.
 *
 * @param {string} siteId
 */
const removeSiteDomain = async (siteId) => {
  requireBackend('Removing a domain requires the backend to be connected.')
  await httpClient.delete(SITE_DOMAIN_ENDPOINT(siteId))
  return normalizeDomainStatus(null)
}

const siteDomainService = {
  SITE_DOMAIN_ENDPOINT,
  VERIFY_DOMAIN_ENDPOINT,
  isBackendConnected,
  getSiteDomain,
  setSiteDomain,
  verifySiteDomain,
  removeSiteDomain,
}

export default siteDomainService
