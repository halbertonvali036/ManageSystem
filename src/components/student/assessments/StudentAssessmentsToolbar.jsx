import { Search, X } from 'lucide-react'
import { ASSESSMENT_TYPE_LABELS } from '@/models/assessment'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

function StudentAssessmentsToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  onClearFilters,
}) {
  const hasActiveFilters = search !== '' || typeFilter !== 'all'

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search assessment title&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search my assessments"
          />
        </div>

        <select
          className="field-select"
          value={typeFilter}
          onChange={(event) => onTypeChange(event.target.value)}
          aria-label="Filter by assessment type"
        >
          {TYPE_OPTIONS.map((option) => (
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

export default StudentAssessmentsToolbar