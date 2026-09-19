import { Plus, Search, X } from 'lucide-react'
import { USER_STATUS } from '@/models/user'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.INACTIVE, label: 'Inactive' },
]

function UsersToolbar({
  search,
  onSearchChange,
  roles,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onAdd,
}) {
  const hasActiveFilters =
    search !== '' || roleFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="students-toolbar">
      <div className="students-toolbar__filters">
        <div className="search-input">
          <Search className="search-input__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="search-input__field"
            placeholder="Search name, email or username&hellip;"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search users"
          />
        </div>

        <select
          className="field-select"
          value={roleFilter}
          onChange={(event) => onRoleChange(event.target.value)}
          aria-label="Filter by role"
          disabled={roles.length === 0}
          title={
            roles.length === 0 ? 'No roles available yet' : 'Filter by role'
          }
        >
          <option value="all">All roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name ?? role.code ?? 'Role'}
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
        Add User
      </button>
    </div>
  )
}

export default UsersToolbar