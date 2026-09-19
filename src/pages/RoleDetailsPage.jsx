import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import RoleProfile from '@/components/roles/RoleProfile'
import useDeleteRole from '@/hooks/useDeleteRole'
import useRole from '@/hooks/useRole'
import { formatRoleName } from '@/models/role'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <ShieldCheck className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">Role data is unavailable</h3>
        <p className="table-state__text">
          Role data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load role</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function RoleDetails({ roleId }) {
  const navigate = useNavigate()
  const { role, isLoading, error, refetch } = useRole(roleId)
  const { isDeleting, deleteError, deleteRole } = useDeleteRole(roleId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteConfirm = async () => {
    const result = await deleteRole()
    if (result.ok) {
      navigate('/roles', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading role details&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <UnavailableState />
    ) : (
      <ErrorState message={error.message} onRetry={refetch} />
    )
  }

  if (!role) {
    return null
  }

  return (
    <>
      <RoleProfile
        role={role}
        onBack={() => navigate('/roles')}
        onEdit={() => navigate(`/roles/${roleId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete role"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Role"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            Role: <strong>{formatRoleName(role)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function RoleDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <RoleDetails key={id} roleId={id} />
}

export default RoleDetailsPage