import { useCallback } from 'react'
import { createStarterForm } from '@/models/siteForm'
import {
  duplicateBlock,
  duplicateSection,
  getActivePage,
  getSectionById,
  insertBlock,
  insertSection,
  moveBlock,
  moveSection,
  removeBlock,
  removeSection,
  updateBlock,
  updateSection,
} from '@/models/siteEditor'
import useTranslation from '@/hooks/useTranslation'
import { SAVE_STATUS } from '@/hooks/useSiteEditorDraft'

/**
 * Block and section mutations.
 *
 * Each mutation writes the new document and marks it unsaved. Operations that
 * insert something select it, so the settings panel follows the new item rather
 * than staying on the thing the user was previously editing.
 */
export default function useSiteEditorBlockActions({
  document,
  setDocument,
  setSaveStatus,
  applyEdit,
  activePage,
  selection,
  setSelection,
  clearSelectionIf,
  setIsLeftOpen,
  setIsSectionLibraryOpen,
}) {
  const { t } = useTranslation()

  /* ---- Blocks ---- */

  const handleAddBlock = useCallback(
    (type) => {
      // A palette button adds to the section being worked on, or the last one.
      const targetSectionId =
        selection?.kind === 'section'
          ? selection.id
          : activePage?.sections.at(-1)?.id

      const next = insertBlock(document, type, { sectionId: targetSectionId, content: type === 'form' ? { form: createStarterForm(t) } : undefined })
      setDocument(next)
      setSaveStatus(SAVE_STATUS.UNSAVED)

      const page = getActivePage(next)
      const target = targetSectionId
        ? getSectionById(page, targetSectionId)
        : page.sections[page.sections.length - 1]
      const insertedId = target?.blocks[target.blocks.length - 1]?.id
      if (insertedId) {
        setSelection({ kind: 'block', id: insertedId })
      }
      setIsLeftOpen(false)
    },
    [activePage, document, selection, t, setDocument, setSaveStatus, setSelection, setIsLeftOpen],
  )

  /**
   * Inserts a block at a canvas insertion marker.
   *
   * The marker owns the position, so the sidebar's block palette is not involved
   * and the section receives the block at exactly the index that was marked.
   */
  const handleInsertBlockAt = useCallback(
    (sectionId, atIndex) => {
      const next = insertBlock(document, 'text', { sectionId, atIndex })
      setDocument(next)
      setSaveStatus(SAVE_STATUS.UNSAVED)

      const insertedId = getSectionById(getActivePage(next), sectionId)?.blocks[atIndex]?.id
      if (insertedId) {
        setSelection({ kind: 'block', id: insertedId })
      }
    },
    [document, setDocument, setSaveStatus, setSelection],
  )

  const handleUpdateBlock = useCallback(
    (blockId, patch) => {
      applyEdit((current) => updateBlock(current, blockId, patch))
    },
    [applyEdit],
  )

  const handleDeleteBlock = useCallback(
    (blockId) => {
      applyEdit((current) => removeBlock(current, blockId))
      clearSelectionIf((current) => current.id === blockId)
    },
    [applyEdit, clearSelectionIf],
  )

  const handleDuplicateBlock = useCallback(
    (blockId) => {
      const { document: next, insertedId } = duplicateBlock(document, blockId)
      setDocument(next)
      setSaveStatus(SAVE_STATUS.UNSAVED)
      // Select the copy so the settings panel follows the new block.
      if (insertedId) {
        setSelection({ kind: 'block', id: insertedId })
      }
    },
    [document, setDocument, setSaveStatus, setSelection],
  )

  const handleMoveBlock = useCallback(
    (blockId, offset) => {
      applyEdit((current) => moveBlock(current, blockId, offset))
    },
    [applyEdit],
  )

  /* ---- Sections ---- */

  const handleAddSection = useCallback(
    (type) => {
      const { document: next, sectionId } = insertSection(document, type, { t })
      if (!sectionId) {
        return
      }
      setDocument(next)
      setSaveStatus(SAVE_STATUS.UNSAVED)
      setSelection({ kind: 'section', id: sectionId })
      setIsSectionLibraryOpen(false)
      setIsLeftOpen(false)
    },
    [document, t, setDocument, setSaveStatus, setSelection, setIsSectionLibraryOpen, setIsLeftOpen],
  )

  const handleUpdateSection = useCallback(
    (sectionId, patch) => {
      applyEdit((current) => updateSection(current, sectionId, patch))
    },
    [applyEdit],
  )

  const handleDeleteSection = useCallback(
    (sectionId) => {
      applyEdit((current) => removeSection(current, sectionId))
      clearSelectionIf((current) => current.id === sectionId)
    },
    [applyEdit, clearSelectionIf],
  )

  const handleDuplicateSection = useCallback(
    (sectionId) => {
      const { document: next, insertedId } = duplicateSection(document, sectionId)
      setDocument(next)
      setSaveStatus(SAVE_STATUS.UNSAVED)
      if (insertedId) {
        setSelection({ kind: 'section', id: insertedId })
      }
    },
    [document, setDocument, setSaveStatus, setSelection],
  )

  const handleMoveSection = useCallback(
    (sectionId, offset) => {
      applyEdit((current) => moveSection(current, sectionId, offset))
    },
    [applyEdit],
  )

  const handleToggleSectionVisibility = useCallback(
    (sectionId) => {
      const section = getSectionById(activePage, sectionId)
      if (!section) {
        return
      }
      applyEdit((current) => updateSection(current, sectionId, { isVisible: !section.isVisible }))
    },
    [activePage, applyEdit],
  )

  return {
    handleAddBlock,
    handleInsertBlockAt,
    handleUpdateBlock,
    handleDeleteBlock,
    handleDuplicateBlock,
    handleMoveBlock,
    handleAddSection,
    handleUpdateSection,
    handleDeleteSection,
    handleDuplicateSection,
    handleMoveSection,
    handleToggleSectionVisibility,
  }
}
