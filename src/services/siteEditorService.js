import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildEditorDraftPayload,
  normalizeEditorDocument,
} from '@/models/siteEditor'
import { SITES_API_PATH } from '@/utils/constants'

/**
 * Site editor service.
 *
 * There is no draft endpoint on the backend: the editor draft *is* the site's
 * `content` field. Reads and writes therefore use the ordinary site resource:
 *
 *   GET /api/sites/{id}  -> `content` is the stored editor document
 *   PUT /api/sites/{id}  -> `{ projectName, slug, content }` saves it again
 *
 * The update contract requires `projectName`, `slug` and `content` together on
 * every write, so a save echoes the project's current name and address instead
 * of sending a partial body. That is why the loaded site is kept beside the
 * document rather than thrown away.
 *
 * The editor is fully usable offline, so the service follows the same contract
 * as the rest of the app: with no backend it returns "no server document" and
 * refuses every write, which is what stops it from showing "saved" for a
 * document that lives only in browser memory.
 */

/** @param {string} siteId */
export const SITE_RECORD_ENDPOINT = (siteId) => `${SITES_API_PATH}/${siteId}`

export const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

/**
 * A stored `content` value is a real draft only when it carries pages.
 *
 * `null`, `{}` and an array are all "no document yet". Checking before
 * `normalizeEditorDocument` matters because that normalizer always manufactures
 * one empty page, which would look like a server draft and stop the template
 * seed from ever being applied.
 */
const toEditorDocument = (content) => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return null
  }
  if (!Array.isArray(content.pages) || content.pages.length === 0) {
    return null
  }
  return normalizeEditorDocument(content)
}

const readSite = async (siteId) => {
  const site = await httpClient.get(SITE_RECORD_ENDPOINT(siteId))
  return site && typeof site === 'object' ? site : null
}

/**
 * Loads the stored document and the project record it belongs to.
 *
 * Returns `{ document: null, site: null }` when there is no backend. A site that
 * exists but has `content: null` (or an empty object) returns its record with a
 * null document, which the editor treats as "start from the template seed".
 */
const getSiteDraft = async (siteId) => {
  if (!isBackendConnected() || !siteId) {
    return { document: null, site: null }
  }

  const site = await readSite(siteId)
  return {
    document: toEditorDocument(site?.content),
    site,
  }
}

/**
 * Persists the editor document on the site resource.
 *
 * `projectName` and `slug` come from the loaded site, never from the local
 * document, and `content` is the normalised editor document. The body therefore
 * always carries all three required fields.
 */
const saveSiteDraft = async (siteId, document, site = null) => {
  requireBackend(
    'Saving the website draft is unavailable until the backend is connected.',
  )

  const current = site ?? (await readSite(siteId))
  const content = buildEditorDraftPayload(document)

  const response = await httpClient.put(SITE_RECORD_ENDPOINT(siteId), {
    projectName:
      typeof current?.projectName === 'string' ? current.projectName : '',
    slug: typeof current?.slug === 'string' ? current.slug : '',
    content,
  })

  // The saved response is the source of truth; fall back to the body we sent if
  // the server acknowledges the write without echoing `content`.
  return toEditorDocument(response?.content) ?? normalizeEditorDocument(content)
}

const siteEditorService = {
  SITE_RECORD_ENDPOINT,
  isBackendConnected,
  getSiteDraft,
  saveSiteDraft,
}

export default siteEditorService
