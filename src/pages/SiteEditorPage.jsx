import { getPublicationState } from '@/models/sitePublishing'
import { resetLocalStyles, updateSiteMotion } from '@/models/siteEditor'
import PreviewBar from '@/components/editor/PreviewBar'
import { useLocation, useParams } from 'react-router-dom'
import EditorCanvas from '@/components/editor/EditorCanvas'
import EditorSettingsPanel from '@/components/editor/EditorSettingsPanel'
import EditorSidebar from '@/components/editor/EditorSidebar'
import EditorTopBar from '@/components/editor/EditorTopBar'
import EditorMobileTools from '@/components/editor/EditorMobileTools'
import EditorPublicationState from '@/components/editor/EditorPublicationState'
import EditorScrim from '@/components/editor/EditorScrim'
import EditorDialogs from '@/components/editor/EditorDialogs'
import useTranslation from '@/hooks/useTranslation'
import useSiteEditorDraft from '@/hooks/useSiteEditorDraft'
import useSiteEditorSelection from '@/hooks/useSiteEditorSelection'
import useSiteEditorUiState from '@/hooks/useSiteEditorUiState'
import useSiteOverview from '@/hooks/useSiteOverview'
import useSiteEditorDeleteConfirmation from '@/hooks/useSiteEditorDeleteConfirmation'
import useSiteEditorBlockActions from '@/hooks/useSiteEditorBlockActions'
import useSiteEditorPageActions from '@/hooks/useSiteEditorPageActions'
import useSiteEditorNavigationActions from '@/hooks/useSiteEditorNavigationActions'
import useSiteEditorDesignActions from '@/hooks/useSiteEditorDesignActions'
import useSiteEditorMediaActions from '@/hooks/useSiteEditorMediaActions'

/**
 * The visual website editor.
 *
 * All editing happens in a local draft document held in component state, shaped
 * as page -> section -> block. Save is wired to the service contract and refuses
 * to claim success, because `saveSiteDraft` throws while the backend is absent.
 * The status pill and the note under the canvas both say so in the visitor's
 * language.
 *
 * The document, selection, UI chrome, dialogs and media side effects each live
 * in a focused hook; this component only composes them and lays out the screen.
 */
function SiteEditorDocument() {
  const { siteId } = useParams()
  const location = useLocation()
  const seed = siteId === 'local-draft' ? location.state?.localDraft : null
  const { t } = useTranslation()

  const {
    document,
    setDocument,
    saveStatus,
    setSaveStatus,
    draftLoading,
    draftError,
    applyEdit,
    handleSave,
  } = useSiteEditorDraft(siteId, seed)

  const {
    selection,
    setSelection,
    activePage,
    selectedSection,
    selectedBlock,
    clearSelectionIf,
    handleSelect,
    handleSelectSection,
    handleSelectBlock,
  } = useSiteEditorSelection(document)

  const {
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
  } = useSiteEditorUiState()

  const site = useSiteOverview(siteId)

  const {
    pendingDelete,
    setPendingDelete,
    handleRequestDeletePage,
    handleRequestDeleteMenuItem,
    handleConfirmDelete,
  } = useSiteEditorDeleteConfirmation({ applyEdit, setSelection })

  const {
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
  } = useSiteEditorBlockActions({
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
  })

  const {
    handleSelectPage,
    handleCreatePage,
    handleRenamePage,
    handleSetPageSlug,
    handleUpdatePageSeo,
    handleSetHomePage,
    handleDuplicatePage,
    handleMovePage,
  } = useSiteEditorPageActions({
    document,
    setDocument,
    setSaveStatus,
    applyEdit,
    setSelection,
    setIsLeftOpen,
  })

  const {
    handleAddMenuItem,
    handleUpdateMenuItem,
    handleToggleMenuItem,
    handleMoveMenuItem,
    handleBuildMenuFromPages,
    handleClearMenu,
  } = useSiteEditorNavigationActions({ applyEdit })

  const {
    handleUpdateSiteDesign,
    handleUpdateSiteTheme,
    handleResetDeviceOverrides,
  } = useSiteEditorDesignActions({ applyEdit, device })

  const {
    isMediaOpen,
    openMedia,
    closeMedia,
    handlePickLocalFile,
    handlePickUrl,
  } = useSiteEditorMediaActions({
    document,
    draftLoading,
    applyEdit,
    selectedBlock,
    selectedSection,
  })

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
        <EditorPublicationState publication={publication} />
      )}

      {!isPreview && isDrawerOpen ? (
        <EditorScrim onClose={closeDrawers} />
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
            <EditorMobileTools
              isLeftOpen={isLeftOpen}
              isRightOpen={isRightOpen}
              onToggleLeft={toggleLeftDrawer}
              onToggleRight={toggleRightDrawer}
              onSave={handleSave}
            />
          ) : null}

          <EditorCanvas
            document={document}
            activePage={activePage}
            device={device}
            selection={selection}
            isPreview={isPreview}
            onSelectSection={handleSelectSection}
            onSelectBlock={handleSelectBlock}
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
            onOpenMedia={(target) => openMedia(target)}
            onClearSelection={() => setSelection(null)}
            isMobileOpen={isRightOpen}
            onCloseMobile={() => setIsRightOpen(false)}
          />
        )}
      </div>

      <EditorDialogs
        isPreview={isPreview}
        isSectionLibraryOpen={isSectionLibraryOpen}
        onCloseSectionLibrary={() => setIsSectionLibraryOpen(false)}
        onAddSection={handleAddSection}
        isMediaOpen={isMediaOpen}
        onCloseMedia={closeMedia}
        onPickLocalFile={handlePickLocalFile}
        onPickUrl={handlePickUrl}
        isPageCreateOpen={isPageCreateOpen}
        pages={document.pages}
        onClosePageCreate={() => setIsPageCreateOpen(false)}
        onCreatePage={handleCreatePage}
        pendingDelete={pendingDelete}
        onConfirmDelete={handleConfirmDelete}
        onCloseConfirm={() => setPendingDelete(null)}
      />
    </div>
  )
}

export default function SiteEditorRoute() {
  const { siteId } = useParams()
  return <SiteEditorDocument key={siteId} />
}
