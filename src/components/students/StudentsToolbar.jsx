import { Plus, Search, X } from 'lucide-react'
import { STUDENT_STATUS } from '@/models/student'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: STUDENT_STATUS.ACTIVE, label: 'Active' },
  { value: STUDENT_STATUS.INACTIVE, label: 'Inactive' },
  { value: STUDENT_STATUS.GRADUATED, label: 'Graduated' },
]

function StudentsToolbar({
  search,
  onSearchChange,
  classes = [],
  classNameFilter,
  onClassNameChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' || classNameFilter !== 'all' || statusFilter !== 'all'

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
            aria-label="Search students"
          />
        </div>

        <select
          className="field-select"
          value={classNameFilter}
          onChange={(event) => onClassNameChange(event.target.value)}
          aria-label="Filter by class"
        >
          {classes.length > 0 ? (
            <>
              <option value="all">All classes</option>
              {classes.map((classRecord) => (
                <option
                  key={classRecord.id ?? classRecord.classCode ?? classRecord}
                  value={classRecord.id ?? classRecord.classCode ?? classRecord}
                >
                  {classRecord.name || classRecord.className || classRecord.classCode || 'Class'}
                </option>
              ))}
            </>
          ) : (
            <option value="all">All classes</option>
          )}
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
        Add Student
      </button>
    </div>
  )
}

export default StudentsToolbar
