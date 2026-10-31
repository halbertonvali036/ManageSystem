import { useCallback, useEffect, useState } from 'react'
import siteEditorService from '@/services/siteEditorService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { createLocalDraftDocument } from '@/models/siteEditor'
import { getTemplatePageSkeletons } from '@/models/siteTemplate'
import { normalizeSiteTheme } from '@/models/siteTheme'
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

  const [document, setDocument] = useState(() =>
    ({ ...createLocalDraftDocument({
      name: t('editor.draftPageName'),
      t,
      pageSkeletons: seed ? getTemplatePageSkeletons(seed.templateId).map((page) => ({ ...page, name: t(page.nameKey) })) : undefined,
      copy: {
        heading: t('editor.draftCopy.heading'),
        text: t('editor.draftCopy.text'),
        button: t('editor.draftCopy.button'),
      },
    }), ...(seed ? { theme: normalizeSiteTheme(seed.themePresetId) } : {}) }),
  )
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.CLEAN)
  const [draftLoading, setDraftLoading] = useState(true)
  const [draftError, setDraftError] = useState(false)
  useEffect(() => {
    let active = true
    siteEditorService.getSiteDraft(siteId).then(draft => {
      if (active && draft) {
        setDocument(draft)
        if (draft.isLocalDraft) setSaveStatus(SAVE_STATUS.UNSAVED)
      }
    }).catch(() => { if (active) setDraftError(true) })
      .finally(() => { if (active) setDraftLoading(false) })
    return () => { active = false }
  }, [siteId])

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
