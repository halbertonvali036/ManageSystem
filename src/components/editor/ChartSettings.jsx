import useTranslation from '@/hooks/useTranslation'
import { CHART_VARIANTS } from '@/models/siteEditor'

/** A chart placeholder: a title, a shape and a caption. There is no data to edit. */
export default function ChartSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-chart-title">
          {t('editor.chart.title')}
        </label>
        <input
          id="editor-chart-title"
          className="editor-input"
          value={content.title}
          onChange={(event) => setField({ title: event.target.value })}
        />
      </div>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-chart-variant">
          {t('editor.chart.variant')}
        </label>
        <select
          id="editor-chart-variant"
          className="editor-input"
          value={content.variant}
          onChange={(event) => setField({ variant: event.target.value })}
        >
          {CHART_VARIANTS.map((variant) => (
            <option key={variant} value={variant}>
              {t(`editor.chart.variant_${variant}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-chart-caption">
          {t('editor.chart.caption')}
        </label>
        <input
          id="editor-chart-caption"
          className="editor-input"
          value={content.caption}
          onChange={(event) => setField({ caption: event.target.value })}
        />
      </div>
    </>
  )
}
