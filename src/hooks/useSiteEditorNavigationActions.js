import { useCallback } from 'react'
import {
  addMenuItem,
  buildMenuFromDocumentPages,
  clearNavigation,
  moveMenuItem,
  toggleMenuItem,
  updateMenuItem,
} from '@/models/siteEditor'

/** Navigation/menu mutations. Every one marks the draft unsaved. */
export default function useSiteEditorNavigationActions({ applyEdit }) {
  const handleAddMenuItem = useCallback(
    (patch) => {
      applyEdit((current) => addMenuItem(current, patch).document)
    },
    [applyEdit],
  )

  const handleUpdateMenuItem = useCallback(
    (itemId, patch) => {
      applyEdit((current) => updateMenuItem(current, itemId, patch))
    },
    [applyEdit],
  )

  const handleToggleMenuItem = useCallback(
    (itemId) => {
      applyEdit((current) => toggleMenuItem(current, itemId))
    },
    [applyEdit],
  )

  const handleMoveMenuItem = useCallback(
    (itemId, offset) => {
      applyEdit((current) => moveMenuItem(current, itemId, offset))
    },
    [applyEdit],
  )

  const handleBuildMenuFromPages = useCallback(() => {
    applyEdit((current) => buildMenuFromDocumentPages(current))
  }, [applyEdit])

  const handleClearMenu = useCallback(() => {
    applyEdit((current) => clearNavigation(current))
  }, [applyEdit])

  return {
    handleAddMenuItem,
    handleUpdateMenuItem,
    handleToggleMenuItem,
    handleMoveMenuItem,
    handleBuildMenuFromPages,
    handleClearMenu,
  }
}
