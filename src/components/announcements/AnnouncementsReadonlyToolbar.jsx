import { Search, X } from 'lucide-react'
import { ANNOUNCEMENT_STATUS } from '@/models/announcement'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: ANNOUNCEMENT_STATUS.DRAFT, label: 'Draft' },
  { value: ANNOUNCEMENT_STATUS.PUBLISHED, label: 'Published' },
  { value: ANNOUNCEMENT_STATUS.ARCHIVED, label: 'Archived' },
]

function AnnouncementsReadonlyToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
}) {
  const hasActiveFilters = search !== '' || statusFilter !== 'all'

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search announcements&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search announcements"
          />
        </div>

        <select
          className="field-select"
          value={String(statusFilter)}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActiveFilters ? (
          <button
            type="button"
            className="btn btn--icon-left"
            onClick={onClearFilters}
          >
            <X size={16} aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default AnnouncementsReadonlyToolbar