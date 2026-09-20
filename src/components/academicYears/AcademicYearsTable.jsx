import { CalendarRange, Eye, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import AcademicPeriodStatusBadge from '@/components/academicYears/AcademicPeriodStatusBadge'
import {
  formatAcademicPeriodDate,
  formatAcademicYearName,
} from '@/models/academicYear'

const COLUMNS = [
  { key: 'name', label: 'Academic Year' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading academic years&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load academic years</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState({ onAdd }) {
  return (
    <Card>
      <div className="table-state">
        <CalendarRange
          className="table-state__icon"
          size={40}
          aria-hidden="true"
        />
        <h3 className="table-state__title">No academic years yet</h3>
        <p className="table-state__text">
          Academic year records will appear here once data is available.
        </p>
        {onAdd ? (
          <button
            type="button"
            className="btn btn--primary btn--icon-left"
            onClick={onAdd}
          >
            <CalendarRange size={16} aria-hidden="true" />
            Add Academic Year
          </button>
        ) : null}
      </div>
    </Card>
  )
}

function AcademicYearsTable({
  academicYears,
  isLoading,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
  onAdd,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (academicYears.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <div className="table-responsive">
      <table className="academic-years-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {academicYears.map((academicYear) => (
            <tr
              key={academicYear.id}
              onClick={() => onView?.(academicYear)}
            >
              <td className="academic-years-table__name">
                {formatAcademicYearName(academicYear)}
              </td>
              <td>{formatAcademicPeriodDate(academicYear.startDate)}</td>
              <td>{formatAcademicPeriodDate(academicYear.endDate)}</td>
              <td>
                <AcademicPeriodStatusBadge status={academicYear.status} />
              </td>
              <td>
                <div className="students-table__actions">
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="View academic year"
                    title="View academic year"
                    disabled={!onView}
                    onClick={(event) => {
                      event.stopPropagation()
                      onView?.(academicYear)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="Edit academic year"
                    title="Edit academic year"
                    disabled={!onEdit}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(academicYear)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action students-table__action--danger"
                    aria-label="Delete academic year"
                    title="Delete academic year"
                    disabled={!onDelete}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete?.(academicYear)
                    }}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AcademicYearsTable