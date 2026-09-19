import { Building2, Eye, Pencil, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import DepartmentStatusBadge from '@/components/departments/DepartmentStatusBadge'
import {
  formatDepartmentCode,
  formatDepartmentHead,
  formatDepartmentName,
} from '@/models/department'

const COLUMNS = [
  { key: 'code', label: 'Code' },
  { key: 'department', label: 'Department' },
  { key: 'head', label: 'Head' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading departments&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load departments</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <div className="table-state">
        <Building2 className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No departments yet</h3>
        <p className="table-state__text">
          Department records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function DepartmentsTable({
  departments,
  isLoading,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (departments.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="departments-table">
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
          {departments.map((department) => (
            <tr key={department.id} onClick={() => onView?.(department)}>
              <td className="departments-table__code">
                {formatDepartmentCode(department)}
              </td>
              <td className="departments-table__name">
                {formatDepartmentName(department)}
              </td>
              <td>{formatDepartmentHead(department)}</td>
              <td>
                <DepartmentStatusBadge status={department.status} />
              </td>
              <td>
                <div className="students-table__actions">
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="View department"
                    title="View department"
                    disabled={!onView}
                    onClick={(event) => {
                      event.stopPropagation()
                      onView?.(department)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="Edit department"
                    title="Edit department"
                    disabled={!onEdit}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(department)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action students-table__action--danger"
                    aria-label="Delete department"
                    title="Delete department"
                    disabled={!onDelete}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete?.(department)
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

export default DepartmentsTable