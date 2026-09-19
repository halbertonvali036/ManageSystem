import { Eye, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import RoleStatusBadge from '@/components/roles/RoleStatusBadge'
import {
  formatRoleDescription,
  formatRoleName,
  formatRoleUserCount,
} from '@/models/role'

const COLUMNS = [
  { key: 'role', label: 'Role' },
  { key: 'description', label: 'Description' },
  { key: 'users', label: 'Users' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading roles&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load roles</h3>
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
        <ShieldCheck className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No roles yet</h3>
        <p className="table-state__text">
          Role records will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function RolesTable({
  roles,
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

  if (roles.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="roles-table">
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
          {roles.map((role) => (
            <tr key={role.id} onClick={() => onView?.(role)}>
              <td className="roles-table__name">{formatRoleName(role)}</td>
              <td>{formatRoleDescription(role)}</td>
              <td className="roles-table__users">{formatRoleUserCount(role)}</td>
              <td>
                <RoleStatusBadge status={role.status} />
              </td>
              <td>
                <div className="students-table__actions">
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="View role"
                    title="View role"
                    disabled={!onView}
                    onClick={(event) => {
                      event.stopPropagation()
                      onView?.(role)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="Edit role"
                    title="Edit role"
                    disabled={!onEdit}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(role)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action students-table__action--danger"
                    aria-label="Delete role"
                    title="Delete role"
                    disabled={!onDelete}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete?.(role)
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

export default RolesTable