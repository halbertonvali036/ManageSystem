import { Plus, Search, X } from 'lucide-react'
import { ACADEMIC_PERIOD_STATUS } from '@/models/academicYear'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: ACADEMIC_PERIOD_STATUS.UPCOMING, label: 'Upcoming' },
  { value: ACADEMIC_PERIOD_STATUS.ACTIVE, label: 'Active' },
  { value: ACADEMIC_PERIOD_STATUS.COMPLETED, label: 'Completed' },
]

function AcademicYearsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
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
            placeholder="Search academic year&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search academic years"
          />
        </div>

        <select
          className="field-select"
          value={statusFilter}
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

      <button
        type="button"
        className="btn btn--primary btn--icon-left students-toolbar__add"
        onClick={onAdd}
      >
        <Plus size={18} aria-hidden="true" />
        Add Academic Year
      </button>
    </div>
  )
}

export default AcademicYearsToolbar