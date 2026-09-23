import { Plus, Search, X } from 'lucide-react'
import { TEACHER_STATUS } from '@/models/teacher'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: TEACHER_STATUS.ACTIVE, label: 'Active' },
  { value: TEACHER_STATUS.ON_LEAVE, label: 'On Leave' },
  { value: TEACHER_STATUS.INACTIVE, label: 'Inactive' },
]

function TeachersToolbar({
  search,
  onSearchChange,
  departments = [],
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' || departmentFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="students-toolbar students-toolbar--data">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search name, email or ID&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search teachers"
          />
        </div>

        <select
          className="field-select"
          value={departmentFilter}
          onChange={(event) => onDepartmentChange(event.target.value)}
          aria-label="Filter by department"
        >
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

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
        Add Teacher
      </button>
    </div>
  )
}

export default TeachersToolbar
