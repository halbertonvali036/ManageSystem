import { useCallback } from 'react'
import {
  addPage,
  duplicatePage,
  movePage,
  renamePage,
  setActivePage,
  setHomePage,
  setPageSlug,
  updatePageSeo,
} from '@/models/siteEditor'
import { SAVE_STATUS } from '@/hooks/useSiteEditorDraft'

/**
 * Page list mutations.
 *
 * Creating, duplicating and selecting a page clears the selection: it pointed at
 * something on the page that is no longer active, and a settings panel that kept
 * it would edit the wrong document branch.
 */
export default function useSiteEditorPageActions({
  document,
  setDocument,
  setSaveStatus,
  applyEdit,
  setSelection,
  setIsLeftOpen,
}) {
  const handleSelectPage = useCallback((pageId) => {
    setDocument((current) => setActivePage(current, pageId))
    // A page switch must not leave a selection pointing at the old page.
    setSelection(null)
  }, [setDocument, setSelection])

  const handleCreatePage = useCallback(
    ({ name, slug }) => {
      applyEdit((current) => addPage(current, { name, slug }).document)
      setSelection(null)
      setIsLeftOpen(false)
    },
    [applyEdit, setSelection, setIsLeftOpen],
  )

  const handleRenamePage = useCallback(
    (pageId, name) => {
      applyEdit((current) => renamePage(current, pageId, name))
    },
    [applyEdit],
  )

  const handleSetPageSlug = useCallback(
    (pageId, slug) => {
      applyEdit((current) => setPageSlug(current, pageId, slug))
    },
    [applyEdit],
  )

  /*
   * A page's own search title and description. Leaving a field blank keeps the
   * site-wide default, so the model stores the empty string rather than copying
   * the default down: a copied value would stop following the site default the
   * next time it changed.
   */
  const handleUpdatePageSeo = useCallback(
    (pageId, patch) => {
      applyEdit((current) => updatePageSeo(current, pageId, patch))
    },
    [applyEdit],
  )

  const handleSetHomePage = useCallback(
    (pageId) => {
      applyEdit((current) => setHomePage(current, pageId))
    },
    [applyEdit],
  )

  const handleDuplicatePage = useCallback(
    (pageId) => {
      const { document: next } = duplicatePage(document, pageId)
      setDocument(next)
      setSaveStatus(SAVE_STATUS.UNSAVED)
      setSelection(null)
    },
    [document, setDocument, setSaveStatus, setSelection],
  )

  const handleMovePage = useCallback(
    (pageId, offset) => {
      applyEdit((current) => movePage(current, pageId, offset))
    },
    [applyEdit],
  )

  return {
    handleSelectPage,
    handleCreatePage,
    handleRenamePage,
    handleSetPageSlug,
    handleUpdatePageSeo,
    handleSetHomePage,
    handleDuplicatePage,
    handleMovePage,
  }
}
