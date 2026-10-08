import { getDemoSession } from '@/services/demoSession'
import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
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
  const demo = getDemoSession()
  const site = demo?.sites.find(item => item.id === siteId)
  if (site) {
    if (!demo.documents[siteId]) {
      const { createDemoWebsite } = await import('@/models/demoWebsite')
      demo.documents[siteId] ??= createDemoWebsite(site)
    }
    return normalizeEditorDocument(demo.documents[siteId])
  }
  if (!isBackendConnected() || !siteId) {
    return null
  }
  return normalizeEditorDocument(await httpClient.get(EDITOR_DRAFT_ENDPOINT(siteId)))
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
