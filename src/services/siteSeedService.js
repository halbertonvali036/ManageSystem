import { buildSiteSeedDocument } from '@/models/siteSeed'
import { rememberDemoDraft } from '@/services/demoDraftStore'
import { rememberPendingDraftSeed } from '@/services/pendingDraftSeedStore'
import siteEditorService from '@/services/siteEditorService'
import { ERROR_CODE, getRequestErrorCode } from '@/services/httpClient'

/**
 * Seeds the first draft after a project is created.
 *
 * The project must still be created even when this write fails: the visitor has
 * already paid the cost of filling the wizard, and a draft-save problem should
 * not turn into a failed creation. Every outcome is reported so the page can
 * choose the right notice.
 */
export const SEED_STATUS = Object.freeze({
  SAVED: 'saved',
  PENDING: 'pending',
  DEMO: 'demo',
  AUTH_EXPIRED: 'auth-expired',
  SKIPPED: 'skipped',
})

export const seedCreatedSite = async ({
  siteId,
  name,
  templateId,
  themePresetId,
  content,
  t,
} = {}) => {
  if (!siteId) {
    return { status: SEED_STATUS.SKIPPED, document: null }
  }

  const document = buildSiteSeedDocument({
    siteId,
    name,
    templateId,
    themePresetId,
    content,
    t,
  })

  if (!siteEditorService.isBackendConnected()) {
    // The offline/demo editor is the only client that can open a draft without
    // an API. Its draft store is session memory, so it behaves like the local
    // editor route: personalised, unsaved, and gone with the tab.
    rememberDemoDraft(siteId, document)
    return { status: SEED_STATUS.DEMO, document }
  }

  try {
    await siteEditorService.saveSiteDraft(siteId, document)
    return { status: SEED_STATUS.SAVED, document }
  } catch (error) {
    /*
     * A 401 is already being handled by the auth layer: the stored session is
     * cleared and the app redirects to the expired-session page. Do not queue a
     * seed or navigate as if creation finished normally.
     */
    if (getRequestErrorCode(error) === ERROR_CODE.UNAUTHORIZED) {
      return { status: SEED_STATUS.AUTH_EXPIRED, document, error }
    }

    rememberPendingDraftSeed(siteId, document)
    return { status: SEED_STATUS.PENDING, document, error }
  }
}

export default seedCreatedSite
