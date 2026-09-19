import { Plus, Search, X } from 'lucide-react'
import { SUBJECT_STATUS } from '@/models/subject'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: SUBJECT_STATUS.ACTIVE, label: 'Active' },
  { value: SUBJECT_STATUS.INACTIVE, label: 'Inactive' },
  { value: SUBJECT_STATUS.ARCHIVED, label: 'Archived' },
]

function SubjectsToolbar({
  search,
  onSearchChange,
  departments,
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
            aria-label="Search subjects"
          />
        </div>

        <select
          className="field-select"
          value={departmentFilter}
          onChange={(event) => onDepartmentChange(event.target.value)}
          aria-label="Filter by department"
          disabled={departments.length === 0}
          title={
            departments.length === 0
              ? 'No departments available yet'
              : 'Filter by department'
          }
        >
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
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
        Add Subject
      </button>
    </div>
  )
}

export default SubjectsToolbar