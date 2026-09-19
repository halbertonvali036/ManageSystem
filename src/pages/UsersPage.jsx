import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import UsersTable from '@/components/users/UsersTable'
import UsersToolbar from '@/components/users/UsersToolbar'
import useDeleteUser from '@/hooks/useDeleteUser'
import useRoles from '@/hooks/useRoles'
import useUsers from '@/hooks/useUsers'
import { formatUserEmail, formatUserName } from '@/models/user'

function UsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { roles } = useRoles()

  const filters = {
    ...(search ? { search } : {}),
    ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { users, isLoading, error, refetch } = useUsers(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteUser } = useDeleteUser(
    deleteTarget?.id,
  )

  const handleClearFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const handleAddUser = () => {
    navigate('/users/new')
  }

  const handleViewUser = (user) => {
    navigate(`/users/${user.id}`)
  }

  const handleEditUser = (user) => {
    navigate(`/users/${user.id}/edit`)
  }

  const handleDeleteRequest = (user) => {
    setDeleteTarget(user)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteUser()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <section className="page" aria-label="Users">
      <p className="page-description">
        Manage user accounts and their access. Search by name or email and
        filter by role or status to find the right account.
      </p>
      <UsersToolbar
        search={search}
        onSearchChange={setSearch}
        roles={roles}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        onAdd={handleAddUser}
      />
      <UsersTable
        users={users}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete User"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              User: <strong>{formatUserName(deleteTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Email: <strong>{formatUserEmail(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

export default UsersPage