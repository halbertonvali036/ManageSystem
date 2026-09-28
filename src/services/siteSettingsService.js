import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildSiteSettingsPayload,
  normalizeSiteSettings,
} from '@/models/siteSettings'
import { SITES_PATH } from '@/utils/constants'

/**
 * Site settings service.
 *
 * The contract is the same one `siteEditorService` uses, and for the same reason:
 * the form is fully usable offline, so a read degrades to "nothing configured yet"
 * and a write refuses to run.
 *
 * That refusal is the point of the file. `updateSiteSettings` is what will
 * eventually persist these values, and while there is no backend it throws rather
 * than resolving. The page therefore cannot reach a "saved" state through this
 * service, which is the only way to guarantee the word never appears without a
 * server having agreed to it.
 */

/** @param {string} siteId */
export const SITE_SETTINGS_ENDPOINT = (siteId) => `${SITES_PATH}/${siteId}/settings`

export const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

/**
 * Loads stored settings for a site.
 *
 * Returns `null` when there is no backend or nothing stored, which the page
 * treats as "start from a local working state" rather than as an error. A stored
 * value is normalised on the way in, so a response from a future API cannot put
 * the form into a shape it does not know how to render.
 */
const getSiteSettings = async (siteId) => {
  if (!isBackendConnected() || !siteId) {
    return null
  }
  return normalizeSiteSettings(await httpClient.get(SITE_SETTINGS_ENDPOINT(siteId)))
}

/**
 * Persists site settings.
 *
 * Throws `BackendNotConnectedError` while the backend is absent. The payload is
 * built by the model so the request body is already the agreed shape.
 */
const updateSiteSettings = async (siteId, settings) => {
  requireBackend(
    'Saving site settings is unavailable until the backend is connected.',
  )
  return normalizeSiteSettings(
    await httpClient.put(SITE_SETTINGS_ENDPOINT(siteId), buildSiteSettingsPayload(settings)),
  )
}

const siteSettingsService = {
  SITE_SETTINGS_ENDPOINT,
  isBackendConnected,
  getSiteSettings,
  updateSiteSettings,
}

export default siteSettingsService
