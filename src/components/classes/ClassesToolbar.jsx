import { Plus, Search, X } from 'lucide-react'
import { CLASS_STATUS } from '@/models/class'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: CLASS_STATUS.SCHEDULED, label: 'Scheduled' },
  { value: CLASS_STATUS.ACTIVE, label: 'Active' },
  { value: CLASS_STATUS.COMPLETED, label: 'Completed' },
]

const toAcademicYearValue = (academicYear) =>
  academicYear?.name ??
  academicYear?.academicYear ??
  (typeof academicYear === 'string' ? academicYear : academicYear?.id) ??
  ''

const toSemesterValue = (semester) =>
  semester?.name ??
  semester?.semester ??
  (typeof semester === 'string' ? semester : semester?.id) ??
  ''

function ClassesToolbar({
  search,
  onSearchChange,
  academicYears = [],
  academicYearsLoading = false,
  academicYearFilter,
  onAcademicYearChange,
  semesters = [],
  semestersLoading = false,
  semesterFilter,
  onSemesterChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' ||
    academicYearFilter !== 'all' ||
    semesterFilter !== 'all' ||
    statusFilter !== 'all'

  const yearsAvailable = academicYears.length > 0
  const semesterOptions = semesters.map((semester) => ({
    value: String(toSemesterValue(semester)).trim(),
    label: toSemesterValue(semester) || '—',
  }))
  const semestersAvailable = semesterOptions.length > 0

  return (
    <div className="students-toolbar students-toolbar--data">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search code, name, course or room&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search classes"
          />
        </div>

        <select
          className="field-select"
          value={academicYearFilter}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          aria-label="Filter by academic year"
          disabled={academicYearsLoading || !yearsAvailable}
          title={
            academicYearsLoading
              ? 'Loading academic years\u2026'
              : yearsAvailable
                ? 'Filter by academic year'
                : 'No academic years available yet'
          }
        >
          <option value="all">
            {academicYearsLoading
              ? 'Loading academic years\u2026'
              : yearsAvailable
                ? 'All academic years'
                : 'No academic years available'}
          </option>
          {academicYears.map((academicYear) => {
            const value = toAcademicYearValue(academicYear)
            return (
              <option key={value} value={value}>
                {value}
              </option>
            )
          })}
        </select>

        <select
          className="field-select"
          value={semesterFilter}
          onChange={(event) => onSemesterChange(event.target.value)}
          aria-label="Filter by semester"
          disabled={!academicYearFilter || academicYearFilter === 'all' || semestersLoading}
          title={
            academicYearFilter === 'all'
              ? 'Select an academic year first'
              : semestersLoading
                ? 'Loading semesters\u2026'
                : semestersAvailable
                  ? 'Filter by semester'
                  : 'No semesters for this academic year'
          }
        >
          <option value="all">
            {semestersLoading && academicYearFilter !== 'all'
              ? 'Loading semesters\u2026'
              : academicYearFilter === 'all'
                ? 'All semesters'
                : semestersAvailable
                  ? 'All semesters'
                  : 'No semesters available'}
          </option>
          {semesterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
        Add Class
      </button>
    </div>
  )
}

export default ClassesToolbar
