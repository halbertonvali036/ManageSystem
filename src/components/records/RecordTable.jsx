import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { FIELD_TYPE, normalizeFieldType } from '@/models/database'
import { formatRecordValue, RECORD_SORT_DIRECTION } from '@/models/record'

/**
 * Records table — every column comes from the model's fields.
 *
 * There is no column list in this component: a field added to the model becomes a
 * column, a field removed disappears, and the cells are formatted by the field's
 * own type. Column headers are sort buttons, and `aria-sort` is set on the
 * active cell so the current order is announced rather than only drawn.
 *
 * A model with no fields has no columns to draw, so the table says so and points
 * back at the model instead of rendering an empty shell.
 */
function RecordTable({
  model,
  workspaceId,
  fields = [],
  records = [],
  sortKey,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}) {
  const { t, locale } = useTranslation()

  if (fields.length === 0) {
    return (
      <div className="table-state">
        <p className="table-state__title">{t('database.records.noFieldsTitle')}</p>
        <p className="table-state__text">{t('database.records.noFieldsText')}</p>
        <Link
          className="btn btn--ghost"
          to={`/workspaces/${workspaceId}/database/models/${model.id}`}
        >
          {t('database.records.noFieldsCta')}
        </Link>
      </div>
    )
  }

  const displayOptions = {
    locale,
    trueLabel: t('database.records.form.yes'),
    falseLabel: t('database.records.form.no'),
    emptyLabel: t('database.records.notSet'),
  }

  const sortState = (key) => {
    if (sortKey !== key) return 'none'
    return sortDirection === RECORD_SORT_DIRECTION.ASC ? 'ascending' : 'descending'
  }

  return (
    <div className="table-responsive">
      <table className="admin-platform-table records-table">
        <caption className="visually-hidden">
          {t('database.records.tableCaption', { model: model.name, count: records.length })}
        </caption>
        <thead>
          <tr>
            {fields.map((field) => (
              <th
                key={field.key}
                scope="col"
                aria-sort={sortState(field.key)}
                className="records-table__head"
              >
                <button
                  type="button"
                  className="records-table__sort"
                  onClick={() => onSort(field.key)}
                  title={
                    sortKey === field.key
                      ? t(
                          sortDirection === RECORD_SORT_DIRECTION.ASC
                            ? 'database.records.sortDescending'
                            : 'database.records.sortAscending'
                        )
                      : t('database.records.sortByLabel')
                  }
                >
                  <span>{field.name}</span>
                  {sortKey === field.key ? (
                    sortDirection === RECORD_SORT_DIRECTION.ASC ? (
                      <ArrowUp size={14} aria-hidden="true" />
                    ) : (
                      <ArrowDown size={14} aria-hidden="true" />
                    )
                  ) : (
                    <ArrowUpDown size={14} aria-hidden="true" className="records-table__sort-idle" />
                  )}
                </button>
              </th>
            ))}
            <th scope="col" className="records-table__actions-head">
              {t('database.records.columnActions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id ?? JSON.stringify(record.values)}>
              {fields.map((field) => (
                <td key={field.key} className={cellClassName(field, record.values?.[field.key])}>
                  {formatRecordValue(field, record.values?.[field.key], displayOptions)}
                </td>
              ))}
              <td className="records-table__actions">
                <button
                  type="button"
                  className="records-table__action"
                  onClick={() => onView(record)}
                  aria-label={t('database.records.viewCta')}
                  title={t('database.records.viewCta')}
                >
                  <Eye size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="records-table__action"
                  onClick={() => onEdit(record)}
                  aria-label={t('database.records.editCta')}
                  title={t('database.records.editCta')}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="records-table__action records-table__action--danger"
                  onClick={() => onDelete(record)}
                  aria-label={t('database.records.deleteCta')}
                  title={t('database.records.deleteCta')}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Booleans read better in a badge than as bare text. */
function cellClassName(field, value) {
  return normalizeFieldType(field.type) === FIELD_TYPE.BOOLEAN && value !== null
    ? 'records-table__cell--boolean'
    : undefined
}

export default RecordTable
