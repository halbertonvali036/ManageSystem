import { Search, SlidersHorizontal, X } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { ALL_RECORDS_FILTER, NO_RECORD_SORT, RECORD_SORT_DIRECTION } from '@/models/record'

/**
 * Search / filter / sort bar for one model's records.
 *
 * The control set follows the schema: only fields that can hold a comparable
 * value are offered, and the value select is filled from the records that were
 * actually loaded. Nothing here queries the server — the toolbar narrows what is
 * already on the page, so the counts it shows always match the table below.
 */
function RecordsToolbar({
  fields = [],
  query,
  onQueryChange,
  filterField,
  onFilterFieldChange,
  filterValue,
  onFilterValueChange,
  filterOptions = [],
  sortKey,
  sortDirection,
  onSortChange,
  isFiltered,
  onClear,
  isDisabled = false,
}) {
  const { t } = useTranslation()

  return (
    <div className="records-toolbar">
      <div className="records-toolbar__search">
        <Search size={16} aria-hidden="true" className="sites-toolbar__search-icon" />
        <label className="visually-hidden" htmlFor="records-search">
          {t('database.records.searchLabel')}
        </label>
        <input
          id="records-search"
          type="search"
          className="form__input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('database.records.searchPlaceholder')}
          disabled={isDisabled}
        />
      </div>

      <div className="records-toolbar__group">
        <SlidersHorizontal size={16} aria-hidden="true" />
        <label className="visually-hidden" htmlFor="records-filter-field">
          {t('database.records.filterFieldLabel')}
        </label>
        <select
          id="records-filter-field"
          className="form__select"
          value={filterField}
          onChange={(event) => onFilterFieldChange(event.target.value)}
          disabled={isDisabled}
        >
          <option value="">{t('database.records.filterAllFields')}</option>
          {fields.map((field) => (
            <option key={field.key} value={field.key}>
              {field.name}
            </option>
          ))}
        </select>

        <label className="visually-hidden" htmlFor="records-filter-value">
          {t('database.records.filterValueLabel')}
        </label>
        <select
          id="records-filter-value"
          className="form__select"
          value={filterValue}
          onChange={(event) => onFilterValueChange(event.target.value)}
          disabled={isDisabled || !filterField}
        >
          <option value={ALL_RECORDS_FILTER}>{t('database.records.filterAllValues')}</option>
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="records-toolbar__group">
        <label className="visually-hidden" htmlFor="records-sort-field">
          {t('database.records.sortByLabel')}
        </label>
        <select
          id="records-sort-field"
          className="form__select"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value, sortDirection)}
          disabled={isDisabled}
        >
          <option value={NO_RECORD_SORT}>{t('database.records.sortNone')}</option>
          {fields.map((field) => (
            <option key={field.key} value={field.key}>
              {field.name}
            </option>
          ))}
        </select>

        <label className="visually-hidden" htmlFor="records-sort-direction">
          {t('database.records.sortDirectionLabel')}
        </label>
        <select
          id="records-sort-direction"
          className="form__select"
          value={sortDirection}
          onChange={(event) => onSortChange(sortKey, event.target.value)}
          disabled={isDisabled || sortKey === NO_RECORD_SORT}
        >
          <option value={RECORD_SORT_DIRECTION.ASC}>{t('database.records.sortAscending')}</option>
          <option value={RECORD_SORT_DIRECTION.DESC}>{t('database.records.sortDescending')}</option>
        </select>
      </div>

      {isFiltered ? (
        <button type="button" className="btn btn--ghost records-toolbar__clear" onClick={onClear}>
          <X size={16} aria-hidden="true" />
          {t('database.records.clearFilters')}
        </button>
      ) : null}
    </div>
  )
}

export default RecordsToolbar
