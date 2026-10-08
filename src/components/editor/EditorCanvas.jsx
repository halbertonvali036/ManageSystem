import { CanvasDragProvider } from '@/components/editor/CanvasDrag'
import useSiteMotion from '@/hooks/useSiteMotion'
import useTranslation from '@/hooks/useTranslation'
import { EDITOR_DEVICE_WIDTHS, getCanvasCssStyle } from '@/models/siteEditor'
import SectionRenderer from '@/components/editor/SectionRenderer'
import SiteHeaderPreview from '@/components/editor/SiteHeaderPreview'

/**
 * The editing surface.
 *
 * The frame width follows the device control and nothing else, so the editor
 * shell stays stable while the canvas previews a target size. The same markup
 * and the same draft render here and in preview mode — only the selection and
 * insertion affordances are added on top.
 *
 * Selection is by kind, not just id: a section and a block are both selectable
 * and they open different settings, so a bare id would be ambiguous.
 *
 * The header sits inside the frame rather than in the editor shell, because the
 * menu's own layout is part of what the device switch is previewing: at 390px the
 * links are behind a menu button, and that is the point.
 */
function EditorCanvas({
  document,
  activePage,
  device,
  selection,
  isPreview,
  onSelectSection,
  onSelectBlock,
  onInsertBlockAt,
  onMoveBlock,
  onMoveSection,
  onNavigatePage,
}) {
  const { t } = useTranslation()
  const motionRef = useSiteMotion(isPreview, activePage?.id)
  const width = EDITOR_DEVICE_WIDTHS[device]

  // The section being worked on owns the focusable insertion markers. Without
  // this, a page with several sections would put every marker in the tab order.
  const focusedSectionId =
    selection?.kind === 'section'
      ? selection.id
      : selection?.kind === 'block'
        ? activePage?.sections.find((section) =>
            section.blocks.some((block) => block.id === selection.id),
          )?.id
        : null

  const hasSections = (activePage?.sections?.length ?? 0) > 0

  const handlePreviewLink = (event) => {
    if (!isPreview) return
    const link = event.target.closest('a[href]')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href?.startsWith('/') || href.startsWith('//')) return
    const slug = href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')
    const page = document.pages.find(item => slug ? item.slug === slug : item.isHome)
    if (page) {
      event.preventDefault()
      onNavigatePage(page.id)
    }
  }

  return (
    <CanvasDragProvider onMoveBlock={onMoveBlock} onMoveSection={onMoveSection}>
    <div className="editor-canvas-area">
      <div
        className="editor-canvas-scroll"
        data-preview={isPreview ? 'true' : undefined}
      >
        <div
          className="editor-canvas"
          data-device={device}
          style={{ '--editor-canvas-width': `${width}px` }}
        >
          {!isPreview && <div className="editor-canvas__frame-bar" aria-hidden="true">
            <span className="editor-canvas__frame-dots"><i /><i /><i /></span>
            <span>{activePage?.name}</span>
          </div>}
          <article ref={motionRef} className="editor-canvas__page" style={getCanvasCssStyle(document)} onClick={handlePreviewLink}>
            <SiteHeaderPreview
              siteDocument={document}
              device={device}
              isPreview={isPreview}
              onNavigatePage={onNavigatePage}
            />

            {hasSections ? (
              activePage.sections.map((section, index) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  index={index}
                  siteMotion={document.motion}
                  isSectionSelected={
                    !isPreview &&
                    selection?.kind === 'section' &&
                    selection.id === section.id
                  }
                  isFocused={!isPreview && focusedSectionId === section.id}
                  selectedBlockId={selection?.kind === 'block' ? selection.id : null}
                  isPreview={isPreview}
                  device={device}
                  onSelectSection={onSelectSection}
                  onSelectBlock={onSelectBlock}
                  onInsertBlockAt={onInsertBlockAt}
                />
              ))
            ) : (
              <p className="editor-canvas__empty">{t('editor.canvas.empty')}</p>
            )}
          </article>
        </div>
      </div>
    </div>
    </CanvasDragProvider>
  )
}

export default EditorCanvas
