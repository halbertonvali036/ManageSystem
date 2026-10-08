import { isDemoSession, rememberDemoDraft } from '@/services/demoSession'
import { createStarterForm } from '@/models/siteForm'
import { getPublicationState } from '@/models/sitePublishing'
import PreviewBar from '@/components/editor/PreviewBar'
import siteService from '@/services/siteService'
import { PanelLeft, PanelRight, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getTemplatePageSkeletons } from '@/models/siteTemplate'
import { normalizeSiteTheme } from '@/models/siteTheme'
import EditorCanvas from '@/components/editor/EditorCanvas'
import EditorSettingsPanel from '@/components/editor/EditorSettingsPanel'
import EditorSidebar from '@/components/editor/EditorSidebar'
import EditorTopBar from '@/components/editor/EditorTopBar'
import SectionLibraryDialog from '@/components/editor/SectionLibraryDialog'
import useTranslation from '@/hooks/useTranslation'
import {
  addMenuItem,
  addPage,
  buildMenuFromDocumentPages,
  clearNavigation,
  createLocalDraftDocument,
  duplicateBlock,
  duplicatePage,
  duplicateSection,
  EDITOR_DEVICE,
  getActivePage,
  getBlockById,
  getSectionById,
  insertBlock,
  insertSection,
  isResponsiveDevice,
  listMediaIdsInUse,
  moveBlock,
  moveMenuItem,
  movePage,
  moveSection,
  removeBlock,
  removeMenuItem,
  removePage,
  removeSection,
  renamePage,
  resetResponsiveOverride,
  setActivePage,
  setHomePage,
  setPageSlug,
  toggleMenuItem,
  updateBlock,
  updateSiteMotion,
  updateSiteDesign,
  resetLocalStyles,
  updateMenuItem,
  updatePageSeo,
  updateSection,
  updateSiteTheme,
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
import MediaLibraryDialog from '@/components/editor/MediaLibraryDialog'
import ConfirmDialog from '@/components/editor/ConfirmDialog'
import PageCreateDialog from '@/components/editor/PageCreateDialog'
import siteEditorService from '@/services/siteEditorService'
import { BackendNotConnectedError } from '@/services/httpClient'

/**
 * Save states. There is deliberately no "saved" state that can be reached
 * without a backend: `clean` only appears for a document nothing has touched.
 */
const SAVE_STATUS = {
  CLEAN: 'clean',
  UNSAVED: 'unsaved',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
}

/**
 * The visual website editor.
 *
 * All editing happens in a local draft document held in component state, shaped
 * as page -> section -> block. Save is wired to the service contract and refuses
 * to claim success, because `saveSiteDraft` throws while the backend is absent.
 * The status pill and the note under the canvas both say so in the visitor's
 * language.
 */
function SiteEditorDocument() {
  const { siteId } = useParams()
  const location = useLocation()
  const seed = siteId === 'local-draft' ? location.state?.localDraft : null
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
  useEffect(() => {
    if (!draftLoading && !draftError) rememberDemoDraft(siteId, document)
  }, [siteId, document, draftLoading, draftError])
  // One selection for the whole editor, because a section and a block are both
  // selectable and they open different settings. A bare id would be ambiguous.
  const [selection, setSelection] = useState(null)
  const [device, setDevice] = useState(EDITOR_DEVICE.DESKTOP)
  const [isPreview, setIsPreview] = useState(false)
  const [siteResult, setSiteResult] = useState(null)
  useEffect(() => {
    let active = true
    siteService.getSite(siteId).then((site) => { if (active) setSiteResult({ siteId, site }) }).catch(() => {})
    return () => { active = false }
  }, [siteId])
  const site = siteResult?.siteId === siteId ? siteResult.site : null
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)
  const [isSectionLibraryOpen, setIsSectionLibraryOpen] = useState(false)
  const [isMediaOpen, setIsMediaOpen] = useState(false)
  const [isPageCreateOpen, setIsPageCreateOpen] = useState(false)
  /*
   * What a pending confirmation is about.
   *
   * One dialog serves both destructive actions, so the target is kept as a value
   * rather than two booleans that could both end up true. `null` means nothing is
   * waiting to be confirmed.
   */
  const [pendingDelete, setPendingDelete] = useState(null)
  /*
   * What the media dialog is choosing an image *for*.
   *
   * A block image and a section background are different fields, so the dialog
   * needs to know which one the choice is for. Keeping it as an explicit target
   * rather than reading the current selection is what lets the sidebar's Media
   * button open the same dialog when nothing is selected.
   */
  const [mediaTarget, setMediaTarget] = useState(null)

  const activePage = useMemo(() => getActivePage(document), [document])

  const selectedSection = useMemo(
    () => (selection?.kind === 'section' ? getSectionById(activePage, selection.id) : null),
    [activePage, selection],
  )

  const selectedBlock = useMemo(
    () => (selection?.kind === 'block' ? getBlockById(activePage, selection.id) : null),
    [activePage, selection],
  )

  /** Every local edit marks the document as unsaved. */
  const applyEdit = useCallback((updater) => {
    setDocument((current) => updater(current))
    setSaveStatus(SAVE_STATUS.UNSAVED)
  }, [])

  /**
   * Selects a block that a mutation may have removed, or the section that owns
   * it, so the settings panel never keeps pointing at something that is gone.
   */
  const clearSelectionIf = useCallback((isGone) => {
    setSelection((current) => (current && isGone(current) ? null : current))
  }, [])

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
    [activePage, document, selection, t],
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
    [document],
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
    [document],
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
    [document, t],
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
    [document],
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

  /* ---- Selection, pages, document ---- */

  const handleSelect = useCallback((next) => {
    setSelection(next)
  }, [])

  const handleSelectPage = useCallback((pageId) => {
    setDocument((current) => setActivePage(current, pageId))
    // A page switch must not leave a selection pointing at the old page.
    setSelection(null)
  }, [])

  const handleCreatePage = useCallback(
    ({ name, slug }) => {
      applyEdit((current) => addPage(current, { name, slug }).document)
      setSelection(null)
      setIsLeftOpen(false)
    },
    [applyEdit],
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
    [document],
  )

  /**
   * Deletion asks first.
   *
   * There is no backend and no version history, so a deleted page is gone from
   * this session. The confirmation names the page, and the delete button is
   * disabled outright when only one page is left rather than asking a question
   * whose only answer is "no".
   */
  const handleRequestDeletePage = useCallback((page) => {
    setPendingDelete({ kind: 'page', id: page.id, name: page.name, isHome: page.isHome })
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
  }, [applyEdit, pendingDelete])

  const handleMovePage = useCallback(
    (pageId, offset) => {
      applyEdit((current) => movePage(current, pageId, offset))
    },
    [applyEdit],
  )

  /* ---- Navigation ---- */

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

  const handleRequestDeleteMenuItem = useCallback((item) => {
    setPendingDelete({ kind: 'menuItem', id: item.id, name: item.label })
  }, [])

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

  const handleUpdateSiteDesign = useCallback(
    (patch) => {
      applyEdit((current) => updateSiteDesign(current, patch))
    },
    [applyEdit],
  )

  const handleUpdateSiteTheme = useCallback(
    (themePresetId) => {
      applyEdit((current) => updateSiteTheme(current, themePresetId))
    },
    [applyEdit],
  )

  /* ---- Responsive overrides ---- */

  const handleResetDeviceOverrides = useCallback(
    (kind, id) => {
      // Only a narrower device can have overrides, so desktop is never a target.
      if (!isResponsiveDevice(device)) {
        return
      }
      applyEdit((current) => resetResponsiveOverride(current, { kind, id }, device))
    },
    [applyEdit, device],
  )

  /* ---- Media ---- */

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
    if (!draftLoading && !isDemoSession()) revokeMediaUrlsExcept(listMediaIdsInUse(document))
  }, [document, draftLoading])

  // Nothing can keep an Object URL alive past the editor itself.
  useEffect(() => () => { if (!isDemoSession()) revokeAllMediaUrls() }, [])

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

  const togglePreview = useCallback(() => {
    setIsPreview((current) => !current)
    setIsLeftOpen(false)
    setIsRightOpen(false)
  }, [])

  const closeDrawers = useCallback(() => {
    setIsLeftOpen(false)
    setIsRightOpen(false)
  }, [])

  const openSectionLibrary = useCallback(() => {
    setIsSectionLibraryOpen(true)
    setIsLeftOpen(false)
  }, [])

  const isDrawerOpen = isLeftOpen || isRightOpen
  const publication = getPublicationState(site ? { status: site.status === 'draft' ? 'unpublished' : site.status } : null, Boolean(document.updatedAt))

  if (draftLoading) return <div className="page-status" role="status">{t('common.loading')}</div>
  if (draftError) return <div className="page-status" role="alert">{t('recovery.loadDraftFailed')} <button className="btn btn--outline" onClick={() => window.location.reload()}>{t('common.retry')}</button></div>

  return (
    <div className="editor" data-preview={isPreview ? 'true' : undefined}>
      {isPreview ? <PreviewBar device={device} onDeviceChange={setDevice} onClose={togglePreview} /> : <EditorTopBar
        siteId={siteId}
        siteName={site?.name || seed?.name}
        document={document}
        saveStatus={saveStatus}
        device={device}
        onDeviceChange={setDevice}
        isPreview={isPreview}
        onTogglePreview={togglePreview}
        onSave={handleSave}
      />}
      {!isPreview && (
        <p className="publication-state" role="status">
          {t('publishing.draft')} · {t(`publishing.${publication.status}`)}
          {publication.hasChanges ? ` · ${t('publishing.changes')}` : ''}
        </p>
      )}

      {/*
        A real dismiss layer for the narrow-viewport drawers. The panels fall
        back into the grid above 768px, where the stylesheet hides this.
      */}
      {!isPreview && isDrawerOpen ? (
        <button
          type="button"
          className="editor-scrim"
          aria-label={t('common.close')}
          onClick={closeDrawers}
        />
      ) : null}

      <div className="editor__body">
        {isPreview ? null : (
          <EditorSidebar
            document={document}
            activePage={activePage}
            selection={selection}
            onAddBlock={handleAddBlock}
            onSelect={handleSelect}
            onSelectPage={handleSelectPage}
            onOpenPageCreate={() => setIsPageCreateOpen(true)}
        onRenamePage={handleRenamePage}
        onSetPageSlug={handleSetPageSlug}
        onUpdatePageSeo={handleUpdatePageSeo}

            onSetHomePage={handleSetHomePage}
            onDuplicatePage={handleDuplicatePage}
            onRequestDeletePage={handleRequestDeletePage}
            onMovePage={handleMovePage}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onRequestDeleteMenuItem={handleRequestDeleteMenuItem}
            onToggleMenuItem={handleToggleMenuItem}
            onMoveMenuItem={handleMoveMenuItem}
            onBuildMenuFromPages={handleBuildMenuFromPages}
            onClearMenu={handleClearMenu}
            onMoveSection={handleMoveSection}
            onDuplicateSection={handleDuplicateSection}
            onDeleteSection={handleDeleteSection}
            onToggleSectionVisibility={handleToggleSectionVisibility}
            onMoveBlock={handleMoveBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onDeleteBlock={handleDeleteBlock}
            onOpenSectionLibrary={openSectionLibrary}
            onOpenMedia={() => openMedia()}
            isMobileOpen={isLeftOpen}
            onCloseMobile={() => setIsLeftOpen(false)}
          />
        )}

        <main className="editor__main" aria-label={t('editor.canvas.label')}>
          {!isPreview ? (
            <div className="editor__mobile-tools">
              <button
                type="button"
                className="editor-icon-button"
                aria-expanded={isLeftOpen}
                aria-controls="editor-left-panel"
                onClick={() => setIsLeftOpen((current) => !current)}
              >
                <PanelLeft size={16} aria-hidden="true" />
                <span className="editor-visually-hidden">
                  {t('editor.sidebar.toggleLabel')}
                </span>
              </button>

              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleSave}
              >
                <Save size={14} aria-hidden="true" />
                {t('editor.save.action')}
              </button>

              <button
                type="button"
                className="editor-icon-button"
                aria-expanded={isRightOpen}
                aria-controls="editor-right-panel"
                onClick={() => setIsRightOpen((current) => !current)}
              >
                <PanelRight size={16} aria-hidden="true" />
                <span className="editor-visually-hidden">
                  {t('editor.settings.toggleLabel')}
                </span>
              </button>
            </div>
          ) : null}

          <EditorCanvas
            document={document}
            activePage={activePage}
            device={device}
            selection={selection}
            isPreview={isPreview}
            onSelectSection={(sectionId) => handleSelect({ kind: 'section', id: sectionId })}
            onSelectBlock={(blockId) => handleSelect({ kind: 'block', id: blockId })}
            onInsertBlockAt={handleInsertBlockAt}
            onMoveBlock={handleMoveBlock}
            onMoveSection={handleMoveSection}
            onNavigatePage={handleSelectPage}
          />

          {!isPreview ? (
            <p className="editor__note" id="editor-publish-note">
              {t('editor.localDraftNote')}
            </p>
          ) : null}
        </main>

        {isPreview ? null : (
          <EditorSettingsPanel
            block={selectedBlock}
            section={selectedSection}
            document={document}
            device={device}
            onUpdateBlock={handleUpdateBlock}
            onUpdateSection={handleUpdateSection}
            onUpdateSiteMotion={(motion) => applyEdit((current) => updateSiteMotion(current, motion))}
            onUpdateSiteDesign={handleUpdateSiteDesign}
            onResetLocalStyles={(kind, id) => applyEdit((current) => resetLocalStyles(current, { kind, id }))}
            onUpdateSiteTheme={handleUpdateSiteTheme}
            onDuplicateBlock={handleDuplicateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateSection={handleDuplicateSection}
            onDeleteSection={handleDeleteSection}
            onResetDeviceOverrides={handleResetDeviceOverrides}
            onOpenMedia={() => openMedia()}
            onClearSelection={() => setSelection(null)}
            isMobileOpen={isRightOpen}
            onCloseMobile={() => setIsRightOpen(false)}
          />
        )}
      </div>

      {isPreview ? null : (
        <SectionLibraryDialog
          isOpen={isSectionLibraryOpen}
          onClose={() => setIsSectionLibraryOpen(false)}
          onAddSection={handleAddSection}
        />
      )}

      {isPreview ? null : (
        <MediaLibraryDialog
          isOpen={isMediaOpen}
          onClose={closeMedia}
          onPickLocalFile={handlePickLocalFile}
          onPickUrl={handlePickUrl}
        />
      )}

      {/* Mounted only while open, so each open starts from an empty form. */}
      {isPreview || !isPageCreateOpen ? null : (
        <PageCreateDialog
          pages={document.pages}
          onClose={() => setIsPageCreateOpen(false)}
          onCreate={handleCreatePage}
        />
      )}

      {isPreview ? null : (
        <ConfirmDialog
          isOpen={pendingDelete !== null}
          title={
            pendingDelete?.kind === 'page'
              ? t('editor.page.deleteTitle')
              : t('editor.nav.deleteTitle')
          }
          description={
            pendingDelete?.kind === 'page'
              ? t('editor.page.deleteDescription', { name: pendingDelete?.name ?? '' })
              : t('editor.nav.deleteDescription', { name: pendingDelete?.name ?? '' })
          }
          detail={t(
            pendingDelete?.kind === 'page' && pendingDelete?.isHome
              ? 'editor.page.deleteHomeDetail'
              : 'editor.page.deleteDetail',
          )}
          confirmLabel={t('editor.page.deleteConfirm')}
          onConfirm={handleConfirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

export default function SiteEditorRoute() {
  const { siteId } = useParams()
  return <SiteEditorDocument key={siteId} />
}
