import { Plus, Search, X } from 'lucide-react'
import {
  ANNOUNCEMENT_AUDIENCE_OPTIONS,
  ANNOUNCEMENT_STATUS,
} from '@/models/announcement'
import { formatAcademicYearName } from '@/models/academicYear'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: ANNOUNCEMENT_STATUS.DRAFT, label: 'Draft' },
  { value: ANNOUNCEMENT_STATUS.PUBLISHED, label: 'Published' },
  { value: ANNOUNCEMENT_STATUS.ARCHIVED, label: 'Archived' },
]

function AnnouncementsToolbar({
  search,
  onSearchChange,
  audienceFilter,
  onAudienceChange,
  statusFilter,
  onStatusChange,
  academicYears = [],
  academicYearsLoading = false,
  academicYearId,
  onAcademicYearChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' ||
    audienceFilter !== 'all' ||
    statusFilter !== 'all' ||
    String(academicYearId) !== ''

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
          value={String(audienceFilter)}
          onChange={(event) => onAudienceChange(event.target.value)}
          aria-label="Filter by audience"
        >
          <option value="all">All audiences</option>
          {ANNOUNCEMENT_AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

        <select
          className="field-select"
          value={String(academicYearId)}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          aria-label="Filter by academic year"
          disabled={academicYearsLoading}
        >
          <option value="">All academic years</option>
          {academicYears.map((academicYear) => (
            <option
              key={academicYear.id ?? formatAcademicYearName(academicYear)}
              value={String(academicYear.id ?? '')}
            >
              {formatAcademicYearName(academicYear)}
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
        Add Announcement
      </button>
    </div>
  )
}

export default AnnouncementsToolbar