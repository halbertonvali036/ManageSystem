import { publishSite, unpublishSite, getPublishStatus, getPublishedUrl } from '@/services/sitePublishService'
import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import { SITES_PATH } from '@/utils/constants'
import {
  ALL_SITES_FILTER,
  buildSiteDraft,
  buildSiteRename,
  normalizeSite,
  normalizeSiteStatus,
  SITE_STATUS,
} from '@/models/site'

/**
 * Site project service.
 *
 * Read operations degrade to a safe empty value when the backend is not
 * connected, which is what makes the workspace render honest empty states
 * instead of placeholder projects. Every write operation refuses to run and
 * throws BackendNotConnectedError, so no action can report a change that was
 * never persisted.
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
    query.set('status', normalizeSiteStatus(status))
  }
  if (search.trim()) {
    query.set('search', search.trim())
  }
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const toList = (response) => {
  const items = Array.isArray(response) ? response : (response?.data ?? [])
  return items.map(normalizeSite).filter(Boolean)
}

/** All projects for the signed-in account. Empty while the API is absent. */
const getMySites = async (params = {}) => {
  if (!isBackendConnected()) {
    return []
  }
  return toList(await httpClient.get(`${SITES_PATH}${buildQuery(params)}`))
}

/** A single project, or null when it is absent or the API is not connected. */
const getSite = async (id) => {
  if (!isBackendConnected()) {
    return null
  }
  return normalizeSite(await httpClient.get(`${SITES_PATH}/${id}`))
}

const createSite = async (payload) => {
  requireBackend('Creating a website is unavailable until the backend is connected.')
  return normalizeSite(await httpClient.post(SITES_PATH, buildSiteDraft(payload)))
}

const updateSite = async (id, payload) => {
  requireBackend('Saving website changes is unavailable until the backend is connected.')
  return normalizeSite(await httpClient.put(`${SITES_PATH}/${id}`, payload))
}

/** Narrow rename path so a rename cannot accidentally clear other fields. */
const renameSite = async (id, name) => {
  requireBackend('Renaming a website is unavailable until the backend is connected.')
  return updateSite(id, buildSiteRename({ name }))
}

const deleteSite = async (id) => {
  requireBackend('Deleting a website is unavailable until the backend is connected.')
  await httpClient.delete(`${SITES_PATH}/${id}`)
}

const duplicateSite = async (id) => {
  requireBackend('Duplicating a website is unavailable until the backend is connected.')
  return normalizeSite(await httpClient.post(`${SITES_PATH}/${id}/duplicate`))
}

const archiveSite = async (id) => {
  requireBackend('Archiving a website is unavailable until the backend is connected.')
  return updateSite(id, { status: SITE_STATUS.ARCHIVED })
}

/**
 * Publishing is declared so the project UI can already show the action and its
 * pending state, but it always refuses. It must never report that a site went
 * live while no publishing backend exists.
 */
const siteService = {
  getMySites,
  getSite,
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

export default siteService
