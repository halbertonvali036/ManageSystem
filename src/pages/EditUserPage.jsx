import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import UserForm from '@/components/users/UserForm'
import useUpdateUser from '@/hooks/useUpdateUser'
import useUser from '@/hooks/useUser'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toUserFormValues } from '@/utils/userForm'

function EditUserContent({ userId }) {
  const navigate = useNavigate()
  const { user, isLoading, error, refetch } = useUser(userId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateUser(userId)

  const handleCancel = () => {
    navigate(`/users/${userId}`)
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate(`/users/${userId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading user&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">User data is unavailable</h3>
          <p className="table-state__text">
            User data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load user</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="edit-user-page">
      <p className="page-description">
        Update the user account details below and save your changes.
      </p>
      <Card title="Edit User">
        <UserForm
          initialValues={toUserFormValues(user)}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
        />
      </Card>
    </div>
  )
}

function EditUserPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditUserContent key={id} userId={id} />
}

export default EditUserPage