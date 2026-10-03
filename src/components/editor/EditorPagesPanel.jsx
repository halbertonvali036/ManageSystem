import {
  ChevronDown,
  ChevronUp,
  Copy,
  Globe,
  Home,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import { canDeletePage } from '@/models/siteEditor'
import { isValidSlug } from '@/models/siteNavigation'

/**
 * The `Səhifələr` panel.
 *
 * One card per page, and the active page also shows its name and slug fields.
 * Editing is deliberately on the active card only: five pages would otherwise be
 * five open name fields competing for the same space, and the panel would read as
 * a form rather than a list.
 *
 * Reordering uses two buttons rather than drag and drop. Buttons are already the
 * pattern the section outline and block outline use, they work from the keyboard
 * with no extra code, and they say what they do in their accessible name. Nothing
 * in this stack drags a list yet, and introducing a gesture that only one input
 * method can use would be a downgrade.
 *
 * The home page is marked with a badge and a `Ana səhifə` label rather than a
 * separate star control, because the home page is a fact about the document and
 * not something the user toggles on and off.
 */
/**
 * Whether a page is still relying on the site-wide SEO default for both fields.
 *
 * Shown so the relationship is visible: a blank field here does not mean the page
 * has no title, it means the site's default is being used, and that default lives
 * on the settings page.
 */
const pageSeoIsInherited = (page) =>
  !String(page.seoTitle ?? '').trim() && !String(page.seoDescription ?? '').trim()

function EditorPagesPanel({
  document,
  onSelectPage,
  onOpenCreate,
  onRenamePage,
  onSetPageSlug,
  onUpdatePageSeo,
  onSetHomePage,
  onDuplicatePage,
  onRequestDeletePage,
  onMovePage,
}) {
  const { t } = useTranslation()
  const isActive = (page) => page.id === document.activePageId
  const canDelete = canDeletePage(document)

  return (
    <EditorPanelGroup defaultOpen title={<>
        <Layers size={15} aria-hidden="true" />
        {t('editor.sidebar.pages')}
      </>}>

      <ul className="editor-page-list">
        {document.pages.map((page, index) => {
          const blockCount = page.sections.reduce((sum, section) => sum + section.blocks.length, 0)
          const isCurrent = isActive(page)
          const isHome = page.isHome
          const slugIsValid = page.slug === '' || isValidSlug(page.slug)

          return (
            <li key={page.id}>
              <div
                className={`editor-page-list__item${isCurrent ? ' is-active' : ''}`}
                data-active={isCurrent ? 'true' : undefined}
              >
                <button
                  type="button"
                  className="editor-page-list__select"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onSelectPage(page.id)}
                >
                  <span className="editor-page-list__name">{page.name}</span>
                  <span className="editor-page-list__count">
                    {t('editor.sidebar.blockCount', { count: blockCount })}
                    {page.slug ? ` · /${page.slug}` : ''}
                  </span>
                </button>

                {isHome ? (
                  <p className="editor-badge editor-badge--home">
                    <Home size={12} aria-hidden="true" />
                    {t('editor.page.homeBadge')}
                  </p>
                ) : null}

                {isCurrent ? (
                  <div className="editor-page-list__fields">
                    {/*
                      The `key` follows the stored value, not the field. The model
                      refuses a blank name and rewrites a slug, so what the user
                      typed is not always what was stored. Remounting when the
                      stored value changes puts the accepted text back in the field
                      and reverts a refused edit, which is the feedback that was
                      missing when the field was simply left as it was typed.
                    */}
                    <div className="editor-field editor-field--inline">
                      <label className="editor-field__label" htmlFor={`editor-page-name-${page.id}`}>
                        {t('editor.sidebar.pageNameLabel')}
                      </label>
                      <input
                        key={`${page.id}-name-${page.name}`}
                        id={`editor-page-name-${page.id}`}
                        className="editor-input editor-input--compact"
                        defaultValue={page.name}
                        maxLength={80}
                        onBlur={(event) => onRenamePage(page.id, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.currentTarget.blur()
                          }
                        }}
                      />
                    </div>

                    <div className="editor-field editor-field--inline">
                      <label className="editor-field__label" htmlFor={`editor-page-slug-${page.id}`}>
                        {t('editor.page.slugLabel')}
                      </label>
                      <input
                        key={`${page.id}-slug-${page.slug}`}
                        id={`editor-page-slug-${page.id}`}
                        className="editor-input editor-input--compact editor-input--mono"
                        defaultValue={page.slug}
                        maxLength={80}
                        aria-invalid={slugIsValid ? undefined : 'true'}
                        aria-describedby={`editor-page-slug-hint-${page.id}`}
                        onBlur={(event) => onSetPageSlug(page.id, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.currentTarget.blur()
                          }
                        }}
                      />
                      <p
                        className={`editor-field__hint${slugIsValid ? '' : ' is-error'}`}
                        id={`editor-page-slug-hint-${page.id}`}
                      >
                        {slugIsValid ? t('editor.page.slugPreviewNote') : t('editor.page.slugInvalid')}
                      </p>
                    </div>

                    {/*
                      Per-page SEO overrides, edited here rather than on the
                      settings page because this is where the page lives. The site
                      settings page sets the default; an empty field below means
                      "use the site default", which is what the hint says.

                      These commit on blur, like the name and slug above. A search
                      title is a sentence rather than something being dragged
                      around, and blurring is a deliberate act that says the value
                      is finished.
                    */}
                    <div className="editor-field editor-field--inline">
                      <label
                        className="editor-field__label"
                        htmlFor={`editor-page-seo-title-${page.id}`}
                      >
                        {t('siteSettings.seo.defaultTitle')}
                      </label>
                      <input
                        id={`editor-page-seo-title-${page.id}`}
                        className="editor-input editor-input--compact"
                        key={`${page.id}-seo-title-${page.seoTitle}`}
                        defaultValue={page.seoTitle}
                        placeholder={t('editor.page.seoTitlePlaceholder')}
                        onBlur={(event) => onUpdatePageSeo(page.id, { seoTitle: event.target.value })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.currentTarget.blur()
                          }
                        }}
                      />
                    </div>

                    <div className="editor-field editor-field--inline">
                      <label
                        className="editor-field__label"
                        htmlFor={`editor-page-seo-description-${page.id}`}
                      >
                        {t('siteSettings.seo.metaDescription')}
                      </label>
                      <textarea
                        id={`editor-page-seo-description-${page.id}`}
                        className="editor-input editor-input--compact editor-textarea"
                        key={`${page.id}-seo-description-${page.seoDescription}`}
                        rows={2}
                        defaultValue={page.seoDescription}
                        placeholder={t('editor.page.seoDescriptionPlaceholder')}
                        onBlur={(event) =>
                          onUpdatePageSeo(page.id, { seoDescription: event.target.value })
                        }
                      />
                    </div>

                    {pageSeoIsInherited(page) ? (
                      <p className="editor-field__hint">
                        {t('editor.page.seoInheritedNote')}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="editor-row-actions">
                  <button
                    type="button"
                    className="editor-icon-button"
                    disabled={index === 0}
                    aria-label={t('editor.sidebar.movePageUp')}
                    onClick={() => onMovePage(page.id, -1)}
                  >
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="editor-icon-button"
                    disabled={index === document.pages.length - 1}
                    aria-label={t('editor.sidebar.movePageDown')}
                    onClick={() => onMovePage(page.id, 1)}
                  >
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  {!isHome ? (
                    <button
                      type="button"
                      className="editor-icon-button"
                      aria-label={t('editor.page.setHome', { name: page.name })}
                      onClick={() => onSetHomePage(page.id)}
                    >
                      <Globe size={14} aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="editor-icon-button"
                    aria-label={t('editor.page.duplicate', { name: page.name })}
                    onClick={() => onDuplicatePage(page.id)}
                  >
                    <Copy size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="editor-icon-button editor-icon-button--danger"
                    disabled={!canDelete}
                    aria-label={t('editor.sidebar.deletePage')}
                    onClick={() => onRequestDeletePage(page)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="btn btn--accent btn--sm editor-pages-add"
        onClick={onOpenCreate}
      >
        <Plus size={14} aria-hidden="true" />
        {t('editor.page.createAction')}
      </button>
    </EditorPanelGroup>
  )
}

export default EditorPagesPanel
