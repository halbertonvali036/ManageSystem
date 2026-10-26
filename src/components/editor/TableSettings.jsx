import { Plus, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { MAX_TABLE_COLUMNS, MAX_TABLE_ROWS } from '@/models/siteEditor'

/**
 * A data table's content.
 *
 * Columns and rows are edited independently: the model pads or trims a row to the
 * header width on save, so adding or removing a column never needs a separate
 * pass over every row here.
 */
export default function TableSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const setColumn = (index, value) =>
    setField({ columns: content.columns.map((column, i) => (i === index ? value : column)) })

  const setCell = (rowIndex, columnIndex, value) =>
    setField({
      rows: content.rows.map((row, index) =>
        index === rowIndex ? row.map((cell, cellIndex) => (cellIndex === columnIndex ? value : cell)) : row,
      ),
    })

  const addColumn = () => {
    if (content.columns.length >= MAX_TABLE_COLUMNS) return
    setField({ columns: [...content.columns, ''] })
  }

  const removeColumn = (index) => {
    if (content.columns.length <= 1) return
    setField({ columns: content.columns.filter((_, column) => column !== index) })
  }

  const addRow = () => {
    if (content.rows.length >= MAX_TABLE_ROWS) return
    setField({ rows: [...content.rows, content.columns.map(() => '')] })
  }

  const removeRow = (index) => setField({ rows: content.rows.filter((_, row) => row !== index) })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-table-caption">
          {t('editor.table.caption')}
        </label>
        <input
          id="editor-table-caption"
          className="editor-input"
          value={content.caption}
          onChange={(event) => setField({ caption: event.target.value })}
        />
      </div>

      <div className="editor-field">
        <span className="editor-field__label">{t('editor.table.columns')}</span>
        {content.columns.map((column, index) => (
          <div className="editor-repeat-row" key={index}>
            <input
              className="editor-input"
              value={column}
              aria-label={t('editor.table.column')}
              onChange={(event) => setColumn(index, event.target.value)}
            />
            <button
              type="button"
              className="editor-icon-button"
              aria-label={t('editor.table.removeColumn')}
              disabled={content.columns.length <= 1}
              onClick={() => removeColumn(index)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.columns.length >= MAX_TABLE_COLUMNS}
          onClick={addColumn}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.table.addColumn')}
        </button>
      </div>

      <div className="editor-field">
        <span className="editor-field__label">{t('editor.table.rows')}</span>
        {content.rows.map((row, rowIndex) => (
          <div className="editor-table-row" key={rowIndex}>
            <span className="editor-table-row__index">{rowIndex + 1}</span>
            <div className="editor-table-row__cells">
              {row.map((cell, columnIndex) => (
                <input
                  key={columnIndex}
                  className="editor-input"
                  value={cell}
                  aria-label={t('editor.table.cell', { row: rowIndex + 1, column: columnIndex + 1 })}
                  onChange={(event) => setCell(rowIndex, columnIndex, event.target.value)}
                />
              ))}
            </div>
            <button
              type="button"
              className="editor-icon-button"
              aria-label={t('editor.table.removeRow')}
              onClick={() => removeRow(rowIndex)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.rows.length >= MAX_TABLE_ROWS}
          onClick={addRow}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.table.addRow')}
        </button>
      </div>
    </>
  )
}
