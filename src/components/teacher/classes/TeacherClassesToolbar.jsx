import { Search, X } from 'lucide-react'
import { CLASS_STATUS } from '@/models/class'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: CLASS_STATUS.SCHEDULED, label: 'Scheduled' },
  { value: CLASS_STATUS.ACTIVE, label: 'Active' },
  { value: CLASS_STATUS.COMPLETED, label: 'Completed' },
]

function TeacherClassesToolbar({
  search,
  onSearchChange,
  academicYears = [],
  academicYearFilter,
  onAcademicYearChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
}) {
  const hasActiveFilters =
    search !== '' || academicYearFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search code, name, course or room&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search my classes"
          />
        </div>

        <select
          className="field-select"
          value={academicYearFilter}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          aria-label="Filter by academic year"
        >
          <option value="all">All academic years</option>
          {academicYears.map((academicYear) => (
            <option key={academicYear} value={academicYear}>
              {academicYear}
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
    </div>
  )
}

export default TeacherClassesToolbar