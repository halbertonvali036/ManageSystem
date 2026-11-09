import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
  isEndpointUnavailable,
} from '@/services/httpClient'
import { normalizeSiteSettings } from '@/models/siteSettings'
import siteService from '@/services/siteService'
import { SITES_PATH } from '@/utils/constants'

/**
 * Site settings service.
 *
 * The backend does not expose a dedicated settings resource yet. The path is
 * kept for the planned read, but the only write the current API understands is
 * the ordinary site update:
 *
 *   PUT /api/sites/{id}  body `{ projectName, slug, content }`
 *
 * `projectName`, `slug` and `content` must always be sent together. The save
 * therefore echoes the project's current name/address and full editor document;
 * changing the name can never wipe the content or trip required-field
 * validation.
 *
 * A `404`/`403`/`405` from the unimplemented settings read is not an error: it
 * returns `null`, exactly like "nothing configured yet", so the page renders its
 * existing local/unavailable state.
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
 * Returns `null` when there is no backend, nothing is stored, or the backend has
 * not implemented the settings resource. A stored value is normalised on the
 * way in, so a response from a future API cannot put the form into a shape it
 * does not know how to render.
 */
const getSiteSettings = async (siteId) => {
  if (!isBackendConnected() || !siteId) {
    return null
  }
  try {
    const response = await httpClient.get(SITE_SETTINGS_ENDPOINT(siteId))
    return response ? normalizeSiteSettings(response) : null
  } catch (error) {
    if (isEndpointUnavailable(error)) {
      return null
    }
    throw error
  }
}

/**
 * Persists the settings that the current backend can actually store.
 *
 * The settings form edits the project name; the slug and the editor document
 * are read from the loaded site and sent back unchanged. The rest of the
 * settings object is local-only until a settings endpoint exists, so it is not
 * sent as a partial body that would be rejected or (worse) stored alone.
 *
 * @param {string} siteId
 * @param {{ general?: { name?: string } }} settings
 * @param {object|null} [site] The normalised site loaded with the form.
 */
const updateSiteSettings = async (siteId, settings, site = null) => {
  requireBackend(
    'Saving site settings is unavailable until the backend is connected.',
  )

  const current = site ?? (await siteService.getSite(siteId))
  if (!current) {
    throw new BackendNotConnectedError(
      'The site could not be loaded, so its settings cannot be saved.',
    )
  }

  const projectName =
    typeof settings?.general?.name === 'string'
      ? settings.general.name.trim()
      : ''

  return siteService.updateSite(siteId, {
    name: projectName || current.name,
    slug: current.slug,
    content: current.content,
  })
}

const siteSettingsService = {
  SITE_SETTINGS_ENDPOINT,
  isBackendConnected,
  getSiteSettings,
  updateSiteSettings,
}

export default siteSettingsService
