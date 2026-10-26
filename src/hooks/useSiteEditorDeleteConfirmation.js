import { useCallback, useState } from 'react'
import { removeMenuItem, removePage } from '@/models/siteEditor'

/**
 * Confirmation for the editor's irreversible removals.
 *
 * What a pending confirmation is about is kept as a value rather than two
 * booleans that could both end up true. `null` means nothing is waiting to be
 * confirmed.
 *
 * Deletion asks first because there is no backend and no version history, so a
 * deleted page is gone from this session. The confirmation names the page, and
 * the delete button is disabled outright when only one page is left rather than
 * asking a question whose only answer is "no".
 */
export default function useSiteEditorDeleteConfirmation({ applyEdit, setSelection }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  const handleRequestDeletePage = useCallback((page) => {
    setPendingDelete({ kind: 'page', id: page.id, name: page.name, isHome: page.isHome })
  }, [])

  const handleRequestDeleteMenuItem = useCallback((item) => {
    setPendingDelete({ kind: 'menuItem', id: item.id, name: item.label })
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) {
      return
    }
    if (pendingDelete.kind === 'page') {
      applyEdit((current) => removePage(current, pendingDelete.id))
      setSelection(null)
    } else {
      applyEdit((current) => removeMenuItem(current, pendingDelete.id))
    }
    setPendingDelete(null)
  }, [applyEdit, pendingDelete, setSelection])

  return {
    pendingDelete,
    setPendingDelete,
    handleRequestDeletePage,
    handleRequestDeleteMenuItem,
    handleConfirmDelete,
  }
}
