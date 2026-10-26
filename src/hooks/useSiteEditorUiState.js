import { useCallback, useState } from 'react'
import { EDITOR_DEVICE } from '@/models/siteEditor'

/**
 * Editor chrome: device preview, preview mode, drawers and dialogs.
 *
 * This is deliberately separate from the draft: none of these values is part of
 * the document and none of them may mark it dirty.
 */
export default function useSiteEditorUiState() {
  const [device, setDevice] = useState(EDITOR_DEVICE.DESKTOP)
  const [isPreview, setIsPreview] = useState(false)
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)
  const [isSectionLibraryOpen, setIsSectionLibraryOpen] = useState(false)
  const [isPageCreateOpen, setIsPageCreateOpen] = useState(false)

  const togglePreview = useCallback(() => {
    setIsPreview((current) => !current)
    setIsLeftOpen(false)
    setIsRightOpen(false)
  }, [])

  const closeDrawers = useCallback(() => {
    setIsLeftOpen(false)
    setIsRightOpen(false)
  }, [])

  const toggleLeftDrawer = useCallback(() => {
    setIsLeftOpen((current) => !current)
  }, [])

  const toggleRightDrawer = useCallback(() => {
    setIsRightOpen((current) => !current)
  }, [])

  const openSectionLibrary = useCallback(() => {
    setIsSectionLibraryOpen(true)
    setIsLeftOpen(false)
  }, [])

  const isDrawerOpen = isLeftOpen || isRightOpen

  return {
    device,
    setDevice,
    isPreview,
    togglePreview,
    isLeftOpen,
    setIsLeftOpen,
    isRightOpen,
    setIsRightOpen,
    isSectionLibraryOpen,
    setIsSectionLibraryOpen,
    isPageCreateOpen,
    setIsPageCreateOpen,
    closeDrawers,
    toggleLeftDrawer,
    toggleRightDrawer,
    openSectionLibrary,
    isDrawerOpen,
  }
}
