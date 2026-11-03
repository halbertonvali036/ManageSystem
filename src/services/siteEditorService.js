import config from '@/config'
import httpClient, { BackendNotConnectedError, ERROR_CODE, getRequestErrorCode } from '@/services/httpClient'
import {
  buildEditorDraftPayload,
  normalizeEditorDocument,
} from '@/models/siteEditor'
import { SITES_PATH } from '@/utils/constants'

/**
 * Site editor draft service.
 *
 * The editor is fully usable offline, so this service follows the same contract
 * as the rest of the app: reads degrade to a safe empty value when the backend
 * is absent, and every write refuses to run and throws
 * `BackendNotConnectedError`.
 *
 * That refusal is the important part. It is what stops the editor from ever
 * showing "saved" for a draft that exists only in browser memory.
 */

/** @param {string} siteId */
export const EDITOR_DRAFT_ENDPOINT = (siteId) => `${SITES_PATH}/${siteId}/draft`

export const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

/**
 * Loads the stored draft for a site.
 *
 * Returns `null` when there is no backend or no draft yet, which the editor
 * treats as "start from a local working state" rather than an error.
 */
const getSiteDraft = async (siteId) => {
  if (!isBackendConnected() || !siteId) {
    return null
  }
  try {
    const response = await httpClient.get(EDITOR_DRAFT_ENDPOINT(siteId))
    // A 204 response is a real "no draft yet", not an empty document.
    return response ? normalizeEditorDocument(response) : null
  } catch (error) {
    /*
     * Some backends answer "this project has no draft" with 404. The caller
     * already treats null as that state, so a missing draft must not become an
     * editor error page.
     */
    if (getRequestErrorCode(error) === ERROR_CODE.NOT_FOUND) {
      return null
    }
    throw error
  }
}

/**
 * Persists the editor document.
 *
 * The payload is normalised by the model before it leaves, so the future API
 * contract is already fixed. Without a backend this always throws, and the
 * editor surfaces that as "backend not connected" instead of a success message.
 */
const saveSiteDraft = async (siteId, document) => {
  requireBackend(
    'Saving the website draft is unavailable until the backend is connected.',
  )
  return normalizeEditorDocument(
    await httpClient.put(EDITOR_DRAFT_ENDPOINT(siteId), buildEditorDraftPayload(document)),
  )
}

const siteEditorService = {
  EDITOR_DRAFT_ENDPOINT,
  isBackendConnected,
  getSiteDraft,
  saveSiteDraft,
}

export default siteEditorService
