import { publishSite, unpublishSite, getPublishStatus, getPublishedUrl } from '@/services/sitePublishService'
import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
  isEndpointUnavailable,
  RequestError,
} from '@/services/httpClient'
import templateService from '@/services/templateService'
import { SITES_API_PATH } from '@/utils/constants'
import {
  ALL_SITES_FILTER,
  SITE_STATUS,
} from '@/models/site'
import {
  normalizeSiteResponse,
  normalizeSiteSummary,
  normalizeTemplateResponse,
  toCreateSitePayload,
  toUpdateSitePayload,
  toWireSiteStatus,
} from '@/models/siteWire'

/**
 * Site project service.
 *
 * Read operations degrade to a safe empty value when the backend is not
 * connected, which is what makes the site list render honest empty states
 * instead of placeholder projects. Every write operation refuses to run and
 * throws BackendNotConnectedError, so no action can report a change that was
 * never persisted.
 *
 * Field names and letter casing are translated only in `models/siteWire.js`.
 * This file decides *when* to call the API; the wire model decides *what* the
 * request and response look like.
 *
 * The messages below are developer-facing context for the error. User-facing
 * copy is chosen by the page from the error type, so it stays localizable.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

/**
 * @param {string} message Shown to the user when the action is attempted.
 */
const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

const buildQuery = ({ status = ALL_SITES_FILTER, search = '' } = {}) => {
  const query = new URLSearchParams()
  if (status && status !== ALL_SITES_FILTER) {
    query.set('status', toWireSiteStatus(status))
  }
  if (search.trim()) {
    query.set('search', search.trim())
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const toList = (response) => {
  const items = Array.isArray(response) ? response : (response?.data ?? [])
  return items.map(normalizeSiteSummary).filter(Boolean)
}

/** All projects for the signed-in account. Empty while the API is absent. */
const getMySites = async (params = {}) => {
  if (!isBackendConnected()) {
    return []
  }
  return toList(await httpClient.get(`${SITES_API_PATH}${buildQuery(params)}`))
}

/** A single project, or null when it is absent or the API is not connected. */
const getSite = async (id) => {
  if (!isBackendConnected()) {
    return null
  }
  return normalizeSiteResponse(await httpClient.get(`${SITES_API_PATH}/${id}`))
}

/**
 * The backend template catalogue.
 *
 * Delegates to `templateService`, which caches the catalogue for the session.
 * The method stays here because existing callers already import it from the
 * site service.
 */
const getTemplates = async () => templateService.listTemplates()

/**
 * A template id that can safely be sent on a write, or null.
 *
 * A write must never guess: an unmapped frontend id means the server does not
 * have that template yet, so the caller gets a specific error instead of a
 * payload with a made-up id.
 */
const TEMPLATE_UNAVAILABLE_CODE = 'TEMPLATE_UNAVAILABLE'

const resolveTemplateIdForWrite = (source) =>
  templateService.resolveBackendTemplateId(source)

const createSite = async (draft, options = {}) => {
  requireBackend('Creating a website is unavailable until the backend is connected.')

  // The catalogue is what turns the wizard's frontend id into a backend id.
  // Reading it first also makes a catalogue failure surface as a failed create
  // rather than as an invalid template id.
  await templateService.listTemplates()

  /*
   * `options.content` is the full personalized editor document. `POST
   * /api/sites` stores it, so there is no follow-up draft request.
   */
  const payload = toCreateSitePayload(draft, {
    resolveTemplateId: resolveTemplateIdForWrite,
    ...options,
  })

  if (payload.templateId === null) {
    throw new RequestError(
      'The selected template is not available on the server yet.',
      { code: TEMPLATE_UNAVAILABLE_CODE },
    )
  }

  return normalizeSiteResponse(await httpClient.post(SITES_API_PATH, payload))
}

const updateSite = async (id, site, options) => {
  requireBackend('Saving website changes is unavailable until the backend is connected.')
  return normalizeSiteResponse(
    await httpClient.put(
      `${SITES_API_PATH}/${id}`,
      toUpdateSitePayload(site, {
        resolveTemplateId: resolveTemplateIdForWrite,
        ...options,
      }),
    ),
  )
}

/**
 * Narrow rename path so a rename cannot accidentally clear other fields.
 *
 * The update contract requires `projectName`, `slug` and `content` together, so
 * the current project is read first and only the name is replaced. The other
 * values are sent back unchanged.
 */
const renameSite = async (id, name) => {
  requireBackend('Renaming a website is unavailable until the backend is connected.')
  const current = await getSite(id)
  return updateSite(id, { ...(current ?? {}), name })
}

const deleteSite = async (id) => {
  requireBackend('Deleting a website is unavailable until the backend is connected.')
  await httpClient.delete(`${SITES_API_PATH}/${id}`)
}

const duplicateSite = async (id) => {
  requireBackend('Duplicating a website is unavailable until the backend is connected.')
  try {
    return normalizeSiteResponse(
      await httpClient.post(`${SITES_API_PATH}/${id}/duplicate`),
    )
  } catch (error) {
    /*
     * The duplicate endpoint is not implemented yet. A 404/403/405 is the same
     * refusal as "no backend", so the existing unavailable state is shown
     * instead of a generic request error.
     */
    if (isEndpointUnavailable(error)) {
      throw new BackendNotConnectedError(
        'Duplicating a website is unavailable until the backend implements it.',
      )
    }
    throw error
  }
}

const archiveSite = async (id) => {
  requireBackend('Archiving a website is unavailable until the backend is connected.')
  const current = await getSite(id)
  return updateSite(id, { ...(current ?? {}), status: SITE_STATUS.ARCHIVED })
}

/**
 * Publishing is declared so the project UI can already show the action and its
 * pending state, but it always refuses. It must never report that a site went
 * live while no publishing backend exists.
 */
const siteService = {
  getMySites,
  getSite,
  getTemplates,
  createSite,
  updateSite,
  renameSite,
  deleteSite,
  duplicateSite,
  archiveSite,
  publishSite,
  unpublishSite,
  getPublishStatus,
  getPublishedUrl,
}

export {
  TEMPLATE_UNAVAILABLE_CODE,
  normalizeSiteResponse,
  normalizeSiteSummary,
  normalizeTemplateResponse,
  toCreateSitePayload,
  toUpdateSitePayload,
}

export default siteService
