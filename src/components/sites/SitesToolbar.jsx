import { useId } from 'react'
import { Search, X } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  ALL_SITES_FILTER,
  SITE_STATUS_FILTERS,
  SITE_STATUS_LABEL_KEYS,
} from '@/models/site'

/**
 * Search and status filter for the project list.
 *
 * Both controls filter already-loaded projects in the browser. There is no
 * sample data behind them, so an empty result is reported honestly rather than
 * padded. The counts come from the loaded projects, so each option says how many
 * of the account's own projects it would show.
 */
function SitesToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  onClear,
  counts,
}) {
  const { t } = useTranslation()
  const searchId = useId()
  const filterId = useId()

  const hasFilters = query.trim().length > 0 || status !== ALL_SITES_FILTER
  const withCount = (value, label) =>
    counts ? `${label} (${value})` : label

  return (
    <div className="sites-toolbar">
      <div className="sites-toolbar__search">
        <label className="visually-hidden" htmlFor={searchId}>
          {t('sites.searchLabel')}
        </label>
        <Search
          className="sites-toolbar__search-icon"
          size={16}
          aria-hidden="true"
        />
        <input
          id={searchId}
          className="sites-toolbar__input"
          type="search"
          value={query}
          placeholder={t('sites.searchPlaceholder')}
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="sites-toolbar__filter">
        <label className="visually-hidden" htmlFor={filterId}>
          {t('sites.filterLabel')}
        </label>
        <select
          id={filterId}
          className="sites-toolbar__select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value={ALL_SITES_FILTER}>
            {counts
              ? withCount(
                  Object.values(counts).reduce((sum, n) => sum + n, 0),
                  t('sites.filterAll'),
                )
              : t('sites.filterAll')}
          </option>
          {SITE_STATUS_FILTERS.map((value) => (
            <option key={value} value={value}>
              {withCount(
                counts?.[value] ?? 0,
                t(SITE_STATUS_LABEL_KEYS[value]),
              )}
            </option>
          ))}
        </select>
      </div>

      {hasFilters ? (
        <button
          type="button"
          className="btn btn--ghost sites-toolbar__clear"
          onClick={onClear}
        >
          <X size={15} aria-hidden="true" />
          {t('sites.clearFilters')}
        </button>
      ) : null}
    </div>
  )
}

export default SitesToolbar
