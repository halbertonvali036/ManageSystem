import { useCallback, useMemo, useState } from 'react'
import { getActivePage, getBlockById, getSectionById } from '@/models/siteEditor'

/**
 * The editor's single selection and the items it resolves to.
 *
 * One selection is used for the whole editor, because a section and a block are
 * both selectable and they open different settings. A bare id would be
 * ambiguous, so the selection carries its kind as well.
 */
export default function useSiteEditorSelection(document) {
  const [selection, setSelection] = useState(null)

  const activePage = useMemo(() => getActivePage(document), [document])

  const selectedSection = useMemo(
    () => (selection?.kind === 'section' ? getSectionById(activePage, selection.id) : null),
    [activePage, selection],
  )

  const selectedBlock = useMemo(
    () => (selection?.kind === 'block' ? getBlockById(activePage, selection.id) : null),
    [activePage, selection],
  )

  /**
   * Selects a block that a mutation may have removed, or the section that owns
   * it, so the settings panel never keeps pointing at something that is gone.
   */
  const clearSelectionIf = useCallback((isGone) => {
    setSelection((current) => (current && isGone(current) ? null : current))
  }, [])

  const handleSelect = useCallback((next) => {
    setSelection(next)
  }, [])

  // Stable wrappers so the memoized canvas does not treat every render as a
  // prop change: inline arrows here re-rendered every section on every keystroke.
  const handleSelectSection = useCallback(
    (sectionId) => handleSelect({ kind: 'section', id: sectionId }),
    [handleSelect],
  )
  const handleSelectBlock = useCallback(
    (blockId) => handleSelect({ kind: 'block', id: blockId }),
    [handleSelect],
  )

  return {
    selection,
    setSelection,
    activePage,
    selectedSection,
    selectedBlock,
    clearSelectionIf,
    handleSelect,
    handleSelectSection,
    handleSelectBlock,
  }
}
