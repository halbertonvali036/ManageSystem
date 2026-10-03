import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Link2,
  ListTree,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import { MENU_ITEM_TYPE, isMenuItemLinked, isSafeLinkUrl } from '@/models/siteNavigation'
import { getMenuItemText, getNavigationItems } from '@/models/siteEditor'

/**
 * The `Naviqasiya` panel.
 *
 * The menu is site-wide, so it lives in its own panel rather than inside the page
 * card: changing it while a page is open does not change the page.
 *
 * Each row is a link with a label and a target. The target is either a page from
 * this document or an address the user types, chosen with a two-way switch. An
 * item whose page has been deleted is kept and marked, because silently dropping a
 * row the user can see would be worse than showing them it needs choosing again.
 *
 * The url field is validated as it is typed but never rewritten under the user's
 * hands. Showing the raw value with a warning means the model stays the only place
 * that decides what is safe to put in an `href`, and the user can see exactly what
 * they typed when the warning appears.
 */
function EditorNavigationPanel({
  document,
  onAddMenuItem,
  onUpdateMenuItem,
  onRequestDeleteMenuItem,
  onToggleMenuItem,
  onMoveMenuItem,
  onBuildFromPages,
  onClearMenu,
}) {
  const { t } = useTranslation()
  const items = getNavigationItems(document)

  return (
    <EditorPanelGroup title={<>
        <ListTree size={15} aria-hidden="true" />
        {t('editor.nav.title')}
      </>}>
      <p className="editor-panel__hint">{t('editor.nav.hint')}</p>

      {items.length ? (
        <ul className="editor-nav-list">
          {items.map((item, index) => {
            const isLinked = isMenuItemLinked(item, document.pages)
            const isExternal = item.type === MENU_ITEM_TYPE.EXTERNAL
            const urlIsValid = isExternal ? isSafeLinkUrl(item.url) : true
            const pageName =
              item.type === MENU_ITEM_TYPE.PAGE
                ? document.pages.find((page) => page.id === item.pageId)?.name
                : null
            const displayLabel = getMenuItemText(document, item)

            return (
              <li
                key={item.id}
                className="editor-nav-list__item"
                data-hidden={item.visible ? undefined : 'true'}
                data-unlinked={isLinked ? undefined : 'true'}
              >
                <div className="editor-nav-list__head">
                  <div className="editor-field editor-field--inline">
                    <label
                      className="editor-visually-hidden"
                      htmlFor={`editor-nav-label-${item.id}`}
                    >
                      {t('editor.nav.labelField', { position: index + 1 })}
                    </label>
                    <input
                      id={`editor-nav-label-${item.id}`}
                      className="editor-input editor-input--compact"
                      value={item.label}
                      maxLength={80}
                      placeholder={pageName ?? t('editor.nav.labelPlaceholder')}
                      onChange={(event) => onUpdateMenuItem(item.id, { label: event.target.value })}
                    />
                  </div>

                  <div className="editor-row-actions">
                    <button
                      type="button"
                      className="editor-icon-button"
                      disabled={index === 0}
                      aria-label={t('editor.nav.moveUp', { name: displayLabel || t('editor.nav.item', { position: index + 1 }) })}
                      onClick={() => onMoveMenuItem(item.id, -1)}
                    >
                      <ChevronUp size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="editor-icon-button"
                      disabled={index === items.length - 1}
                      aria-label={t('editor.nav.moveDown', { name: displayLabel || t('editor.nav.item', { position: index + 1 }) })}
                      onClick={() => onMoveMenuItem(item.id, 1)}
                    >
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="editor-icon-button"
                      aria-pressed={item.visible}
                      aria-label={t(
                        item.visible ? 'editor.nav.hide' : 'editor.nav.show',
                        { name: displayLabel || t('editor.nav.item', { position: index + 1 }) },
                      )}
                      onClick={() => onToggleMenuItem(item.id)}
                    >
                      {item.visible ? (
                        <Eye size={14} aria-hidden="true" />
                      ) : (
                        <EyeOff size={14} aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="editor-icon-button editor-icon-button--danger"
                      aria-label={t('editor.nav.delete', { name: displayLabel || t('editor.nav.item', { position: index + 1 }) })}
                      onClick={() => onRequestDeleteMenuItem(item)}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div
                  className="editor-nav-list__type"
                  role="group"
                  aria-label={t('editor.nav.targetField', { position: index + 1 })}
                >
                  <button
                    type="button"
                    className="editor-chip"
                    aria-pressed={!isExternal}
                    onClick={() => onUpdateMenuItem(item.id, { type: MENU_ITEM_TYPE.PAGE })}
                  >
                    {t('editor.nav.typePage')}
                  </button>
                  <button
                    type="button"
                    className="editor-chip"
                    aria-pressed={isExternal}
                    onClick={() => onUpdateMenuItem(item.id, { type: MENU_ITEM_TYPE.EXTERNAL })}
                  >
                    {t('editor.nav.typeExternal')}
                  </button>
                </div>

                {isExternal ? (
                  <div className="editor-field editor-field--inline">
                    <label
                      className="editor-visually-hidden"
                      htmlFor={`editor-nav-url-${item.id}`}
                    >
                      {t('editor.nav.urlField', { position: index + 1 })}
                    </label>
                    <input
                      id={`editor-nav-url-${item.id}`}
                      className="editor-input editor-input--compact editor-input--mono"
                      value={item.url}
                      maxLength={300}
                      placeholder="https://"
                      aria-invalid={urlIsValid ? undefined : 'true'}
                      onChange={(event) => onUpdateMenuItem(item.id, { url: event.target.value })}
                    />
                    {!urlIsValid ? (
                      <p className="editor-field__hint is-error">{t('editor.nav.urlInvalid')}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="editor-field editor-field--inline">
                    <label
                      className="editor-visually-hidden"
                      htmlFor={`editor-nav-page-${item.id}`}
                    >
                      {t('editor.nav.pageField', { position: index + 1 })}
                    </label>
                    <select
                      id={`editor-nav-page-${item.id}`}
                      className="editor-input editor-input--compact"
                      value={item.pageId ?? ''}
                      aria-invalid={isLinked ? undefined : 'true'}
                      onChange={(event) => onUpdateMenuItem(item.id, { pageId: event.target.value })}
                    >
                      <option value="">{t('editor.nav.choosePage')}</option>
                      {document.pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                          {page.isHome ? ` (${t('editor.page.homeBadge')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!isLinked ? <p className="editor-field__hint is-warning">{t('editor.nav.unlinked')}</p> : null}
                {isExternal && !item.visible ? (
                  <p className="editor-field__hint">{t('editor.nav.hiddenNote')}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="editor-panel__empty">{t('editor.nav.empty')}</p>
      )}

      <div className="editor-nav-actions">
        <button
          type="button"
          className="btn btn--accent btn--sm"
          onClick={() => onAddMenuItem({ type: MENU_ITEM_TYPE.PAGE, pageId: null })}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.nav.addAction')}
        </button>

        {/*
          Two separate actions, not one smart button. "Build from pages" replaces
          the menu and "clear" empties it; folding them together would mean a
          single control whose result depends on state the user cannot see.
        */}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={onBuildFromPages}
        >
          <Wand2 size={14} aria-hidden="true" />
          {t('editor.nav.buildAction')}
        </button>

        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={!items.length}
          onClick={onClearMenu}
        >
          <Trash2 size={14} aria-hidden="true" />
          {t('editor.nav.clearAction')}
        </button>
      </div>

      <p className="editor-panel__note">
        <Link2 size={12} aria-hidden="true" />
        {t('editor.nav.localOnly')}
      </p>
    </EditorPanelGroup>
  )
}

export default EditorNavigationPanel
