import { X } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { ACTIVITY_FILTER_ALL, ACTIVITY_TYPES, ACTIVITY_TYPE_LABEL_KEYS } from '@/models/activity'

/**
 * Filters for the event list: type, member, date range and search.
 *
 * Every control narrows the events that were already loaded — none of them asks the
 * server for anything, so switching a filter is instant and cannot fail halfway.
 *
 * The member list is built from the events themselves, so it can only offer a person
 * who appears in this trail. With no events there is no member to filter by, and the
 * control says so instead of listing every member of the workspace as though they
 * had all done something here.
 */
function ActivityFilters({ actors, filters, isFiltered, onFilterChange, onClear }) {
  const { t } = useTranslation()

  const handle = (key) => (event) => onFilterChange(key, event.target.value)

  return (
    <div className="act-filters">
      <div className="db-search act-filters__search">
        <label className="db-search__label" htmlFor="act-search">
          {t('workspaceActivity.filters.searchLabel')}
        </label>
        <input
          id="act-search"
          type="search"
          className="form__input db-search__input"
          value={filters.query}
          onChange={handle('query')}
          placeholder={t('workspaceActivity.filters.searchPlaceholder')}
        />
      </div>

      <label className="act-filters__field" htmlFor="act-type">
        <span className="visually-hidden">{t('workspaceActivity.filters.typeLabel')}</span>
        <select
          id="act-type"
          className="form__select"
          value={filters.type}
          onChange={handle('type')}
        >
          <option value={ACTIVITY_FILTER_ALL}>
            {t('workspaceActivity.filters.allTypes')}
          </option>
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(ACTIVITY_TYPE_LABEL_KEYS[type])}
            </option>
          ))}
        </select>
      </label>

      <label className="act-filters__field" htmlFor="act-actor">
        <span className="visually-hidden">{t('workspaceActivity.filters.actorLabel')}</span>
        <select
          id="act-actor"
          className="form__select"
          value={filters.actorId}
          onChange={handle('actorId')}
          disabled={actors.length === 0}
        >
          <option value={ACTIVITY_FILTER_ALL}>
            {actors.length === 0
              ? t('workspaceActivity.filters.noActors')
              : t('workspaceActivity.filters.allActors')}
          </option>
          {actors.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.name || actor.email}
            </option>
          ))}
        </select>
      </label>

      <div className="act-filters__range">
        <label className="act-filters__field" htmlFor="act-from">
          <span className="act-filters__range-label">
            {t('workspaceActivity.filters.fromLabel')}
          </span>
          <input
            id="act-from"
            type="date"
            className="form__input"
            value={filters.from}
            onChange={handle('from')}
          />
        </label>

        <span className="act-filters__range-separator" aria-hidden="true">
          –
        </span>

        <label className="act-filters__field" htmlFor="act-to">
          <span className="act-filters__range-label">
            {t('workspaceActivity.filters.toLabel')}
          </span>
          <input
            id="act-to"
            type="date"
            className="form__input"
            value={filters.to}
            onChange={handle('to')}
          />
        </label>
      </div>

      {isFiltered ? (
        <button type="button" className="btn btn--outline act-filters__clear" onClick={onClear}>
          <X size={14} aria-hidden="true" />
          {t('workspaceActivity.filters.clear')}
        </button>
      ) : null}
    </div>
  )
}

export default ActivityFilters
