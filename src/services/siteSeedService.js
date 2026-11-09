import { buildSiteSeedDocument } from '@/models/siteSeed'
import { rememberDemoDraft } from '@/services/demoDraftStore'
import { rememberPendingDraftSeed } from '@/services/pendingDraftSeedStore'
import siteEditorService from '@/services/siteEditorService'

/**
 * Seeds the first draft after a project is created.
 *
 * `POST /api/sites` already stores the full personalized editor document as
 * `content`, so a real backend must not receive a second `PUT` draft write. The
 * document is still remembered locally as a one-shot fallback: if the editor
 * cannot load a server draft, it consumes the remembered document so the site
 * opens personalized instead of on sample copy.
 *
 * Without a backend the same document goes into the demo draft store, which is
 * the local editor's offline path.
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
  document,
  t,
} = {}) => {
  if (!siteId) {
    return { status: SEED_STATUS.SKIPPED, document: null }
  }

  const draftDocument =
    document ??
    buildSiteSeedDocument({
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
    rememberDemoDraft(siteId, draftDocument)
    return { status: SEED_STATUS.DEMO, document: draftDocument }
  }

  /*
   * The create response already persisted this document. Remembering it locally
   * is the offline fallback only: the editor drops it as soon as the server
   * reports a draft of its own.
   */
  rememberPendingDraftSeed(siteId, { ...draftDocument, siteId })
  return { status: SEED_STATUS.SAVED, document: draftDocument }
}

export default seedCreatedSite
