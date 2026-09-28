import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Heading,
  Image as ImageIcon,
  Layers,
  LayoutPanelTop,
  MousePointerClick,
  Plus,
  Square,
  ListChecks,
  Trash2,
  Type,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import EditorNavigationPanel from '@/components/editor/EditorNavigationPanel'
import EditorPagesPanel from '@/components/editor/EditorPagesPanel'
import { BLOCK_TYPE, BLOCK_TYPE_LABELS, BLOCK_TYPES } from '@/models/siteEditor'
import { SECTION_TYPE_LABELS } from '@/models/siteSection'

const BLOCK_ICONS = {
  [BLOCK_TYPE.FORM]: ListChecks,
  [BLOCK_TYPE.HEADING]: Heading,
  [BLOCK_TYPE.TEXT]: Type,
  [BLOCK_TYPE.BUTTON]: MousePointerClick,
  [BLOCK_TYPE.IMAGE]: ImageIcon,
  [BLOCK_TYPE.SPACER]: Square,
}

/**
 * The outline row for one block inside a section.
 *
 * Reorder controls are plain buttons and are disabled at the ends of the
 * section, so the order they describe is the order that is actually stored.
 */
function BlockOutlineItem({ block, index, total, isSelected, onSelect, actions }) {
  const { t } = useTranslation()
  const label = t(BLOCK_TYPE_LABELS[block.type])

  return (
    <li
      className={`editor-block-list__item${isSelected ? ' is-selected' : ''}`}
      data-selected={isSelected ? 'true' : undefined}
    >
      <button
        type="button"
        className="editor-block-list__select"
        aria-current={isSelected ? 'true' : undefined}
        onClick={() => onSelect(block.id)}
      >
        <span className="editor-block-list__type">{label}</span>
        <span className="editor-block-list__preview">
          {block.content.form?.name || block.content.text || block.content.label || block.content.alt || '—'}
        </span>
      </button>

      <div className="editor-row-actions">
        <button
          type="button"
          className="editor-icon-button"
          disabled={index === 0}
          aria-label={t('editor.settings.moveUp', { name: label })}
          onClick={() => actions.onMove(block.id, -1)}
        >
          <ChevronUp size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="editor-icon-button"
          disabled={index === total - 1}
          aria-label={t('editor.settings.moveDown', { name: label })}
          onClick={() => actions.onMove(block.id, 1)}
        >
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="editor-icon-button"
          aria-label={t('editor.settings.duplicate', { name: label })}
          onClick={() => actions.onDuplicate(block.id)}
        >
          <Copy size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="editor-icon-button editor-icon-button--danger"
          aria-label={t('editor.settings.delete', { name: label })}
          onClick={() => actions.onDelete(block.id)}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

/**
 * Left panel: pages, navigation, the section library, the block palette and the
 * outline.
 *
 * The outline is nested to match the document: a section owns its blocks, and
 * reordering happens inside a section rather than across the whole page. Every
 * control here edits local state only, and the panel says so, so a user never
 * reads an unsaved arrangement as a stored one.
 *
 * Pages and navigation are separate panels because they are separate decisions:
 * a page is content, the menu is the order that content is offered in.
 */
function EditorSidebar({
  document,
  activePage,
  selection,
  onAddBlock,
  onSelect,
  onSelectPage,
  onOpenPageCreate,
  onRenamePage,
  onSetPageSlug,
  onSetHomePage,
  onDuplicatePage,
  onRequestDeletePage,
  onMovePage,
  onAddMenuItem,
  onUpdateMenuItem,
  onRequestDeleteMenuItem,
  onToggleMenuItem,
  onMoveMenuItem,
  onBuildMenuFromPages,
  onClearMenu,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onToggleSectionVisibility,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onOpenSectionLibrary,
  onOpenMedia,
  isMobileOpen,
  onCloseMobile,
}) {
  const { t } = useTranslation()

  const sectionCount = activePage?.sections.length ?? 0

  return (
    <aside
      id="editor-left-panel"
      className={`editor-panel editor-panel--left${isMobileOpen ? ' is-open' : ''}`}
      aria-label={t('editor.sidebar.label')}
    >
      <EditorPagesPanel
        document={document}
        onSelectPage={onSelectPage}
        onOpenCreate={onOpenPageCreate}
        onRenamePage={onRenamePage}
        onSetPageSlug={onSetPageSlug}
        onSetHomePage={onSetHomePage}
        onDuplicatePage={onDuplicatePage}
        onRequestDeletePage={onRequestDeletePage}
        onMovePage={onMovePage}
      />

      <EditorNavigationPanel
        document={document}
        onAddMenuItem={onAddMenuItem}
        onUpdateMenuItem={onUpdateMenuItem}
        onRequestDeleteMenuItem={onRequestDeleteMenuItem}
        onToggleMenuItem={onToggleMenuItem}
        onMoveMenuItem={onMoveMenuItem}
        onBuildFromPages={onBuildMenuFromPages}
        onClearMenu={onClearMenu}
      />

      <section className="editor-panel__section">
        <h2 className="editor-panel__title">
          <LayoutPanelTop size={15} aria-hidden="true" />
          {t('editor.section.libraryTitle')}
        </h2>
        <p className="editor-panel__hint">{t('editor.section.libraryHint')}</p>
        <button
          type="button"
          className="btn btn--accent btn--sm editor-section-library-open"
          onClick={onOpenSectionLibrary}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.section.addAction')}
        </button>
      </section>

      {/*
        The media library is opened from here rather than from the image block
        alone, because a section background uses the same library. This entry is
        the one place that says what the media dialog is for, so it carries the
        same honest note the section library carries.
      */}
      <section className="editor-panel__section">
        <h2 className="editor-panel__title">
          <ImageIcon size={15} aria-hidden="true" />
          {t('editor.media.title')}
        </h2>
        <p className="editor-panel__hint">{t('editor.media.hint')}</p>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={onOpenMedia}
        >
          <ImageIcon size={14} aria-hidden="true" />
          {t('editor.media.open')}
        </button>
      </section>

      <section className="editor-panel__section">
        <h2 className="editor-panel__title">
          <Plus size={15} aria-hidden="true" />
          {t('editor.sidebar.addBlock')}
        </h2>
        <p className="editor-panel__hint">{t('editor.sidebar.addBlockHint')}</p>

        <div className="editor-block-palette">
          {BLOCK_TYPES.map((type) => {
            const Icon = BLOCK_ICONS[type]
            return (
              <button
                key={type}
                type="button"
                className="editor-block-palette__item"
                onClick={() => onAddBlock(type)}
              >
                <Icon size={15} aria-hidden="true" />
                <span>{t(BLOCK_TYPE_LABELS[type])}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="editor-panel__section editor-panel__section--grow">
        <h2 className="editor-panel__title">
          <Layers size={15} aria-hidden="true" />
          {t('editor.sidebar.sections')}
        </h2>

        {sectionCount ? (
          <ul className="editor-section-list">
            {activePage.sections.map((section, sectionIndex) => {
              const label = t(SECTION_TYPE_LABELS[section.type] ?? 'editor.section.custom')
              const isSectionSelected =
                selection?.kind === 'section' && selection.id === section.id

              return (
                <li
                  key={section.id}
                  className={`editor-section-list__item${isSectionSelected ? ' is-selected' : ''}`}
                  data-selected={isSectionSelected ? 'true' : undefined}
                  data-hidden={section.isVisible ? undefined : 'true'}
                >
                  <div className="editor-section-list__head">
                    <button
                      type="button"
                      className="editor-section-list__select"
                      aria-current={isSectionSelected ? 'true' : undefined}
                      onClick={() => onSelect({ kind: 'section', id: section.id })}
                    >
                      {isSectionSelected ? (
                        <ChevronDown size={13} aria-hidden="true" />
                      ) : (
                        <ChevronRight size={13} aria-hidden="true" />
                      )}
                      <span className="editor-section-list__name">{label}</span>
                      <span className="editor-section-list__count">
                        {t('editor.section.blockCount', { count: section.blocks.length })}
                      </span>
                    </button>

                    <div className="editor-row-actions">
                      <button
                        type="button"
                        className="editor-icon-button"
                        disabled={sectionIndex === 0}
                        aria-label={t('editor.settings.moveUp', { name: label })}
                        onClick={() => onMoveSection(section.id, -1)}
                      >
                        <ChevronUp size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="editor-icon-button"
                        disabled={sectionIndex === sectionCount - 1}
                        aria-label={t('editor.settings.moveDown', { name: label })}
                        onClick={() => onMoveSection(section.id, 1)}
                      >
                        <ChevronDown size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="editor-icon-button"
                        aria-label={t('editor.section.toggleVisibility', { name: label })}
                        aria-pressed={section.isVisible}
                        onClick={() => onToggleSectionVisibility(section.id)}
                      >
                        {section.isVisible ? (
                          <Eye size={14} aria-hidden="true" />
                        ) : (
                          <EyeOff size={14} aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="editor-icon-button"
                        aria-label={t('editor.settings.duplicate', { name: label })}
                        onClick={() => onDuplicateSection(section.id)}
                      >
                        <Copy size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="editor-icon-button editor-icon-button--danger"
                        aria-label={t('editor.settings.delete', { name: label })}
                        onClick={() => onDeleteSection(section.id)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {section.blocks.length ? (
                    <ul className="editor-block-list">
                      {section.blocks.map((block, blockIndex) => (
                        <BlockOutlineItem
                          key={block.id}
                          block={block}
                          index={blockIndex}
                          total={section.blocks.length}
                          isSelected={selection?.kind === 'block' && selection.id === block.id}
                          onSelect={(blockId) => onSelect({ kind: 'block', id: blockId })}
                          actions={{
                            onMove: onMoveBlock,
                            onDuplicate: onDuplicateBlock,
                            onDelete: onDeleteBlock,
                          }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="editor-panel__empty editor-section-list__empty">
                      {t('editor.section.noBlocks')}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="editor-panel__empty">{t('editor.sidebar.noSections')}</p>
        )}
      </section>

      <button
        type="button"
        className="editor-panel__close"
        onClick={onCloseMobile}
        aria-label={t('editor.sidebar.close')}
      >
        {t('common.close')}
      </button>
    </aside>
  )
}

export default EditorSidebar
