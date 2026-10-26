import { Plus, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { MAX_TOOLBAR_FILTERS } from '@/models/siteEditor'

/**
 * A filter/action bar.
 *
 * The fields are labels, not live controls: on the page the bar is drawn inert,
 * so what a user edits here is the text a later integration would wire up.
 */
export default function ToolbarSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const addFilter = () => {
    if (content.filters.length >= MAX_TOOLBAR_FILTERS) return
    setField({ filters: [...content.filters, ''] })
  }

  const removeFilter = (index) =>
    setField({ filters: content.filters.filter((_, filterIndex) => filterIndex !== index) })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-toolbar-search">
          {t('editor.toolbar.search')}
        </label>
        <input
          id="editor-toolbar-search"
          className="editor-input"
          value={content.search}
          onChange={(event) => setField({ search: event.target.value })}
        />
      </div>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.toolbar.filters')}</span>
        {content.filters.map((filter, index) => (
          <div className="editor-repeat-row" key={index}>
            <input
              className="editor-input"
              value={filter}
              aria-label={t('editor.toolbar.filter')}
              onChange={(event) =>
                setField({
                  filters: content.filters.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                })
              }
            />
            <button
              type="button"
              className="editor-icon-button"
              aria-label={t('editor.toolbar.removeFilter')}
              onClick={() => removeFilter(index)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.filters.length >= MAX_TOOLBAR_FILTERS}
          onClick={addFilter}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.toolbar.addFilter')}
        </button>
      </div>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-toolbar-action">
          {t('editor.toolbar.action')}
        </label>
        <input
          id="editor-toolbar-action"
          className="editor-input"
          value={content.action}
          onChange={(event) => setField({ action: event.target.value })}
        />
      </div>
    </>
  )
}
