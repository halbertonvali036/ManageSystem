import config from '@/config'
import httpClient from '@/services/httpClient'
import { TEMPLATES_API_PATH } from '@/utils/constants'
import { normalizeTemplateResponse } from '@/models/siteWire'
import {
  resolveBackendTemplateId as resolveBackendTemplateIdFromCatalog,
  resolveFrontendTemplateId,
} from '@/models/templateCatalog'

/**
 * Backend template catalogue.
 *
 * The catalogue is session-scoped: the first read is cached and the Templates
 * page and the create wizard share it, so opening the wizard from a card does
 * not issue a second request. Logout clears the cache.
 *
 * A failed read is not cached, so the next visit can retry. An empty catalogue
 * *is* cached: the server answered successfully with no templates, and repeating
 * that request on every render would not change the answer.
 */

let cachedTemplates = null
let inflightRequest = null

export const isBackendConnected = () => Boolean(config.api.baseUrl)

const toTemplateList = (response) => {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : []
  return items.map(normalizeTemplateResponse).filter(Boolean)
}

/**
 * The normalized backend templates, or an empty list when no backend is
 * connected. Rejects with the HTTP error when the request itself fails; callers
 * treat that as "catalogue unavailable" instead of pretending it is empty.
 *
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<Array<object>>}
 */
export const listTemplates = async ({ force = false } = {}) => {
  if (!isBackendConnected()) {
    return []
  }

  if (!force && cachedTemplates !== null) {
    return cachedTemplates
  }

  if (inflightRequest) {
    return inflightRequest
  }

  inflightRequest = httpClient
    .get(TEMPLATES_API_PATH)
    .then((response) => {
      cachedTemplates = toTemplateList(response)
      return cachedTemplates
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

/** The catalogue already loaded in this session, or an empty list. */
export const getCachedTemplates = () => cachedTemplates ?? []

/** Clears the session cache. Called on logout and by an explicit retry. */
export const clearTemplateCache = () => {
  cachedTemplates = null
  inflightRequest = null
}

/**
 * The backend id for a frontend template id.
 *
 * Throws nothing: an unmapped or not-yet-loaded template returns null. Callers
 * that write must treat null as "cannot create" rather than sending it.
 *
 * @param {string|number|object} frontendId
 * @returns {number|null}
 */
export const resolveBackendTemplateId = (frontendId) =>
  resolveBackendTemplateIdFromCatalog(frontendId, getCachedTemplates())

/** The backend template currently matched to a frontend template id, or null. */
export const getBackendTemplate = (frontendId) =>
  getCachedTemplates().find((template) => template.templateId === frontendId) ?? null

const templateService = {
  clearTemplateCache,
  getBackendTemplate,
  getCachedTemplates,
  isBackendConnected,
  listTemplates,
  resolveBackendTemplateId,
  resolveFrontendTemplateId,
}

export { resolveFrontendTemplateId }

export default templateService
