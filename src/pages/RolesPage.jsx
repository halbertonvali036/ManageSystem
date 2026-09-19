import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import RolesTable from '@/components/roles/RolesTable'
import RolesToolbar from '@/components/roles/RolesToolbar'
import useDeleteRole from '@/hooks/useDeleteRole'
import useRoles from '@/hooks/useRoles'
import { formatRoleName } from '@/models/role'

function RolesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    ...(search ? { search } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { roles, isLoading, error, refetch } = useRoles(filters)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const { isDeleting, deleteError, deleteRole } = useDeleteRole(
    deleteTarget?.id,
  )

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const handleAddRole = () => {
    navigate('/roles/new')
  }

  const handleViewRole = (role) => {
    navigate(`/roles/${role.id}`)
  }

  const handleEditRole = (role) => {
    navigate(`/roles/${role.id}/edit`)
  }

  const handleDeleteRequest = (role) => {
    setDeleteTarget(role)
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null)
    }
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteRole()
    if (result.ok) {
      setDeleteTarget(null)
      refetch()
    }
  }

  return (
    <section className="page" aria-label="Roles">
      <p className="page-description">
        Define and manage user roles, their descriptions and access status.
      </p>
      <RolesToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        onAdd={handleAddRole}
      />
      <RolesTable
        roles={roles}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onView={handleViewRole}
        onEdit={handleEditRole}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete role"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Role"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        {deleteTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Role: <strong>{formatRoleName(deleteTarget)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </section>
  )
}

export default RolesPage