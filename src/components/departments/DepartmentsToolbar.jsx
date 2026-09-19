import { Plus, Search, X } from 'lucide-react'
import { DEPARTMENT_STATUS } from '@/models/department'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: DEPARTMENT_STATUS.ACTIVE, label: 'Active' },
  { value: DEPARTMENT_STATUS.INACTIVE, label: 'Inactive' },
]

function DepartmentsToolbar({
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
            placeholder="Search code or name&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search departments"
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
        Add Department
      </button>
    </div>
  )
}

export default DepartmentsToolbar