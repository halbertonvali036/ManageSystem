import { Search, X } from 'lucide-react'
import { COURSE_STATUS } from '@/models/course'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: COURSE_STATUS.ACTIVE, label: 'Active' },
  { value: COURSE_STATUS.INACTIVE, label: 'Inactive' },
  { value: COURSE_STATUS.ARCHIVED, label: 'Archived' },
]

function StudentCoursesToolbar({
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
            placeholder="Search code or name&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search my courses"
          />
        </div>

        <select
          className="field-select"
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Filter my courses by status"
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

export default StudentCoursesToolbar