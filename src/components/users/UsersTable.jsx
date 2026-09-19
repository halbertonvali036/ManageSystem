import { Eye, Pencil, Trash2, Users as UsersIcon } from 'lucide-react'
import Card from '@/components/common/Card'
import UserStatusBadge from '@/components/users/UserStatusBadge'
import {
  formatLastLogin,
  formatUserEmail,
  formatUserName,
  formatUserRole,
} from '@/models/user'

const COLUMNS = [
  { key: 'user', label: 'User' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last Login' },
  { key: 'actions', label: 'Actions' },
]

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading users&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load users</h3>
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
        <UsersIcon className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No users yet</h3>
        <p className="table-state__text">
          User accounts will appear here once data is available.
        </p>
      </div>
    </Card>
  )
}

function UsersTable({
  users,
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

  if (users.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="table-responsive">
      <table className="users-table">
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
          {users.map((user) => (
            <tr key={user.id} onClick={() => onView?.(user)}>
              <td className="users-table__name">{formatUserName(user)}</td>
              <td>{formatUserEmail(user)}</td>
              <td>{formatUserRole(user)}</td>
              <td>
                <UserStatusBadge status={user.status} />
              </td>
              <td>{formatLastLogin(user)}</td>
              <td>
                <div className="students-table__actions">
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="View user"
                    title="View user"
                    disabled={!onView}
                    onClick={(event) => {
                      event.stopPropagation()
                      onView?.(user)
                    }}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action"
                    aria-label="Edit user"
                    title="Edit user"
                    disabled={!onEdit}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit?.(user)
                    }}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="students-table__action students-table__action--danger"
                    aria-label="Delete user"
                    title="Delete user"
                    disabled={!onDelete}
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete?.(user)
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

export default UsersTable