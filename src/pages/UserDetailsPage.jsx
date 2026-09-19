import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserCog } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import UserProfile from '@/components/users/UserProfile'
import useDeleteUser from '@/hooks/useDeleteUser'
import useUser from '@/hooks/useUser'
import useUserStatus from '@/hooks/useUserStatus'
import { USER_STATUS, formatUserEmail, formatUserName } from '@/models/user'
import { BackendNotConnectedError } from '@/services/httpClient'

function UnavailableState() {
  return (
    <Card>
      <div className="table-state">
        <UserCog className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">User data is unavailable</h3>
        <p className="table-state__text">
          User data will be available when the backend API is connected.
        </p>
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state">
        <h3 className="table-state__title">Failed to load user</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

const STATUS_DIALOGS = {
  activate: {
    title: 'Activate user',
    message: 'The user will be able to sign in again once activated.',
    confirmLabel: 'Activate User',
  },
  deactivate: {
    title: 'Deactivate user',
    message: 'The user will not be able to sign in until reactivated.',
    confirmLabel: 'Deactivate User',
  },
}

function UserDetails({ userId }) {
  const navigate = useNavigate()
  const { user, isLoading, error, refetch } = useUser(userId)
  const { isDeleting, deleteError, deleteUser } = useDeleteUser(userId)
  const { isUpdating, statusError, activate, deactivate } = useUserStatus(userId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [statusTarget, setStatusTarget] = useState(null)

  const handleDeleteConfirm = async () => {
    const result = await deleteUser()
    if (result.ok) {
      navigate('/users', { replace: true })
    }
  }

  const handleStatusConfirm = async () => {
    if (!statusTarget) {
      return
    }
    const result =
      statusTarget === 'activate' ? await activate() : await deactivate()
    if (result.ok) {
      setStatusTarget(null)
      refetch()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading user details&hellip;
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

  if (!user) {
    return null
  }

  const statusDialog = statusTarget ? STATUS_DIALOGS[statusTarget] : null

  return (
    <>
      <UserProfile
        user={user}
        onBack={() => navigate('/users')}
        onEdit={() => navigate(`/users/${userId}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
        onActivate={
          user.status === USER_STATUS.INACTIVE
            ? () => setStatusTarget('activate')
            : undefined
        }
        onDeactivate={
          user.status === USER_STATUS.ACTIVE
            ? () => setStatusTarget('deactivate')
            : undefined
        }
      />
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete user"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete User"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            User: <strong>{formatUserName(user)}</strong>
          </p>
          <p className="modal__target-row">
            Email: <strong>{formatUserEmail(user)}</strong>
          </p>
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        open={Boolean(statusDialog)}
        title={statusDialog?.title ?? 'Update status'}
        message={statusDialog?.message}
        confirmLabel={statusDialog?.confirmLabel ?? 'Confirm'}
        isConfirming={isUpdating}
        error={statusError}
        onConfirm={handleStatusConfirm}
        onCancel={() => setStatusTarget(null)}
      >
        <div className="modal__target">
          <p className="modal__target-row">
            User: <strong>{formatUserName(user)}</strong>
          </p>
          <p className="modal__target-row">
            Email: <strong>{formatUserEmail(user)}</strong>
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}

function UserDetailsPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <UserDetails key={id} userId={id} />
}

export default UserDetailsPage