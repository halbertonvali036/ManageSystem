import useTranslation from '@/hooks/useTranslation'
import { STAT_TRENDS } from '@/models/siteEditor'

/**
 * A metric card's content.
 *
 * The value and the change are plain text: the editor never parses a number, so
 * a user can write "1.2M", "€48,300" or "99.98%" and it stays exactly as typed.
 */
export default function StatSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const textField = (id, labelKey, name) => (
    <div className="editor-field">
      <label className="editor-field__label" htmlFor={id}>
        {t(labelKey)}
      </label>
      <input
        id={id}
        className="editor-input"
        value={content[name]}
        onChange={(event) => setField({ [name]: event.target.value })}
      />
    </div>
  )

  return (
    <>
      {textField('editor-stat-label', 'editor.stat.label', 'label')}
      {textField('editor-stat-value', 'editor.stat.value', 'value')}
      {textField('editor-stat-delta', 'editor.stat.delta', 'delta')}
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-stat-trend">
          {t('editor.stat.trend')}
        </label>
        <select
          id="editor-stat-trend"
          className="editor-input"
          value={content.trend}
          onChange={(event) => setField({ trend: event.target.value })}
        >
          {STAT_TRENDS.map((trend) => (
            <option key={trend} value={trend}>
              {t(`editor.stat.trend_${trend}`)}
            </option>
          ))}
        </select>
      </div>
      {textField('editor-stat-caption', 'editor.stat.caption', 'caption')}
    </>
  )
}
