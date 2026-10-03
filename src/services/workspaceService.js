import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildWorkspaceDraft,
  normalizeWorkspace,
} from '@/models/workspace'
import { normalizeSite } from '@/models/site'
import { ALL_SITES_FILTER, normalizeSiteStatus } from '@/models/site'

/**
 * Workspace service.
 *
 * Follows exactly the same pattern as siteService:
 *  - Read operations return a safe empty value ([] / null) when the backend is
 *    not connected — so the workspace list shows an honest empty state instead
 *    of placeholder data.
 *  - Every write operation calls requireBackend() first, which throws
 *    BackendNotConnectedError when no API is configured, so no action can
 *    report a change that was never persisted.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

const WORKSPACES_API_PATH = '/workspaces'

const toWorkspaceList = (response) => {
  const items = Array.isArray(response) ? response : (response?.data ?? [])
  return items.map(normalizeWorkspace).filter(Boolean)
}

const toSiteList = (response) => {
  const items = Array.isArray(response) ? response : (response?.data ?? [])
  return items.map(normalizeSite).filter(Boolean)
}

const buildSiteQuery = ({ status = ALL_SITES_FILTER, search = '' } = {}) => {
  const query = new URLSearchParams()
  if (status && status !== ALL_SITES_FILTER) {
    query.set('status', normalizeSiteStatus(status))
  }
  if (search.trim()) {
    query.set('search', search.trim())
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

/** All workspaces for the signed-in account. Empty while the API is absent. */
const getWorkspaces = async () => {
  if (!isBackendConnected()) {
    return []
  }
  return toWorkspaceList(await httpClient.get(WORKSPACES_API_PATH))
}

/** A single workspace, or null when absent or the API is not connected. */
const getWorkspace = async (id) => {
  if (!isBackendConnected()) {
    return null
  }
  return normalizeWorkspace(
    await httpClient.get(`${WORKSPACES_API_PATH}/${id}`)
  )
}

/** Creates a workspace. Refused until a backend is available. */
const createWorkspace = async (payload) => {
  requireBackend(
    'Creating a workspace is unavailable until the backend is connected.'
  )
  return normalizeWorkspace(
    await httpClient.post(WORKSPACES_API_PATH, buildWorkspaceDraft(payload))
  )
}

/** Updates workspace metadata. Refused until a backend is available. */
const updateWorkspace = async (id, payload) => {
  requireBackend(
    'Saving workspace changes is unavailable until the backend is connected.'
  )
  return normalizeWorkspace(
    await httpClient.put(`${WORKSPACES_API_PATH}/${id}`, payload)
  )
}

/** Deletes a workspace permanently. Refused until a backend is available. */
const deleteWorkspace = async (id) => {
  requireBackend(
    'Deleting a workspace is unavailable until the backend is connected.'
  )
  await httpClient.delete(`${WORKSPACES_API_PATH}/${id}`)
}

/**
 * All sites inside a workspace.
 * Accepts the same filter params as siteService.getMySites().
 * Returns [] while the API is absent.
 */
const getWorkspaceSites = async (workspaceId, params = {}) => {
  if (!isBackendConnected()) {
    return []
  }
  const path = `${WORKSPACES_API_PATH}/${workspaceId}/sites${buildSiteQuery(params)}`
  return toSiteList(await httpClient.get(path))
}

/**
 * Creates a site inside a specific workspace.
 * Refused until a backend is available.
 */
const createWorkspaceSite = async (workspaceId, payload) => {
  requireBackend(
    'Creating a site is unavailable until the backend is connected.'
  )
  return normalizeSite(
    await httpClient.post(
      `${WORKSPACES_API_PATH}/${workspaceId}/sites`,
      payload
    )
  )
}

const workspaceService = {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceSites,
  createWorkspaceSite,
}

export default workspaceService
