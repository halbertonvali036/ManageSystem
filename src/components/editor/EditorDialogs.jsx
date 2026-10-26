import ConfirmDialog from '@/components/common/ConfirmDialog'
import MediaLibraryDialog from '@/components/editor/MediaLibraryDialog'
import PageCreateDialog from '@/components/editor/PageCreateDialog'
import SectionLibraryDialog from '@/components/editor/SectionLibraryDialog'
import useTranslation from '@/hooks/useTranslation'

/**
 * The editor's dialog stack.
 *
 * Grouped here so the page body stays the working surface: every dialog is a
 * sibling of it in the DOM, mounted only while it has something to show. The
 * page-create dialog is deliberately mounted only while open, so each open
 * starts from an empty form.
 */
export default function EditorDialogs({
  isPreview,
  isSectionLibraryOpen,
  onCloseSectionLibrary,
  onAddSection,
  isMediaOpen,
  onCloseMedia,
  onPickLocalFile,
  onPickUrl,
  isPageCreateOpen,
  pages,
  onClosePageCreate,
  onCreatePage,
  pendingDelete,
  onConfirmDelete,
  onCloseConfirm,
}) {
  const { t } = useTranslation()

  return (
    <>
      {isPreview ? null : (
        <SectionLibraryDialog
          isOpen={isSectionLibraryOpen}
          onClose={onCloseSectionLibrary}
          onAddSection={onAddSection}
        />
      )}

      {isPreview ? null : (
        <MediaLibraryDialog
          isOpen={isMediaOpen}
          onClose={onCloseMedia}
          onPickLocalFile={onPickLocalFile}
          onPickUrl={onPickUrl}
        />
      )}

      {/* Mounted only while open, so each open starts from an empty form. */}
      {isPreview || !isPageCreateOpen ? null : (
        <PageCreateDialog
          pages={pages}
          onClose={onClosePageCreate}
          onCreate={onCreatePage}
        />
      )}

      {isPreview ? null : (
        <ConfirmDialog
          appearance="editor"
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
          onConfirm={onConfirmDelete}
          onClose={onCloseConfirm}
        />
      )}
    </>
  )
}
