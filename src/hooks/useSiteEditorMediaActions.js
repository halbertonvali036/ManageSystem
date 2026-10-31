import { useCallback, useEffect, useState } from 'react'
import {
  listMediaIdsInUse,
  insertBlock,
  updateBlock,
  updateSection,
} from '@/models/siteEditor'
import {
  MEDIA_SOURCE,
  createLocalPreviewMediaItem,
  isAcceptedImageFile,
  normalizeMediaItem,
  readImageSize,
  revokeAllMediaUrls,
  revokeMediaUrlsExcept,
} from '@/models/siteMedia'

/**
 * The media dialog and its side effects.
 *
 * What the dialog is choosing an image *for* is an explicit target rather than
 * the current selection: a block image and a section background are different
 * fields, and the sidebar's Media button must be able to open the same dialog
 * when nothing is selected.
 */
export default function useSiteEditorMediaActions({
  document,
  draftLoading,
  applyEdit,
  selectedBlock,
  selectedSection,
}) {
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  const [mediaTarget, setMediaTarget] = useState(null)

  /**
   * Opens the media dialog for a target, defaulting to what is selected.
   *
   * The target is resolved here rather than inside the dialog because the dialog
   * must not know about blocks, sections or the document shape.
   */
  const openMedia = useCallback(
    (target) => {
      const resolved = target ?? (selectedBlock?.type === 'image'
        ? { kind: 'block', id: selectedBlock.id }
        : selectedSection ? { kind: 'section', id: selectedSection.id } : { kind: 'newBlock' })
      setMediaTarget(resolved)
      setIsMediaOpen(true)
    },
    [selectedBlock, selectedSection],
  )

  const closeMedia = useCallback(() => {
    setIsMediaOpen(false)
  }, [])

  /**
   * Attaches a chosen image to whatever asked for it.
   *
   * Both paths go through the same "build a record, then write it to a field"
   * step, so a local file and a typed url cannot end up stored in two different
   * shapes. The alt text is only seeded on first choice, so replacing an image
   * does not throw away a description the user already wrote.
   */
  const attachMedia = useCallback(
    (media, { alt } = {}) => {
      if (!mediaTarget) {
        return
      }
      if (mediaTarget.kind === 'newBlock') {
        applyEdit(current => insertBlock(current, 'image', { content: { media, alt: alt ?? '' } }))
      } else if (mediaTarget.kind === 'block') {
        applyEdit((current) =>
          updateBlock(current, mediaTarget.id, {
            content: { media, alt: alt ?? '' },
          }),
        )
      } else {
        applyEdit((current) =>
          updateSection(current, mediaTarget.id, {
            backgroundImage: { media, fit: 'cover', position: 'center', overlayColor: 'text', overlayOpacity: 0 },
          }),
        )
      }
      setIsMediaOpen(false)
    },
    [applyEdit, mediaTarget],
  )

  const handlePickLocalFile = useCallback(
    async (file) => {
      if (!isAcceptedImageFile(file)) {
        return
      }
      /*
       * The Object URL is created once, here, and tracked against the media id.
       * Nothing else creates one, so there is exactly one place that can leak it:
       * this function's callers, via the pruning effect below and the unmount
       * cleanup.
       */
      const item = createLocalPreviewMediaItem({ file, objectUrl: URL.createObjectURL(file) })
      /*
       * Dimensions are read so the model carries the real size. The canvas does
       * not need them to render, and a failure here must not stop the image from
       * being usable, so the dimensions are allowed to stay unknown.
       */
      await readImageSize(item.url)
        .then(({ width, height }) => attachMedia({ ...item, width, height }))
        .catch(() => attachMedia(item))
    },
    [attachMedia],
  )

  const handlePickUrl = useCallback(
    (url) => {
      attachMedia(normalizeMediaItem({ source: MEDIA_SOURCE.URL, url }))
    },
    [attachMedia],
  )

  /**
   * Releases the Object URL of anything the document no longer refers to.
   *
   * A duplicated block shares its media record with the original, so a URL is
   * released only when no block or section background still names it. Doing this
   * on every document change rather than on each delete is what makes duplication
   * safe: the copy keeps the picture alive.
   */
  useEffect(() => {
    if (draftLoading) return undefined
    // Walking the whole document for media ids on every keystroke was wasted
    // work: nothing is released until editing pauses.
    const timer = window.setTimeout(() => revokeMediaUrlsExcept(listMediaIdsInUse(document)), 300)
    return () => window.clearTimeout(timer)
  }, [document, draftLoading])

  // Nothing can keep an Object URL alive past the editor itself.
  useEffect(() => () => revokeAllMediaUrls(), [])

  return {
    isMediaOpen,
    openMedia,
    closeMedia,
    handlePickLocalFile,
    handlePickUrl,
  }
}
