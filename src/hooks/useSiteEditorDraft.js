import { useCallback, useEffect, useState } from 'react'
import siteEditorService from '@/services/siteEditorService'
import { getRememberedDemoDraft, rememberDemoDraft } from '@/services/demoDraftStore'
import {
  forgetPendingDraftSeed,
  takePendingDraftSeed,
} from '@/services/pendingDraftSeedStore'
import { BackendNotConnectedError } from '@/services/httpClient'
import { buildSiteSeedDocument } from '@/models/siteSeed'
import useTranslation from '@/hooks/useTranslation'

/**
 * Save states. There is deliberately no "saved" state that can be reached
 * without a backend: `clean` only appears for a document nothing has touched.
 */
export const SAVE_STATUS = {
  CLEAN: 'clean',
  UNSAVED: 'unsaved',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
}

/**
 * Owns the editor's draft document and its save state.
 *
 * The draft lives in component state, shaped as page -> section -> block. Save
 * is wired to the service contract and refuses to claim success, because
 * `saveSiteDraft` throws while the backend is absent. The status pill and the
 * note under the canvas both say so in the visitor's language.
 *
 * The initial document is created lazily, once per mount: the editor is
 * remounted per `siteId`, and rebuilding it on every render would discard edits.
 */
export default function useSiteEditorDraft(siteId, seed) {
  const { t } = useTranslation()

  const [document, setDocument] = useState(() => {
    /*
     * The create wizard stores its draft seed in memory before navigating to the
     * local editor. Location state remains the primary source; the remembered
     * copy covers a remount inside the same tab.
     */
    const remembered = seed ? null : getRememberedDemoDraft(siteId)
    if (remembered?.pages) {
      return remembered
    }
    const effectiveSeed = seed ?? remembered
    return buildSiteSeedDocument({
      name: effectiveSeed?.name,
      templateId: effectiveSeed?.templateId,
      themePresetId: effectiveSeed?.themePresetId,
      content: effectiveSeed?.content,
      t,
    })
  })
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.UNSAVED)
  const [draftLoading, setDraftLoading] = useState(true)
  const [draftError, setDraftError] = useState(false)
  useEffect(() => {
    let active = true
    siteEditorService.getSiteDraft(siteId).then(draft => {
      if (!active) return
      if (draft) {
        setDocument(draft)
        setSaveStatus(draft.isLocalDraft ? SAVE_STATUS.UNSAVED : SAVE_STATUS.CLEAN)
        /*
         * The server already has a draft, so a seed waiting from a failed create
         * write is stale. Drop it rather than letting it surface on a later visit.
         */
        forgetPendingDraftSeed(siteId)
        return
      }
      /*
       * No server draft: consume a seed saved by the create flow. `take` removes
       * it, so it can personalise exactly one editor visit and never linger as a
       * second source of truth.
       */
      const pendingSeed = takePendingDraftSeed(siteId)
      if (pendingSeed) {
        setDocument({ ...pendingSeed, siteId, isLocalDraft: true })
        setSaveStatus(SAVE_STATUS.UNSAVED)
      }
    }).catch(() => { if (active) setDraftError(true) })
      .finally(() => { if (active) setDraftLoading(false) })
    return () => { active = false }
  }, [siteId])

  // A local draft is the only thing this remembers; API-backed drafts stay on
  // the server contract and never travel through browser memory.
  useEffect(() => {
    if (siteId === 'local-draft' && !draftLoading && !draftError) {
      rememberDemoDraft(siteId, document)
    }
  }, [siteId, document, draftLoading, draftError])

  /** Every local edit marks the document as unsaved. */
  const applyEdit = useCallback((updater) => {
    setDocument((current) => updater(current))
    setSaveStatus(SAVE_STATUS.UNSAVED)
  }, [])

  const handleSave = useCallback(async () => {
    setSaveStatus(SAVE_STATUS.UNSAVED)
    try {
      await siteEditorService.saveSiteDraft(siteId, document)
      setSaveStatus(SAVE_STATUS.CLEAN)
    } catch (error) {
      setSaveStatus(
        error instanceof BackendNotConnectedError
          ? SAVE_STATUS.UNAVAILABLE
          : SAVE_STATUS.ERROR,
      )
    }
  }, [document, siteId])

  return {
    document,
    setDocument,
    saveStatus,
    setSaveStatus,
    draftLoading,
    draftError,
    applyEdit,
    handleSave,
  }
}
