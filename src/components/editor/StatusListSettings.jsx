import { Plus, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { MAX_STATUS_ITEMS, STATUS_TONES } from '@/models/siteEditor'

/** A status list: a heading and rows of a label, a value and a tone. */
export default function StatusListSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })
  const setItem = (index, patch) =>
    setField({
      items: content.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    })

  const addItem = () => {
    if (content.items.length >= MAX_STATUS_ITEMS) return
    setField({ items: [...content.items, { label: '', value: '', tone: 'neutral' }] })
  }

  const removeItem = (index) =>
    setField({ items: content.items.filter((_, itemIndex) => itemIndex !== index) })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-status-title">
          {t('editor.status.title')}
        </label>
        <input
          id="editor-status-title"
          className="editor-input"
          value={content.title}
          onChange={(event) => setField({ title: event.target.value })}
        />
      </div>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.status.items')}</span>
        {content.items.map((item, index) => (
          <div className="editor-status-item" key={index}>
            <div className="editor-status-item__fields">
              <input
                className="editor-input"
                value={item.label}
                aria-label={t('editor.status.label')}
                onChange={(event) => setItem(index, { label: event.target.value })}
              />
              <input
                className="editor-input"
                value={item.value}
                aria-label={t('editor.status.value')}
                onChange={(event) => setItem(index, { value: event.target.value })}
              />
            </div>
            <div className="editor-status-item__row">
              <select
                className="editor-input"
                value={item.tone}
                aria-label={t('editor.status.tone')}
                onChange={(event) => setItem(index, { tone: event.target.value })}
              >
                {STATUS_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {t(`editor.status.tone_${tone}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="editor-icon-button"
                aria-label={t('editor.status.removeItem')}
                onClick={() => removeItem(index)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.items.length >= MAX_STATUS_ITEMS}
          onClick={addItem}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.status.addItem')}
        </button>
      </div>
    </>
  )
}
